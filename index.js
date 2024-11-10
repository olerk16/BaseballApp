const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { graphqlHTTP } = require('express-graphql');
const { schema } = require('./schema'); 
const { createClient } = require('redis');
const { KinesisClient, PutRecordCommand } = require('@aws-sdk/client-kinesis');
const generateMockPitchData = require('./mockPitchingData');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const redisClient = createClient({
  url: 'redis://127.0.0.1:6379', 
});

redisClient.on('error', (error) => console.error("Redis Client Error:", error));
redisClient.on('connect', () => console.log('Connected to Redis'));

(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
})();

const kinesis = new KinesisClient({ region: 'us-east-1' });
const sendDataToKinesis = async (data) => {
  try {
    await kinesis.send(new PutRecordCommand({
      Data: JSON.stringify(data),
      PartitionKey: 'performance',
      StreamName: 'player_metrics_stream',
    }));
  } catch (error) {
    console.error("Error sending data to Kinesis:", error, data);
  }
};

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true, 
}));

wss.on('connection', (ws) => {
  const playerId = "test_player1"; 

  const intervalId = setInterval(async () => {
    try {
      const pitchData = generateMockPitchData(playerId);

      await redisClient.sendCommand(['HINCRBY', `pitcher:${pitchData.playerId}`, 'totalPitches', '1']);
      if (pitchData.pitchMet) {
        await redisClient.sendCommand(['HINCRBY', `pitcher:${pitchData.playerId}`, 'pitchesMetTarget', '1']);
      }

      await redisClient.sendCommand(['HINCRBY', `pitcher:${pitchData.playerId}:pitchType:${pitchData.pitchType}`, 'totalPitches', '1']);
      if (pitchData.pitchMet) {
        await redisClient.sendCommand(['HINCRBY', `pitcher:${pitchData.playerId}:pitchType:${pitchData.pitchType}`, 'successfulPitches', '1']);
      }

      // Retrieve counts for pitch type success calculations
      const pitchTypes = ["fastball", "curveball", "slider", "changeup"];
      const pitchTypeSuccess = await Promise.all(pitchTypes.map(async (type) => {
        const total = await redisClient.hGet(`pitcher:${pitchData.playerId}:pitchType:${type}`, 'totalPitches') || 0;
        const successful = await redisClient.hGet(`pitcher:${pitchData.playerId}:pitchType:${type}`, 'successfulPitches') || 0;
        const successRate = total > 0 ? successful / total : 0;
        
        return {
          pitchType: type,
          totalPitches: Number(total),
          successfulPitches: Number(successful),
          successRate: parseFloat(successRate.toFixed(2))
        };
      }));

      ws.send(JSON.stringify({
        type: 'pitchUpdate',
        data: {
          playerId: pitchData.playerId,
          totalPitches: Number(await redisClient.hGet(`pitcher:${pitchData.playerId}`, 'totalPitches')),
          speed: pitchData.speed,
          pitchType: pitchData.pitchType,
          pitchMet: pitchData.pitchMet,
          targetLocation: pitchData.targetLocation,
          accuracy: Number(await redisClient.hGet(`pitcher:${pitchData.playerId}`, 'pitchesMetTarget')) / (await redisClient.hGet(`pitcher:${pitchData.playerId}`, 'totalPitches') || 1),
          pitchTypeSuccess
        }
      }));

    } catch (error) {
      console.error("Error during mock data generation or Redis interaction:", error);
    }
  }, 3000);

  // Clean up on client disconnect
  ws.on('close', () => {
    clearInterval(intervalId);
    console.log('Client disconnected, stopped sending mock data.');
  });
});


server.listen(4000, () => {
  console.log('Server listening on http://localhost:4000');
});

const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { graphqlHTTP } = require('express-graphql');
const { schema } = require('./schema'); 
const Redis = require('redis');
const { KinesisClient, PutRecordCommand } = require('@aws-sdk/client-kinesis');
const generateMockData = require('./mockPitchingData');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const redisClient = Redis.createClient();

redisClient.on('error', (error) => console.error("Redis Client Error", error));
redisClient.on('connect', () => console.log('Connected to Redis'));

const kinesis = new KinesisClient({ region: 'us-east-1' });
const sendDataToKinesis = async (data) => {
  try {
    await kinesis.send(new PutRecordCommand({
      Data: JSON.stringify(data),
      PartitionKey: 'performance',
      StreamName: 'player_metrics_stream',
    }));
  } catch (error) {
    console.error("Error sending data to Kinesis", error);
  }
};

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true, 
}));

// wss.on('connection', (ws) => {
//   ws.on('message', async (message) => {
//     console.log(`Received: ${message}`);
//     const pitchData = JSON.parse(message);
//     const { playerId, pitchType, speed, pitchMet, targetLocation } = pitchData;

//     await redisClient.hincrby(`pitcher:${playerId}`, 'totalPitches', 1);

//     if (pitchMet) {
//         await redisClient.hincrby(`pitcher:${playerId}`, 'pitchesMetTarget', 1);
//       }

//     await redisClient.hset(`pitcher:${playerId}`, 'speed', speed);
//     await redisClient.hset(`pitcher:${playerId}`, 'pitchMet', pitchType);
//     await redisClient.hset(`pitcher:${playerId}`, 'targetLocation', targetLocation);

//       // Retrieve the updated counts from Redis
//       const totalPitches = await redisClient.hget(`pitcher:${playerId}`, 'totalPitches');
//       const pitchesMetTarget = await redisClient.hget(`pitcher:${playerId}`, 'pitchesMetTarget');

//       // Calculate accuracy as a ratio
//       const accuracy = totalPitches > 0 ? pitchesMetTarget / totalPitches : 0;

//     ws.send(JSON.stringify({
//         type: 'pitchUpdate',
//         data: { playerId, totalPitches, speed, pitchType, pitchMet, targetLocation, accuracy }
//     }));
//     // Send data to Kinesis for real-time analytics
//     await sendDataToKinesis({ playerId, speed, pitchType, pitchMet, targetLocation, accuracy });
// });
// });

wss.on('connection', (ws) => {
    console.log('Client connected');

    const intervalId = setInterval(() => {
        const mockData = generateMockData(); 
        
        ws.send(JSON.stringify({
            type: 'pitchUpdate',
            data: mockData,
        }));
    }, 3000);

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(intervalId); // Stop sending data when the client disconnects
    });
});



redisClient.on('connect', () => console.log('Connected to Redis'));

server.listen(4000, () => {
  console.log('Server listening on http://localhost:4000');
});

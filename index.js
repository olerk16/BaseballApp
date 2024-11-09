const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { graphqlHTTP } = require('express-graphql');
const { schema } = require('./schema'); 
const Redis = require('redis');
const { KinesisClient, PutRecordCommand } = require('@aws-sdk/client-kinesis');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const redisClient = Redis.createClient();

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

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    console.log(`Received: ${message}`);
    const pitchData = JSON.parse(message);
    const { playerId, pitchCount, speed } = pitchData;


    redisClient.hincrby(`pitcher:${playerId}`, 'pitchCount', 1);
    redisClient.hset(`pitcher:${playerId}`, 'speed', speed);
    redisClient.hset(`pitcher:${playerId}`, 'pitchMet', pitchMet);
    redisClient.hset(`pitcher:${playerId}`, 'targetLocation', targetLocation);

    ws.send(JSON.stringify({
        type: 'pitchUpdate',
        data: { playerId, pitchCount, speed, pitchType, pitchMet, targetLocation }
    }));
    // Send data to Kinesis for real-time analytics
    await sendDataToKinesis({ playerId, pitchCount, speed, pitchType, pitchMet, targetLocation });
});
});

redisClient.on('connect', () => console.log('Connected to Redis'));

server.listen(4000, () => {
  console.log('Server listening on http://localhost:4000');
});

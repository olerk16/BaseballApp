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
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
  });

  // Send data periodically
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'liveMetricUpdate', data: { playerId: '1', score: Math.random() * 100 } }));
  }, 5000);
});

redisClient.on('connect', () => console.log('Connected to Redis'));

server.listen(4000, () => {
  console.log('Server listening on http://localhost:4000');
});

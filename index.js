require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { graphqlHTTP } = require('express-graphql');
const { createClient } = require('redis');
const { KinesisClient, PutRecordCommand } = require('@aws-sdk/client-kinesis');
const { schema } = require('./schema');
const generateMockPitchData = require('./mockPitchingData');
const { connectToMongoDB, recordPitchData, getAggregatedStats } = require('./mongoService');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));

connectToMongoDB();

// Redis Client Setup
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
redisClient.on('error', (error) => console.error("Redis Client Error:", error));
redisClient.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(console.error);

// Kinesis Client Setup
const kinesis = new KinesisClient({ region: 'us-east-1' });
async function sendToKinesis(data) {
  try {
    await kinesis.send(new PutRecordCommand({
      Data: JSON.stringify(data),
      PartitionKey: 'performance',
      StreamName: process.env.KINESIS_STREAM_NAME || 'player_metrics_stream',
    }));
    console.log("Data sent to Kinesis successfully.");
  } catch (error) {
    console.error("Error sending data to Kinesis:", error, data);
  }
}

// GraphQL Endpoint
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

function setupWebSocket() {
  wss.on('connection', (ws) => {
    const playerId = "test_player1"; 
    const intervalId = setInterval(() => sendPitchData(ws, playerId), 3000);

    ws.on('close', () => {
      clearInterval(intervalId);
      console.log('Client disconnected, stopped sending mock data.');
    });
  });
}

async function sendPitchData(ws, playerId) {
  try {
    const pitchData = generateMockPitchData(playerId);
    await recordPitchData(pitchData); // Save to MongoDB
    await updateRedisMetrics(pitchData);

    const pitchTypeSuccess = await calculatePitchTypeSuccess(playerId);
    const totalPitches = await redisClient.hGet(`pitcher:${playerId}`, 'totalPitches');
    const pitchesMetTarget = await redisClient.hGet(`pitcher:${playerId}`, 'pitchesMetTarget');
    const accuracy = totalPitches > 0 ? pitchesMetTarget / totalPitches : 0;

    ws.send(JSON.stringify({
      type: 'pitchUpdate',
      data: {
        playerId,
        totalPitches: Number(totalPitches),
        speed: pitchData.speed,
        pitchType: pitchData.pitchType,
        pitchMet: pitchData.pitchMet,
        targetLocation: pitchData.targetLocation,
        accuracy,
        pitchTypeSuccess,
      },
    }));
  } catch (error) {
    console.error("Error during mock data generation or Redis interaction:", error);
  }
}

// Update Redis Metrics
async function updateRedisMetrics(pitchData) {
  try {
    await redisClient.hIncrBy(`pitcher:${pitchData.playerId}`, 'totalPitches', 1);
    if (pitchData.pitchMet) await redisClient.hIncrBy(`pitcher:${pitchData.playerId}`, 'pitchesMetTarget', 1);
    await redisClient.hIncrBy(`pitcher:${pitchData.playerId}:pitchType:${pitchData.pitchType}`, 'totalPitches', 1);
    if (pitchData.pitchMet) await redisClient.hIncrBy(`pitcher:${pitchData.playerId}:pitchType:${pitchData.pitchType}`, 'successfulPitches', 1);
  } catch (error) {
    console.error("Error updating Redis metrics:", error);
  }
}

// Calculate Pitch Type Success
async function calculatePitchTypeSuccess(playerId) {
  const pitchTypes = ["fastball", "curveball", "slider", "changeup"];
  return await Promise.all(pitchTypes.map(async (type) => {
    try {
      const total = await redisClient.hGet(`pitcher:${playerId}:pitchType:${type}`, 'totalPitches') || 0;
      const successful = await redisClient.hGet(`pitcher:${playerId}:pitchType:${type}`, 'successfulPitches') || 0;
      const successRate = total > 0 ? successful / total : 0;
      return {
        pitchType: type,
        totalPitches: Number(total),
        successfulPitches: Number(successful),
        successRate: parseFloat(successRate.toFixed(2)),
      };
    } catch (error) {
      console.error(`Error calculating success for pitch type ${type}:`, error);
      return null; // handle potential null values on the frontend
    }
  }));
}

setupWebSocket();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

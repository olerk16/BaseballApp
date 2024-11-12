const mongoose = require('mongoose');
const Pitch = require('./models/Pitch');

const MONGODB_URI = process.env.MONGODB_URI;

async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

async function recordPitchData(pitchData) {
  const pitch = new Pitch({
    playerId: pitchData.playerId,
    pitchType: pitchData.pitchType,
    speed: pitchData.speed,
    pitchMet: pitchData.pitchMet,
    targetLocation: pitchData.targetLocation,
    dateTime: new Date(),
  });
  await pitch.save();
}

async function getAggregatedStats(playerId, timeFrame) {
    const timeRanges = {
      weekly: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      monthly: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      season: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    };
    const startDate = timeRanges[timeFrame] || new Date();
  
    const pipeline = [
      { $match: { playerId, dateTime: { $gte: startDate } } },
      {
        $group: {
          _id: "$pitchType",
          totalPitches: { $sum: 1 },
          avgSpeed: { $avg: "$speed" },
          successfulPitches: { $sum: { $cond: ["$pitchMet", 1, 0] } },
        },
      },
      {
        $project: {
          pitchType: "$_id",
          totalPitches: 1,
          avgSpeed: 1,
          successRate: {
            $cond: [{ $eq: ["$totalPitches", 0] }, 0, { $divide: ["$successfulPitches", "$totalPitches"] }],
          },
        },
      },
    ];
  
    const pitchTypeStats = await Pitch.aggregate(pipeline); 
  
    const overallStatsPipeline = [
      { $match: { playerId, dateTime: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalPitches: { $sum: 1 },
          avgSpeed: { $avg: "$speed" },
          successfulPitches: { $sum: { $cond: ["$pitchMet", 1, 0] } },
        },
      },
      {
        $project: {
          totalPitches: 1,
          avgSpeed: 1,
          accuracyRate: {
            $cond: [{ $eq: ["$totalPitches", 0] }, 0, { $divide: ["$successfulPitches", "$totalPitches"] }],
          },
        },
      },
    ];
  
    const overallStats = await Pitch.aggregate(overallStatsPipeline);

return {
  playerId,
  timeFrame,
  totalPitches: overallStats[0]?.totalPitches || 0,
  avgSpeed: overallStats[0]?.avgSpeed || 0,
  accuracyRate: overallStats[0]?.accuracyRate || 0,
  pitchTypeStats: pitchTypeStats || [], 
};
  }
  

module.exports = {
  connectToMongoDB,
  recordPitchData,
  getAggregatedStats,
};

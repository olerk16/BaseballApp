require('dotenv').config();
const mongoose = require('mongoose');
const Pitch = require('./models/Pitch');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/baseballApp';

async function connectToMongoDB() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');
}

async function populateData() {
  try {

    await connectToMongoDB();

    const playerId = 'test_player1';

    const pitchTypes = ['fastball', 'curveball', 'slider', 'changeup'];
    const targetLocations = [
      'top-right', 'top-center', 'top-left', 
      'center-right', 'center-left', 'center', 
      'low-right', 'low-center', 'low-left'
    ];

    const samplePitches = Array.from({ length: 50 }).map(() => {
      return {
        playerId,
        pitchType: pitchTypes[Math.floor(Math.random() * pitchTypes.length)],
        speed: Math.floor(Math.random() * 20) + 80, 
        pitchMet: Math.random() > 0.3, // 70% chance the pitch met the target
        targetLocation: targetLocations[Math.floor(Math.random() * targetLocations.length)],
        dateTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date within the past month
      };
    });

    await Pitch.insertMany(samplePitches);
    console.log('Sample data has been populated');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error populating data:', error);
  }
}

populateData();

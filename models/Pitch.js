const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PitchSchema = new Schema({
  playerId: { type: String, required: true },
  pitchType: { type: String, enum: ['fastball', 'curveball', 'slider', 'changeup'], required: true },
  speed: { type: Number, required: true },
  pitchMet: { type: Boolean, required: true },
  targetLocation: { type: String, required: true },
  dateTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pitch', PitchSchema);

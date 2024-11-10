function generateMockPitchData(playerId) {
    const pitchTypes = ["fastball", "curveball", "slider", "changeup"];
    const targetLocations = [
      "top-right", "top-center", "top-left",
      "center-right", "center-left", "center",
      "low-right", "low-center", "low-left"
    ];
  
    const pitchType = pitchTypes[Math.floor(Math.random() * pitchTypes.length)];
    const speed = Math.floor(Math.random() * 20) + 80; 
    const pitchMet = Math.random() > 0.3; // 70% chance the pitch met the target
    const targetLocation = targetLocations[Math.floor(Math.random() * targetLocations.length)];
    
    return {
      playerId,
      pitchType,
      speed,
      pitchMet,
      targetLocation,
    };
  }
  

module.exports = generateMockPitchData;

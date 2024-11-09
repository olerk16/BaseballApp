function generateMockData() {
    const playerId = 35;
    const totalPitches = Math.floor(Math.random() * 100) + 1;       // Random pitch count between 1 and 100
    const speed = Math.random() * 30 + 70;                          // Random speed between 70 and 100 mph
    const pitchTypes = ['Fastball', 'Curveball', 'Slider', 'Changeup'];
    const pitchType = pitchTypes[Math.floor(Math.random() * pitchTypes.length)]; // Random pitch type
    const pitchMet = Math.random() > 0.5 ? 'yes' : 'no';            
    const targetLocations = ['inside', 'outside', 'high', 'low'];
    const targetLocation = targetLocations[Math.floor(Math.random() * targetLocations.length)];
    const accuracy = Math.round(Math.random() * 100);               // Random accuracy percentage

    return {
        playerId,
        totalPitches,
        speed: speed.toFixed(1), 
        pitchType,
        pitchMet,
        targetLocation,
        accuracy
    };
}

module.exports = generateMockData;

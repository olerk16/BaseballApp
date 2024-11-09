import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'pitchUpdate') {
        setData(message.data);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="App">
      <h1>Real-Time Pitching Metrics</h1>
      {data ? (
        <div className="metrics">
          <p><strong>Player ID:</strong> {data.playerId}</p>
          <p><strong>Total Pitches:</strong> {data.totalPitches}</p>
          <p><strong>Pitch Speed:</strong> {data.speed} mph</p>
          <p><strong>Pitch Type:</strong> {data.pitchType}</p>
          <p><strong>Target Location:</strong> {data.targetLocation}</p>
          <p><strong>Accuracy:</strong> {(data.accuracy * 100).toFixed(2)}%</p>
          <p><strong>Hit Target:</strong> {data.pitchMet ? 'Yes' : 'No'}</p>
        </div>
      ) : (
        <p>Waiting for data...</p>
      )}
    </div>
  );
}

export default App;

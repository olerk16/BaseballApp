import React, { useEffect, useState } from 'react';
import PlayerStats from './components/PlayerStats'; 
import './App.css';

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
        <>
          <div className="metrics">
            <h2>General Pitch Metrics</h2>
            <p><strong>Player ID:</strong> {data.playerId}</p>
            <p><strong>Total Pitches:</strong> {data.totalPitches}</p>
            <p><strong>Pitch Speed:</strong> {data.speed} mph</p>
            <p><strong>Pitch Type:</strong> {data.pitchType}</p>
            <p><strong>Target Location:</strong> {data.targetLocation}</p>
            <p><strong>Accuracy:</strong> {(data.accuracy * 100).toFixed(2)}%</p>
            <p><strong>Hit Target:</strong> {data.pitchMet ? 'Yes' : 'No'}</p>

            <h2>Pitch Type Success</h2>
            {data.pitchTypeSuccess ? (
              <table>
                <thead>
                  <tr>
                    <th>Pitch Type</th>
                    <th>Total Pitches</th>
                    <th>Successful Pitches</th>
                    <th>Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pitchTypeSuccess.map((pitch) => (
                    <tr key={pitch.pitchType}>
                      <td>{pitch.pitchType}</td>
                      <td>{pitch.totalPitches}</td>
                      <td>{pitch.successfulPitches}</td>
                      <td>{(pitch.successRate * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No pitch type success data available</p>
            )}
          </div>
          <PlayerStats playerId={data.playerId} />
        </>
      ) : (
        <p>Waiting for data...</p>
      )}
    </div>
  );
}

export default App;

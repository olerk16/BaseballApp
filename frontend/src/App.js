import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'liveMetricUpdate') {
        setData(message.data);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="App">
      <h1>In-Game Player Metrics</h1>
      {data ? (
        <div>
          <p>Player ID: {data.playerId}</p>
          <p>Score: {data.score}</p>
        </div>
      ) : (
        <p>No data yet...</p>
      )}
    </div>
  );
}

export default App;

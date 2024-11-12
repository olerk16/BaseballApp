import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { AGGREGATED_STATS_QUERY } from './queries';
import './PlayerStats.css';

function PlayerStats({ playerId }) {
  const [timeFrame, setTimeFrame] = useState('weekly');
  const { data, loading, error } = useQuery(AGGREGATED_STATS_QUERY, {
    variables: { playerId, timeFrame },
  });

  console.log("Query Data:", data);

  if (loading) return <p className="loading-message">Loading player stats...</p>;
  if (error) return <p className="error-message">Error loading data: {error.message}</p>;
  if (!data || !data.aggregatedStats) return <p className="error-message">No stats available for this player.</p>;

  const { aggregatedStats } = data;

  return (
    <div className="player-stats-container">
      <h1>Player Stats ({timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)})</h1>
      
      <label htmlFor="timeframe-select">Select Time Frame: </label>
      <select
        id="timeframe-select"
        onChange={(e) => setTimeFrame(e.target.value)}
        value={timeFrame}
      >
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="season">Season</option>
      </select>
      
      <div className="aggregated-stats">
        <p><strong>Total Pitches:</strong> {aggregatedStats.totalPitches ?? 'N/A'}</p>
        <p><strong>Average Speed:</strong> {(aggregatedStats.avgSpeed != null ? aggregatedStats.avgSpeed.toFixed(2) : 'N/A')} mph</p>
        <p><strong>Accuracy Rate:</strong> {(aggregatedStats.accuracyRate != null ? (aggregatedStats.accuracyRate * 100).toFixed(2) : 'N/A')}%</p>
      </div>

      <h2>Pitch Type Stats</h2>
      <table>
        <thead>
          <tr>
            <th>Pitch Type</th>
            <th>Total Pitches</th>
            <th>Success Rate</th>
          </tr>
        </thead>
        <tbody>
          {(aggregatedStats.pitchTypeStats && aggregatedStats.pitchTypeStats.length > 0) ? (
            aggregatedStats.pitchTypeStats.map((typeStat) => (
              <tr key={typeStat.pitchType}>
                <td>{typeStat.pitchType}</td>
                <td>{typeStat.totalPitches ?? 'N/A'}</td>
                <td>{typeStat.successRate != null ? (typeStat.successRate * 100).toFixed(2) : 'N/A'}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No pitch type stats available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PlayerStats;

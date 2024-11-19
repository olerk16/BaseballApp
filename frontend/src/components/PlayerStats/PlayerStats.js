import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { AGGREGATED_STATS_QUERY } from '../queries';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';

function PlayerStats({ playerId }) {
  const [timeFrame, setTimeFrame] = useState('weekly');
  const { data, loading, error } = useQuery(AGGREGATED_STATS_QUERY, {
    variables: { playerId, timeFrame },
  });

  if (loading) return <CircularProgress />;
  if (error) return <Typography>Error: {error.message}</Typography>;
  if (!data || !data.aggregatedStats)
    return <Typography>No stats available for this player.</Typography>;

  const { aggregatedStats } = data;

  return (
    <Box mt={3}>
      <Paper elevation={3} style={{ padding: '20px' }}>
        <Typography variant="h6">Player Stats ({timeFrame})</Typography>
        <Select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          style={{ marginBottom: '20px' }}
        >
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="season">Season</MenuItem>
        </Select>
        <Box mb={2}>
          <Typography>Total Pitches: {aggregatedStats.totalPitches}</Typography>
          <Typography>
            Average Speed: {aggregatedStats.avgSpeed.toFixed(2)} mph
          </Typography>
          <Typography>
            Accuracy Rate: {(aggregatedStats.accuracyRate * 100).toFixed(2)}%
          </Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pitch Type</TableCell>
              <TableCell>Total Pitches</TableCell>
              <TableCell>Success Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {aggregatedStats.pitchTypeStats.map((stat) => (
              <TableRow key={stat.pitchType}>
                <TableCell>{stat.pitchType}</TableCell>
                <TableCell>{stat.totalPitches}</TableCell>
                <TableCell>
                  {stat.successRate ? (stat.successRate * 100).toFixed(2) : 'N/A'}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default PlayerStats;

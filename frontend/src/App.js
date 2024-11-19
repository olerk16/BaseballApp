import React, { useEffect, useState } from 'react';
import PlayerStats from './components/PlayerStats/PlayerStats';
import PitchAccuracyChart from './components/PitchAccuracyChart/PitchAccuracyChart';

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
} from '@mui/material';
import './App.css';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'pitchUpdate') {
          setData(message.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Real-Time Pitching Metrics</Typography>
        </Toolbar>
      </AppBar>
      <Container>
        {data ? (
          <Box my={4}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="h5">General Pitch Metrics</Typography>
              <Typography>
                <strong>Player ID:</strong> {data.playerId ?? 'N/A'}
              </Typography>
              <Typography>
                <strong>Total Pitches:</strong> {data.totalPitches ?? 'N/A'}
              </Typography>
              <Typography>
                <strong>Pitch Speed:</strong> {data.speed ?? 'N/A'} mph
              </Typography>
              <Typography>
                <strong>Pitch Type:</strong> {data.pitchType ?? 'N/A'}
              </Typography>
              <Typography>
                <strong>Target Location:</strong> {data.targetLocation ?? 'N/A'}
              </Typography>
              <Typography>
                <strong>Accuracy:</strong>{' '}
                {(data.accuracy ? data.accuracy * 100 : 0).toFixed(2)}%
              </Typography>
              <Typography>
                <strong>Hit Target:</strong> {data.pitchMet ? 'Yes' : 'No'}
              </Typography>
            </Paper>
            <Box mt={3}>
              <Typography variant="h6">Pitch Type Success</Typography>
              {data.pitchTypeSuccess ? (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Pitch Type</TableCell>
                      <TableCell>Total Pitches</TableCell>
                      <TableCell>Successful Pitches</TableCell>
                      <TableCell>Success Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.pitchTypeSuccess.map((pitch) => (
                      <TableRow key={pitch.pitchType}>
                        <TableCell>{pitch.pitchType}</TableCell>
                        <TableCell>{pitch.totalPitches}</TableCell>
                        <TableCell>{pitch.successfulPitches}</TableCell>
                        <TableCell>
                          {(pitch.successRate * 100).toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography>No pitch type success data available</Typography>
              )}
            </Box>
            <Box mt={4}>
              <PitchAccuracyChart
                data={
                  data.pitchTypeSuccess
                    ? data.pitchTypeSuccess.map((pitch) => ({
                        date: new Date(), // Replace with real dates if available
                        accuracy: pitch.successRate,
                      }))
                    : []
                }
              />
            </Box>
            <PlayerStats playerId={data.playerId} />
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress />
          </Box>
        )}
      </Container>
    </div>
  );
}

export default App;

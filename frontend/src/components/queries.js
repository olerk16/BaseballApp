import { gql } from '@apollo/client';

export const AGGREGATED_STATS_QUERY = gql`
  query GetAggregatedStats($playerId: String!, $timeFrame: String!) {
    aggregatedStats(playerId: $playerId, timeFrame: $timeFrame) {
      playerId
      timeFrame
      totalPitches
      avgSpeed
      accuracyRate
      pitchTypeStats {
        pitchType
        totalPitches
        successRate
      }
    }
  }
`;
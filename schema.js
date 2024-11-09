const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLBoolean, GraphQLFloat } = require('graphql');

const PitchTypeSuccessType = new GraphQLObjectType({
    name: 'PitchTypeSuccess',
    fields: {
      pitchType: { type: GraphQLString },
      totalPitches: { type: GraphQLInt },
      successfulPitches: { type: GraphQLInt },
      successRate: { type: GraphQLFloat },
    },
  });

const PitchDataType = new GraphQLObjectType({
    name: 'PitchData',
    fields: {
      pitchId: { type: GraphQLString },
      playerId: { type: GraphQLString },
      pitchCount: { type: GraphQLInt },
      speed: { type: GraphQLInt },
      pitchType: { type: GraphQLString }, // fastball, curveball, ect...
      pitchMet: { type: GraphQLBoolean },
      targetLocation: { type: GraphQLString }, // top-right, top-center, top-left, center-left, center-right center low-center, low-right, low-left
      dateTime: { type: GraphQLString }
    },
  });

  const PlayerMetricsType = new GraphQLObjectType({
    name: 'PlayerMetrics',
    fields: {
      playerId: { type: GraphQLString },
      totalPitches: { type: GraphQLInt },
      pitchesMetTarget: { type: GraphQLInt },
      accuracy: { type: GraphQLFloat },
      pitchTypeSuccess: { type: GraphQLList(PitchTypeSuccessType) }, // Success metrics by pitch type
    },
  });

  const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      playerMetrics: {
        type: PlayerMetricsType,
        args: { playerId: { type: GraphQLString } },
        async resolve(parent, args) {
          try {
            // Fetch general metrics
            const totalPitches = await redisClient.hget(`pitcher:${args.playerId}`, 'totalPitches') || 0;
            const pitchesMetTarget = await redisClient.hget(`pitcher:${args.playerId}`, 'pitchesMetTarget') || 0;
            const accuracy = totalPitches > 0 ? pitchesMetTarget / totalPitches : 0;
  
            // Fetch pitch type-specific metrics
            const pitchTypes = ["fastball", "curveball", "slider"];
            const pitchTypeSuccess = await Promise.all(pitchTypes.map(async (type) => {
              const total = await redisClient.hget(`pitcher:${args.playerId}:pitchType:${type}`, 'totalPitches') || 0;
              const successful = await redisClient.hget(`pitcher:${args.playerId}:pitchType:${type}`, 'successfulPitches') || 0;
              const successRate = total > 0 ? successful / total : 0;
  
              return {
                pitchType: type,
                totalPitches: Number(total),
                successfulPitches: Number(successful),
                successRate: parseFloat(successRate.toFixed(2)),
              };
            }));
  
            return { playerId: args.playerId, totalPitches: Number(totalPitches), pitchesMetTarget: Number(pitchesMetTarget), accuracy, pitchTypeSuccess };
          } catch (error) {
            console.error("Error fetching player metrics:", error);
            throw new Error("Failed to fetch player metrics.");
          }
        },
      },
    },
  });

module.exports.schema = new GraphQLSchema({
  query: RootQuery,
});

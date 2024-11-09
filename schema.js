const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLBoolean, GraphQLFloat } = require('graphql');

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
      accuracy: { type: GraphQLFloat }
    },
  });

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    playerMetrics: {
        type: PlayerMetricsType,
        args: { playerId: { type: GraphQLString } },
        async resolve(parent, args) {
          // Retrieve values from Redis
        try {
          const totalPitches = await redisClient.hget(`pitcher:${args.playerId}`, 'totalPitches');
          const pitchesMetTarget = await redisClient.hget(`pitcher:${args.playerId}`, 'pitchesMetTarget');
          const accuracy = totalPitches > 0 ? (pitchesMetTarget / totalPitches).toFixed(2) : 0;
  
          return {
            playerId: args.playerId,
            totalPitches: Number(totalPitches),
            pitchesMetTarget: Number(pitchesMetTarget),
            accuracy: parseFloat(accuracy)
          };
        } catch (error) {
          console.error("Error fetching player metrics:", error);
          throw new Error("Failed to fetch player metrics.");
        }
    },
    pitchData: {
      type: PitchDataType,
      args: { playerId: { type: GraphQLString } },
      resolve(parent, args) {
        // Retrieve data from DynamoDB or Redis
        return { playerId: args.playerId, pitchCount: 42, pitchMet: true }; // Mock data
      },
      },
    },
  },
});

module.exports.schema = new GraphQLSchema({
  query: RootQuery,
});

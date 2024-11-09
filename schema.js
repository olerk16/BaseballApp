const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt } = require('graphql');

const PlayerMetricType = new GraphQLObjectType({
  name: 'PlayerMetric',
  fields: {
    playerId: { type: GraphQLString },
    score: { type: GraphQLInt },
  },
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    playerMetric: {
      type: PlayerMetricType,
      args: { playerId: { type: GraphQLString } },
      resolve(parent, args) {
        // Retrieve data from DynamoDB or Redis here
        return { playerId: args.playerId, score: 42 }; // Mock data
      },
    },
  },
});

module.exports.schema = new GraphQLSchema({
  query: RootQuery,
});

const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt } = require('graphql');

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

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
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

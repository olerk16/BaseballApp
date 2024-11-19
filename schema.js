const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLList } = require('graphql');
const getAggregatedStats = require('./mongoService').getAggregatedStats;

const PitchTypeStatsType = new GraphQLObjectType({
  name: 'PitchTypeStats',
  fields: {
    pitchType: { type: GraphQLString },
    totalPitches: { type: GraphQLInt },
    successRate: { type: GraphQLFloat },
    dateTime: { type: GraphQLString },
  }
});

const AggregatedStatsType = new GraphQLObjectType({
  name: 'AggregatedStats',
  fields: {
    playerId: { type: GraphQLString },
    timeFrame: { type: GraphQLString },
    totalPitches: { type: GraphQLInt },
    avgSpeed: { type: GraphQLFloat },
    accuracyRate: { type: GraphQLFloat },
    pitchTypeStats: { type: new GraphQLList(PitchTypeStatsType) } // List of pitch type stats
  }
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    aggregatedStats: {
      type: AggregatedStatsType,
      args: {
        playerId: { type: GraphQLString },
        timeFrame: { type: GraphQLString }
      },
      async resolve(parent, args) {

        const stats = await getAggregatedStats(args.playerId, args.timeFrame);
        return stats;
      }
    }
  }
});

module.exports.schema = new GraphQLSchema({
  query: RootQuery,
});

import {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType
} from 'graphql';

export default new GraphQLObjectType({
  name: 'PeriodMetric',
  fields: {
    start: { type: GraphQLString },
    startUTC: { type: GraphQLString },
    period: { type: GraphQLInt },
    value: { type: GraphQLInt },
  }
});

import {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType
} from 'graphql';

export default new GraphQLObjectType({
  name: 'UsersOnlineMetric',
  fields: {
    evaluatedTime: { type: GraphQLString },
    firmCount: { type: GraphQLInt },
    userCount: { type: GraphQLInt },
    sessionCount: { type: GraphQLInt },
    maxDuration: { type: GraphQLInt, description: 'Max session duration [minutes]' },
    newsTime: { type: GraphQLString },
    unit: { type: GraphQLString }
  }
});

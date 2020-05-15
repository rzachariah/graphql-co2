import {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType
} from 'graphql';

export default new GraphQLObjectType({
  name: 'Stat',
  fields: {
    key: { type: GraphQLString },
    requests: { type: GraphQLInt },
    min: { type: GraphQLInt },
    avg: { type: GraphQLInt },
    max: { type: GraphQLInt },
    total: { type: GraphQLInt },
    earliest: { type: GraphQLString },
    latest: { type: GraphQLString },
  }
});

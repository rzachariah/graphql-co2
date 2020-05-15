import {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType
} from 'graphql';

export default new GraphQLObjectType({
  name: 'ApiMetric',
  fields: {
    url: { type: GraphQLString },
    latency: { type: GraphQLInt },
    time: { type: GraphQLString },
    product: { type: GraphQLString },
    environment: { type: GraphQLString },
    service: { type: GraphQLString },
    host: { type: GraphQLString },
    pathname: { type: GraphQLString },
    query: { type: GraphQLString }
  }
});

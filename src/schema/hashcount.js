import {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType
} from 'graphql';

export default new GraphQLObjectType({
  name: 'HashCount',
  fields: {
    hash: { type: GraphQLString },
    count: { type: GraphQLInt }
  }
})
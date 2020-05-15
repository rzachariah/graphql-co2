import {
  GraphQLString,
  GraphQLObjectType
} from 'graphql';

export default new GraphQLObjectType({
  name: 'Health',
  fields: {
    stack: { type: GraphQLString },
    name: { type: GraphQLString },
    link: { type: GraphQLString },
    environment: { type: GraphQLString },
    status: { type: GraphQLString },
    version: { type: GraphQLString }
  }
});

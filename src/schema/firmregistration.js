import {
  GraphQLString,
  GraphQLObjectType
} from 'graphql';

export default new GraphQLObjectType({
  name: 'FirmRegistration',
  fields: {
    token: { type: GraphQLString },
    name: { type: GraphQLString }
  }
});

import {
  GraphQLString,
  GraphQLInputObjectType
} from 'graphql';

export default new GraphQLInputObjectType({
  name: 'Criterion',
  fields: {
    property: { type: GraphQLString },
    value: { type: GraphQLString },
  }
});

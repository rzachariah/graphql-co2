import {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType
} from 'graphql';

export default new GraphQLObjectType({
  name: 'Metric',
  fields: {
    evaluatedTime: { type: GraphQLString },
    value: { type: GraphQLInt },
    newsTime: { type: GraphQLString },
    unit: { type: GraphQLString }
  }
});

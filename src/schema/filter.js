import {
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType
} from 'graphql';

import CriterionType from './criterion';

export default new GraphQLInputObjectType({
  name: 'Filter',
  fields: {
    requirements: { type: new GraphQLList(CriterionType) },
    exclusions: { type: new GraphQLList(CriterionType) },
    propertyExists: { type: new GraphQLList(GraphQLString) } 
  }
});
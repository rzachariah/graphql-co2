import {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLList,
  GraphQLBoolean,
  GraphQLEnumType
} from 'graphql';

import Stat from './stat';

var CategoryType = new GraphQLEnumType({
  name: 'Category',
  values: {
    pathname: {},
    query: {},
    verb: {},
    responseCode: {},
    environment: {},
    sourceHost: {},
    sourceType: {},
  }
});

var Parameters = new GraphQLObjectType({
  name: 'Parameters',
  fields: {
    product: { type: GraphQLString },
    environment: { type: GraphQLString },
    start: { type: GraphQLString },
    end: { type: GraphQLString },
    category: { type: CategoryType },
  }
})

var ApiStatsType = new GraphQLObjectType({
  name: 'ApiStats',
  fields: {
    items: { type: new GraphQLList(Stat)},
    parameters: { type: Parameters },
    includedCount: { type: GraphQLInt },
    lastTime: { type: GraphQLString },
    completed: { type: GraphQLBoolean }
  }
});

export { ApiStatsType, CategoryType };
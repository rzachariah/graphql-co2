import {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLList,
  GraphQLBoolean,
} from 'graphql';

import ApiMetricType from './apimetric';

var Parameters = new GraphQLObjectType({
  name: 'GraphQLMetricsParameters',
  fields: {
    product: { type: GraphQLString },
    start: { type: GraphQLString },
    end: { type: GraphQLString },
  }
})

export default new GraphQLObjectType({
  name: 'GraphQLMetrics',
  fields: {
    items: { type: new GraphQLList(ApiMetricType)},
    parameters: { type: Parameters },
    count: { type: GraphQLInt },
    lastTime: { type: GraphQLString },
    completed: { type: GraphQLBoolean }
  }
});
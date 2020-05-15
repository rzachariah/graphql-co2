import {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  GraphQLList
} from 'graphql';

var ItemType = new GraphQLObjectType({
  name: 'PeriodStatItem',
  fields: {
    start: { type: GraphQLString },
    startUTC: { type: GraphQLString },
    period: { type: GraphQLInt },
    count: { type: GraphQLInt },
    total: { type: GraphQLInt },
    avg: { type: GraphQLInt, resolve: (stat) => (stat.count == 0) ? 0 : stat.total / stat.count }
  }
});

var Parameters = new GraphQLObjectType({
  name: 'PeriodStatParameters',
  fields: {
    query: { type: GraphQLString },
    field: { type: GraphQLString },
    window: { type: GraphQLString }
  }
})

var ResultType = new GraphQLObjectType({
  name: 'PeriodStatResult',
  fields: {
    parameters: { type: Parameters },
    items: { type: new GraphQLList(ItemType) },
    count: { type: GraphQLInt }
  }
});

export default {
  ItemType,
  ResultType
}

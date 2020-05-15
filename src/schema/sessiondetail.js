import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLList,
  GraphQLBoolean
} from 'graphql';

import BigInt from 'graphql-bigint';

import Session from './session';

export default new GraphQLObjectType({
  name: 'SessionDetail',
  fields: {
    items: { type: new GraphQLList(Session) },
    count: { type: GraphQLInt },
    truncated: { type: GraphQLBoolean },
    lastTime: { type: BigInt }
  }
});
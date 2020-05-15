import {
  GraphQLSchema,
} from 'graphql';

import QueryType from './query.js';
import MutationType from './mutation.js';

export default new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
})
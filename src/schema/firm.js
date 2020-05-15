import {
  GraphQLString,
  GraphQLList,
  GraphQLObjectType
} from 'graphql';

import fetch from '../utils/fetcher';
import config from '../config.js';
const batchinsightRoot = config.batchinsightRoot;

export default new GraphQLObjectType({
  name: 'Firm',
  fields: {
    name: { type: GraphQLString },
    product: { type: GraphQLString },
    environment: { type: GraphQLString },
    users: {
      type: new GraphQLList(GraphQLString),
      resolve: (firm, _, req) => {
        return fetch(`${batchinsightRoot}/history/users?product=${firm.product}&environment=${firm.environment}&firmCode=${firm.name}`, null, req)
          .then(res => res.json());
      }
    }
  }
});

import {
  GraphQLString,
  GraphQLList,
  GraphQLObjectType
} from 'graphql';

import fetch from '../utils/fetcher';
import config from '../config.js';
const batchinsightRoot = config.batchinsightRoot;
import EnvironmentType from './environment';

export default new GraphQLObjectType({
  name: 'ProductNode',
  fields: {
    name: { type: GraphQLString },
    environments: {
      type: new GraphQLList(EnvironmentType),
      resolve: (product, _, req) => {
        return fetch(`${batchinsightRoot}/history/environments?product=${product.name}`, null, req)
          .then(res => res.json())
          .then(json => json.map(item => {
            return {
              name: item,
              product: product.name
            };
          }))
      }
    }
  }
});
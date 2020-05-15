import {
  GraphQLString,
  GraphQLList,
  GraphQLObjectType
} from 'graphql';

import fetch from '../utils/fetcher';
import config from '../config.js';
const batchinsightRoot = config.batchinsightRoot;

import FirmType from './firm';

export default new GraphQLObjectType({
  name: 'EnvironmentNode',
  fields: {
    name: { type: GraphQLString },
    product: { type: GraphQLString },
    firms: {
      type: new GraphQLList(FirmType),
      resolve: (environment, _, req) => {
        return fetch(`${batchinsightRoot}/history/firms?product=${environment.product}&environment=${environment.name}`, null, req)
          .then(res => res.json())
          .then(json => json.map(item => {
            return {
              name: item,
              product: environment.product,
              environment: environment.name,
            };
          }))
      }
    },
    hosts: {
      type: new GraphQLList(GraphQLString),
      resolve: (environment, _, req) => {
        return fetch(`${batchinsightRoot}/history/hosts?product=${environment.product}&environment=${environment.name}`, null, req)
          .then(res => res.json());
      }
    }    
  }
});

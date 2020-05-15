import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt
} from 'graphql';

import fetch from '../utils/fetcher';
import config from '../config.js';
const collectorRoot = config.collectorRoot;

var PostBehaviorMutation = {
  type: GraphQLString,
  description: 'Create token',
  args: {
    host: {
      name: 'Host',
      type: new GraphQLNonNull(GraphQLString)
    },
    product: {
      name: 'Product',
      type: new GraphQLNonNull(GraphQLString)
    },
    subproduct: {
      name: 'Subproduct',
      type: GraphQLString
    },
    component: {
      name: 'Component',
      type: new GraphQLNonNull(GraphQLString)
    },
    action: {
      name: 'Action',
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: (root, args, req) => {
    var url = `${collectorRoot}/collection/bin`;
    var options = {
      method: 'POST',
      body: JSON.stringify(args),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
    return fetch(url, options, req)
      .then(res => res.json())
      .then(json => json.message)
      .catch(error => {
        console.error(error);
      })
  }
};

var HeartbeatMutation = {
  type: GraphQLString,
  description: 'Heartbeat',
  args: {
    sessionId: {
      name: 'SessionId',
      type: new GraphQLNonNull(GraphQLString)
    },
    product: {
      name: 'Product',
      type: new GraphQLNonNull(GraphQLString)
    },
    host: {
      name: 'Host',
      type: new GraphQLNonNull(GraphQLString)
    },
    sessionMinutes: {
      name: 'SessionMinutes',
      type: GraphQLInt
    }
  },
  resolve: (root, args, req) => {
    var url = `${collectorRoot}/collection/heartbeat`;
    var options = {
      method: 'POST',
      body: JSON.stringify(args),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
    return fetch(url, options, req)
      .then(res => res.json())
      .then(json => json.message)
      .catch(error => {
        console.error(error);
      })
  }
};

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    postBehavior: PostBehaviorMutation,
    heartbeat: HeartbeatMutation
  }
});
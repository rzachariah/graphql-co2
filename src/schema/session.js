import {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType
} from 'graphql';

import config from '../config';
import FirmRegistrationType from './firmregistration';

export default new GraphQLObjectType({
  name: 'Session',
  fields: {
    id: { type: GraphQLString, resolve: (session) => session.sessionId },
    time: { type: GraphQLString },
    date: { type: GraphQLString, resolve: (session) => new Date(session.time).toDateString() },
    timeUTC: { type: GraphQLString, resolve: (session) => new Date(session.time).toUTCString() },
    environment: { type: GraphQLString },
    host: { type: GraphQLString },
    product: { type: GraphQLString },
    firmCode: { type: GraphQLString },
    username: { type: GraphQLString },
    fqn: { type: GraphQLString },
    hash: { type: GraphQLString },
    minutes: { type: GraphQLInt, resolve: (session) => session.sessionMinutes },
    firm: {
      type: FirmRegistrationType,
      resolve: (x, _, req) => {
        return config.firmsApi.find(f => x.firmCode === f.token);
      }
    }
  }
});
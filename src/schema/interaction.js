import {
  GraphQLString,
  GraphQLObjectType
} from 'graphql';

import config from '../config';
import FirmRegistrationType from './firmregistration';

export default new GraphQLObjectType({
  name: 'Interaction',
  fields: {
    host: { type: GraphQLString },
    time: { type: GraphQLString },
    product: { type: GraphQLString },
    subproduct: { type: GraphQLString },
    component: { type: GraphQLString },
    firmCode: { type: GraphQLString },
    username: { type: GraphQLString },
    action: { type: GraphQLString },
    firm: {
      type: FirmRegistrationType,
      resolve: (x, _, req) => {
        return config.firmsApi.find(f => x.firmCode === f.token);
      }
    }
  }
});

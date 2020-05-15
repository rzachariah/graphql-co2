import {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLList
} from 'graphql';

import BigInt from 'graphql-bigint';

const Parameters = new GraphQLObjectType({
  name: 'SessionSummaryParameters',
  fields: {
    environment: { type: GraphQLString },
    firm: { type: GraphQLString },
    user: { type: GraphQLString },
    start: { type: BigInt },
    end: { type: BigInt },
    noEze: { type: GraphQLBoolean },
    scope: { type: GraphQLString },
    startUTC: { type: GraphQLString },
    endUTC: { type: GraphQLString }
  }
})

const HashCount = new GraphQLObjectType({
  name: 'HashCount',
  fields: {
    hash: { type: GraphQLString },
    count: { type: GraphQLInt }
  }
})

const Counts = new GraphQLObjectType({
  name: 'SessionSummaryCounts',
  fields: {
    samples: { type: GraphQLInt },
    appSessions: { type: GraphQLInt },
    firms: { type: GraphQLInt },
    users: { type: GraphQLInt },
    fqns: { type: GraphQLInt },
    hashes: { type: GraphQLInt }
  }
})

export default new GraphQLObjectType({
  name: 'SessionSummary',
  fields: {
    parameters: { type: Parameters },
    counts: { type: Counts },
    histogram: { type: new GraphQLList(HashCount) },
    truncated: { type: GraphQLBoolean },
    last: { type: BigInt },
    lastUTC: { type: GraphQLString }        
  }
})
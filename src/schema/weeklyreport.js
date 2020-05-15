import {
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLObjectType
} from 'graphql';

var FirmReport = new GraphQLObjectType({
  name: 'FirmReport',
  fields: {
    firmCode: { type: GraphQLString },
    firmName: { type: GraphQLString },
    activeUsers: { type: GraphQLInt },
    sessionCount: { type: GraphQLInt },
    longestSession: { type: GraphQLInt },
    navClicks: { type: GraphQLInt },
    timeInUse: { type: GraphQLInt }
  }
});

var KPIs = new GraphQLObjectType({
  name: 'KPIs',
  fields: {
    firmsCreated: { type: GraphQLInt },
    activeFirms: { type: GraphQLInt },
    activeUsers: { type: GraphQLInt },
    projectedSubscriptionRunRate: { type: GraphQLFloat },
    sessionCount: { type: GraphQLInt },
    longestSession: { type: GraphQLInt },
    navClicks: { type: GraphQLInt },
    timeInUse: { type: GraphQLInt },
    averageUsers: { type: GraphQLFloat }    
  }
});

export default new GraphQLObjectType({
  name: 'WeeklyReport',
  fields: {
    start: { type: GraphQLString },
    startUTC: { type: GraphQLString },
    end: { type: GraphQLString },
    endUTC: { type: GraphQLString },
    items: { type: new GraphQLList(FirmReport) },
    kpis: { type: KPIs }    
  }
});
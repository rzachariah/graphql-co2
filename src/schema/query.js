import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLBoolean
} from 'graphql';

import fetch from '../utils/fetcher';
import NodeCache from 'node-cache';
const queryCache = new NodeCache();
import _ from 'lodash';
import BigInt from 'graphql-bigint';

import config from '../config';
const batchinsightRoot = config.batchinsightRoot;
import apiHelper from '../apihelper';
import batchinsightGateway from '../batchinsightgateway';
import filterService from '../filterservice';
import healthReportService from '../healthreportservice';
import aggregationService from '../aggregationservice';
import servingLayer from '../servinglayer';
import queryLibrary from '../querylibrary';
import statsLibrary from '../statslibrary';

import FirmRegistrationType from './firmregistration';
import ProductType from './product.js';
import EnvironmentType from './environment.js';
import InteractionType from './interaction.js';
import SessionType from './session';
import FilterType from './filter.js';
import HealthType from './health.js';
import MetricType from './metric.js';
import ApiMetricType from './apimetric';
import GraphQLMetricsType from './graphqlmetrics';
import PeriodStats from './periodstats';
import WeeklyReportType from './weeklyreport';
import UsersOnlineType from './usersonline';
import SessionDetail from './sessiondetail';
import SessionSummary from './sessionsummary';
import enums from './enums';
import util from '../util';

import getSessionDetail from '../dynamodb/sessiondetail';

function startOrDefault(start) {
  if (start === null || start === undefined) {
    return Date.now() - 12 * 3600 * 1000;
  }
  return start;
}

function endOrDefault(end) {
  return end || Date.now();
}

function isCacheable(end) {
  return apiHelper.isCacheable(end);
}

// Try to read key from cache. If not available, readHard() to get and update cache
async function readThrough(req, key, readHard, cacheable, ttl) {
  const log = req.log;
  ttl = ttl || 60;
  log.info(`[${key}] readThrough cacheable=${cacheable} ttl=${ttl}`);
  if (!cacheable) {
    return readHard();
  }
  var cached = queryCache.get(key);
  if ( cached == undefined ){
    log.info(`[${key}] Cache miss`);
  }
  else {
    log.info(`[${key}] Cache hit`);
    return cached;
  }
  var data = await readHard();
  log.info(`[${key}] Caching response`);
  queryCache.set(key, data, ttl);
  return data;
}

function getMillis(millisString) {
  return apiHelper.getMillis(millisString);
}

function withinTolerance(expected, actual, tolerance) {
  var delta = Number(expected) - Number(actual);
  return Math.abs(delta) < tolerance;
}

export default new GraphQLObjectType({
  name: 'Query',
  description: '...',

  fields: {

    firms: {
      type: new GraphQLList(FirmRegistrationType),
      description: 'Firms registered in the Digital Exhaust',
      resolve: (obj, args, req) => {
        return config.firmsApi;
      }
    },

    users: {
      type: new GraphQLList(GraphQLString),
      description: 'Users at firm',
      args: {
        firm: { name: 'Firm', description: 'Firm code, eg "T7BSS"', type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (obj, {firm}, req) => {
        return fetch(`${batchinsightRoot}/history/users?product=ims&environment=AWSProd&firmCode=${firm}`, null, req)
          .then(res => res.json());
      }
    },

    usersOnline: {
      type: UsersOnlineType,
      description: 'Active Eze Eclipse users (excludes internal users)',
      resolve: (obj, args, req) => {
        const readHard = async () => {
            const log = req.log;
            const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
            var sessions = await queryLibrary.clientSessions(req, null, null, fiveMinutesAgo);
            sessions = sessions.map(s => {
              s.fulluser = `${s.firmCode}\\${s.username}`;
              return s;
            });
            var sessionsByUser = _.countBy(sessions, 'fulluser');
            log.info(JSON.stringify(sessionsByUser));
            var userCount = Object.keys(sessionsByUser).length;
            var sessionCount = sessions.length;
            var maxDuration = sessions.length > 0 ? Math.max(...sessions.map(s => s.minutes)) : 0;
            var sessionsByFirm = _.countBy(sessions, 'firmCode');
            var firmCount = Object.keys(sessionsByFirm).length;
            if (sessions.length === 0) {
              // Update sessions with longer lookback
              const lookBack = Date.now() - 60 * 3600 * 1000;
              sessions = await queryLibrary.clientSessions(req, null, null, lookBack);
            } 
            var newsTime = Math.max(...sessions.map(s => s.time));
            return {
              evaluatedTime: Date.now(),
              firmCount,
              userCount,
              sessionCount,
              maxDuration,
              newsTime,
              unit: 'unit'
            };
          };
        const cacheable = true;
        return readThrough(req, 'usersOnline', readHard, cacheable);
      }
    },

    weeklyReport: {
      type: WeeklyReportType,
      description: 'High level report for IMS Tactical',
      args: {
        useWeekStart: {
          name: 'Use Week Start',
          description: 'Period starts at week start (Sunday at midnight)',
          type: GraphQLBoolean
        }
      },
      resolve: async (obj, {useWeekStart}, req) => {
        const week = 7*24*3600*1000;
        var start = Date.now() - week;
        if (useWeekStart) {
          start = util.weekStart(start);
        }
        const end = start + week;
        var sessions = await queryLibrary.clientSessions(req, false, false, start, end);
        var sessionsByFirm = _.groupBy(sessions, 'firmCode');
        var promises = config.firms.map(async firm => {
          var omtm = await servingLayer.getOmtm(req, false, start, firm.FirmAuthToken, null, end);
          var navClicks = omtm.value;
          var amtm = await servingLayer.getAmtm(req, false, start, firm.FirmAuthToken, null, end);
          var timeInUse = amtm.value;
          var firmSessions = sessionsByFirm[firm.FirmAuthToken] || [];
          var firmSessionsByUser = _.countBy(firmSessions, 'username');
          var longestSession = firmSessions.length > 0 
            ? Math.max(...firmSessions.map(s => s.minutes))
            : 0;
          return {
            firmCode: firm.FirmAuthToken,
            firmName: firm.FirmName,
            activeUsers: Object.keys(firmSessionsByUser).length,            
            sessionCount: firmSessions.length, 
            longestSession,
            navClicks,
            timeInUse
          };
        });
        var items = await Promise.all(promises);
        var navClicks = items.map(i => i.navClicks).reduce((a,b)=> a+b);
        var timeInUse = items.map(i => i.timeInUse).reduce((a,b)=> a+b);

        sessions = sessions.map(s => {
          s.fulluser = `${s.firmCode}\\${s.username}`;
          return s;
        });
        var sessionsByUser = _.countBy(sessions, 'fulluser');
        console.log(sessionsByUser);

        const activeUsers = Object.keys(sessionsByUser).length;
        
        return {
          start,
          startUTC : new Date(start).toUTCString(),
          end,
          endUTC : new Date(end).toUTCString(),
          items,
          kpis: {
            firmsCreated: items.length,
            activeFirms: items.filter(i => i.timeInUse > 0).length,
            activeUsers,
            projectedSubscriptionRunRate: activeUsers * 1500 * 12,
            averageUsers: (timeInUse / (5 * 12 * 60)).toFixed(2),
            sessionCount: sessions.length, 
            longestSession: Math.max(...sessions.map(s => s.minutes)),
            navClicks,
            timeInUse
          }
        };
      }
    },
    
    omtm: {
      type: MetricType,
      description: 'One Metric That Matters (Client Nav Clicks)',
      args: {
        start: { name: 'Start', description: 'Start time in currentmillis. Defaults to 0', type: GraphQLString },
        firm: { name: 'Firm', description: 'Firm code, eg "T7BSS"', type: GraphQLString },
        user: { name: 'User', description: 'Username, eg "CCarroll"', type: GraphQLString },
        noCache: { name: 'NoCache', description: 'Hard get from source', type: GraphQLBoolean }
      },
      resolve: (_, {start, firm, user, noCache}, req) => {
        const readHard = () => {
          const startInt = getMillis(start);
          return servingLayer.getOmtm(req, noCache, startInt, firm, user);
        };
        const cacheable = !start && !firm && !user && !noCache;
        return readThrough(req, 'omtm', readHard, cacheable);
      }
    },

    amtm: {
      type: MetricType,
      description: 'Another Metric That Matters (Early Adopter time in use)',
      args: {
        start: { name: 'Start', description: 'Start time in currentmillis. Defaults to 0', type: GraphQLString },
        end: { name: 'End', description: 'End time in currentmillis. Defaults to null', type: GraphQLString },
        firm: { name: 'Firm', description: 'Firm code, eg "T7BSS"', type: GraphQLString },
        user: { name: 'User', description: 'Username, eg "CCarroll"', type: GraphQLString },
        noCache: { name: 'NoCache', description: 'Hard get from source', type: GraphQLBoolean }
      },
      resolve: (_, {start, end, firm, user, noCache}, req) => {
        const readHard = () => {
          const startInt = getMillis(start);
          return servingLayer.getAmtm(req, noCache, startInt, firm, user, end);
        };        
        const cacheable = !start && !firm && !user && !noCache && !end;
        return readThrough(req, 'amtm', readHard, cacheable);
      }
    },

    earlyAdopterInteractions: {
      type: new GraphQLList(InteractionType),
      description: 'Raw early Adopter interactions, excluding eze interactions',
      args: {
        start: { name: 'Start', description: 'Start time in currentmillis. Defaults to 0', type: GraphQLString },
        firm: { name: 'Firm', description: 'Firm code, eg "T7BSS"', type: GraphQLString },
        user: { name: 'User', description: 'Username, eg "CCarroll"', type: GraphQLString }
      },
      resolve: (_, {start, firm, user}, req) => {
        return queryLibrary.earlyAdopterInteractions(req, start, firm, user);
      }
    },

    earlyAdopterSessions: {
      type: new GraphQLList(SessionType),
      description: 'Raw early Adopter sessions, excluding eze sessions',
      args: {
        firm: { name: 'Firm', description: 'Firm code, eg "T7BSS"', type: GraphQLString },
        user: { name: 'User', description: 'Username, eg "CCarroll"', type: GraphQLString },
        start: {
          name: 'Start',
          description: 'Start time in currentmillis. Defaults to 12h ago',
          type: GraphQLString,
        },
        end: {
          name: 'End',
          description: 'End time in currentmillis. Defaults to now.',
          type: GraphQLString,
        },
      },
      resolve: (_, {firm, user, start, end}, req) => {
        start = startOrDefault(start);
        end = endOrDefault(end);
        return queryLibrary.clientSessions(req, firm, user, start, end);
      }
    },

    earlyAdopterSessions2: {
      type: new GraphQLList(SessionType),
      description: 'Raw early Adopter sessions, excluding eze sessions',
      args: {
        firm: { name: 'Firm', description: 'Firm code, eg "T7BSS"', type: GraphQLString },
        user: { name: 'User', description: 'Username, eg "CCarroll"', type: GraphQLString },
        start: {
          name: 'Start',
          description: 'Start time in currentmillis. Defaults to 12h ago',
          type: GraphQLString,
        },
        end: {
          name: 'End',
          description: 'End time in currentmillis. Defaults to now.',
          type: GraphQLString,
        },
      },
      resolve: (_, {firm, user, start, end}, req) => {
        start = startOrDefault(start);
        end = endOrDefault(end);
        return queryLibrary.earlyAdopterSessions2(req, firm, user, start, end);
      }
    },    

    sessionDetail: {
      type: SessionDetail,
      description: 'Session play by play, minute by minute',
      args: {
        environment: { name: 'Environment', description: 'Environment. Defaults to "AWSProd"', type: enums.Environment },
        firm: { name: 'Firm', description: 'Firm code, eg "T7BSS"', type: GraphQLString },
        user: { name: 'User', description: 'Username, eg "CCarroll"', type: GraphQLString },
        start: {
          name: 'Start',
          description: 'Start time in currentmillis. Defaults to 12h ago',
          type: BigInt,
        },
        end: {
          name: 'End',
          description: 'End time in currentmillis. Defaults to now.',
          type: BigInt,
        },
        noEze: {
          name: 'NoEze',
          description: 'Filter out Eze firms and users',
          type: GraphQLBoolean,
        }

      },
      resolve: async (_, {environment, firm, user, start, end, noEze}, req) => {
        start = startOrDefault(start);
        end = endOrDefault(end);
        var response = await getSessionDetail(req, environment, firm, user, start, end);
        if (noEze) {
          response.items = response.items.filter(queryLibrary.clientFilter);
        }
        return response;
      }
    },

    sessionSummary: {
      type: SessionSummary,
      description: 'Usage histogram by URL location hash',
      args: {
        environment: { name: 'Environment', description: 'Environment, eg "AWSProd"', type: enums.Environment },
        firm: { name: 'Firm', description: 'Firm code, eg "T7BSS"', type: GraphQLString },
        user: { name: 'User', description: 'Username, eg "CCarroll"', type: GraphQLString },
        start: {
          name: 'Start',
          description: 'Start time in currentmillis. Defaults to 12h ago',
          type: BigInt,
        },
        end: {
          name: 'End',
          description: 'End time in currentmillis. Defaults to now.',
          type: BigInt,
        },
        noEze: {
          name: 'NoEze',
          description: 'Filter out Eze firms and users',
          type: GraphQLBoolean,
        },
        pages: {
          name: 'Pages',
          description: 'Number of pages of data to scan (max 20)',
          type: GraphQLInt,
        }        
      },
      resolve: async (root, {environment, firm, user, start, end, noEze, pages}, req) => {
        environment = environment || 'AWSProd';
        start = startOrDefault(start);
        end = endOrDefault(end);
        var scope = environment;
        if (firm) {
          scope += `/${firm}`;
        }
        if (user) {
          scope += `/${user}`;
        }
        const parameters = {
          environment,
          firm,
          user,
          start,
          end,
          noEze,
          scope,
          startUTC: new Date(start).toUTCString(),
          endUTC: new Date(end).toUTCString()
        }
        pages = pages || 1;
        var maxPages = Math.min(pages, 20);
        var detailResponse = await getSessionDetail(req, environment, firm, user, start, end, maxPages);
        var detail = detailResponse.items;
        if (noEze) {
          detail = detail.filter(queryLibrary.clientFilter);
        }
        const counts = {
          samples: detail.length,
          appSessions: Object.keys(_.countBy(detail.map(s => s.sessionId))).length,
          firms: Object.keys(_.countBy(detail.map(s => s.firmCode))).length,
          users: Object.keys(_.countBy(detail.map(s => s.username))).length,
          fqns: Object.keys(_.countBy(detail.map(s => s.fqn))).length,
          hashes: Object.keys(_.countBy(detail.map(s => s.hash))).length,
        }
        const histogram = aggregationService.countByX(detail, 'hash')
          .sort((a, b) => (b.count - a.count));
        return {
          parameters,
          counts,
          histogram,
          truncated: detailResponse.truncated,
          last: detailResponse.lastTime,
          lastUTC: new Date(detailResponse.lastTime).toUTCString()
        }
      }
    },

    bugcrowdSessions: {
      type: new GraphQLList(SessionType),
      description: 'Raw Bugcrowd sessions, excluding eze sessions',
      args: {
        start: {
          name: 'Start',
          description: 'Start time in currentmillis. Defaults to 5m ago',
          type: GraphQLString,
        },
        end: {
          name: 'End',
          description: 'End time in currentmillis. Defaults to now.',
          type: GraphQLString,
        },

      },
      resolve: (_, {start, end}, req) => {
        const readHard = () => queryLibrary.bugcrowdSessions(req, start, end);
        const expectedRange = 1000 * 60 * 5;
        const expectedStart = new Date() - expectedRange;
        start = start || expectedStart;
        const expectedEnd = Date.now();
        end = end || expectedEnd;
        const tolerance = 1000 * 60;
        const ttl = tolerance / 1000;
        const cacheable = withinTolerance(expectedStart, start, tolerance) && withinTolerance(expectedEnd, end, tolerance);
        return readThrough(req, 'bugcrowdSessions', readHard, cacheable, ttl);
      }
    },

    products: {
      type: new GraphQLList(ProductType),
      resolve: (_, args, req) => {
        return fetch(`${batchinsightRoot}/history/products`, null, req)
          .then(res => res.json())
          .then(json => json.map(item => {
            return {
              name: item
            }
          }))
      }
    },

    environments: {
      type: new GraphQLList(EnvironmentType),
      args: {
        product: {
          name: 'Product',
          type: GraphQLString
        }
      },
      resolve: (_, {product}, req) => {
        return fetch(`${batchinsightRoot}/history/environments?product=${product}`, null, req)
          .then(res => res.json())
          .then(json => json.map(item => {
            return {
              name: item,
              product: product
            };
          }));
      }
    },

    interactions2: {
      type: new GraphQLList(InteractionType),
      args: {
        product: {
          name: 'Product',
          description: 'Product that produced the interaction.',
          type: new GraphQLNonNull(GraphQLString)
        },
        environment: {
          name: 'Environment',
          description: 'Environment where the interaction came from.',
          type: GraphQLString,
        },
        start: {
          name: 'Start',
          description: 'Start time in currentmillis.',
          type: new GraphQLNonNull(GraphQLString),
        },
        end: {
          name: 'End',
          description: 'End time in currentmillis. Defaults to now.',
          type: GraphQLString,
        },
        firm: {
          name: 'Firm',
          description: 'Firm filter.',
          type: GraphQLString,
        },
        filter: {
          name: 'Filter',
          description: 'Custom filter',
          type: FilterType,
        }
      },
      resolve: (_, {product, environment, start, end, firm, filter}, req) => {
        var url = apiHelper.getInteractions2Url(product, environment, firm, start, end);
        return batchinsightGateway.get(req, url, isCacheable(end))
          .then(json => json.Items)
          .then(items => filterService.applyFilter(items, filter));
      }
    },

    countInteractions2: {
      type: MetricType,
      args: {
        product: {
          name: 'Product',
          description: 'Product that produced the interaction.',
          type: new GraphQLNonNull(GraphQLString)
        },
        environment: {
          name: 'Environment',
          description: 'Environment where the interaction came from.',
          type: GraphQLString,
        },
        firm: {
          name: 'Firm',
          description: 'Firm filter.',
          type: GraphQLString,
        },
        filter: {
          name: 'Filter',
          description: 'Custom post fetch filter',
          type: FilterType,
        }
      },
      resolve: (_, {product, environment, firm, filter}, req) => {
        return aggregationService.countInteractionsSince(req, product, environment, firm, filter);
      }
    },

    sessions: {
      type: new GraphQLList(SessionType),
      args: {
        product: {
          name: 'Product',
          description: 'Product filter',
          type: new GraphQLNonNull(GraphQLString)
        },
        environment: {
          name: 'Environment',
          description: 'Environment filter',
          type: GraphQLString,
        },
        start: {
          name: 'Start',
          description: 'Start time in currentmillis.',
          type: new GraphQLNonNull(GraphQLString),
        },
        end: {
          name: 'End',
          description: 'End time in currentmillis. Defaults to now.',
          type: GraphQLString,
        },
        firm: {
          name: 'Firm',
          description: 'Firm filter.',
          type: GraphQLString,
        },
        filter: {
          name: 'Filter',
          description: 'Custom filter',
          type: FilterType,
        }
      },
      resolve: (_, {product, environment, start, end, firm, filter}, req) => {
        if (environment) {
          if (environment.toUpperCase() === 'CASTLE') {
            environment = 'Castle';
          } else if (environment.toUpperCase() === 'AWSPROD') {
            environment = 'AWSProd';
          }
        }
        var url = apiHelper.getSessionsUrl(product, environment, firm, start, end);
        return batchinsightGateway.get(req, url, isCacheable(end))
          .then(json => json.Items)
          .then(items => filterService.applyFilter(items, filter));
      }
    },

    apiMetrics: {
      type: new GraphQLList(ApiMetricType),
      args: {
        product: {
          name: 'Product',
          description: 'Product filter',
          type: new GraphQLNonNull(GraphQLString),
        },
        start: {
          name: 'Start',
          description: 'Start time in currentmillis.',
          type: new GraphQLNonNull(GraphQLString),
        },
        end: {
          name: 'End',
          description: 'End time in currentmillis.',
          type: new GraphQLNonNull(GraphQLString),
        },
        environment: {
          name: 'Environment',
          description: 'Environment filter',
          type: GraphQLString
        },
        host: {
          name: 'Host',
          description: 'Host filter',
          type: GraphQLString
        },
      },
      resolve: (_, {product, start, end, environment, host}, req) => {
        var url = `${batchinsightRoot}/history/apimetrics?product=${product}&start=${start}&end=${end}`;
        if (environment) {
          url += `&environment=${environment}`
        }
        if (host) {
          url += `&host=${host}`
        }
        return batchinsightGateway.get(req, url, isCacheable(end))
          .then(json => json.Items);
      }
    },

    healthReport: {
      type: new GraphQLList(HealthType),
      resolve: (obj, args, req) => {
        return healthReportService.reportRequest(req)
          .toPromise();
      }
    },

    earlyAdopters: {
      type: new GraphQLList(GraphQLString),
      resolve: () => config.clientFirms
    },

    graphqlMetrics: {
      type: GraphQLMetricsType,
      args: {
        product: {
          name: 'Product',
          description: 'Product filter',
          type: GraphQLString,
        },
        start: {
          name: 'Start',
          description: 'Start time in currentmillis.',
          type: GraphQLString,
        },
        end: {
          name: 'End',
          description: 'End time in currentmillis.',
          type: GraphQLString,
        },
      },
      resolve: (_, {product, start, end}, req) => {
        return batchinsightGateway.getRange(req, 'apimetrics', product, start, end);
      }
    },

    periodStats: {
      type: PeriodStats.ResultType,
      args: {
        query: {
          name: 'Query',
          description: 'Time series query on which we will gather metrics. Eg clientSessions',
          type: new GraphQLNonNull(GraphQLString),
        },
        field: {
          name: 'Metric field',
          description: 'Item field which contains relevant metric. Defaults to minutes',
          type: GraphQLString,
        },
        window: {
          name: 'Window',
          description: 'Period length in millis. Defaults to 604800000 (one week)',
          type: GraphQLString,
        },
        useWeekStart: {
          name: 'Use Week Start',
          description: 'Period starts at week start (Sunday at midnight)',
          type: GraphQLBoolean
        }
      },
      resolve: async(_, {
        query,
        field,
        window,
        useWeekStart
      }, req) => {
        query = query || 'earlyAdopterSessions';
        field = field || 'minutes';
        window = Number(window) || 7 * 24 * 60 * 60 * 1000; // default to one week

        var parameters = {
          query,
          field,
          window
        };
        return statsLibrary.periodStats(req, queryLibrary, query, window, field, useWeekStart)
          .then(items => {
            return {
              parameters,
              items,
              count: items.length
            }
          });
      }
    },

  }
})





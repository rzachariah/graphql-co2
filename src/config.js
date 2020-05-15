const baseUrl = process.env.BASE_URL || 'http://localhost:9000';
const apiRoot = `${baseUrl}/api`;
const batchinsightRoot = apiRoot;
const batchqueryRoot = apiRoot;
const collectorRoot = apiRoot;

import parse from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';
import Logger from './utils/logger';
const log = Logger.getLog();
const dataDir = path.join(__dirname, '../data');
const tenantsCsv = fs.readFileSync(dataDir + '/tenants.csv', 'utf8');
const firms = parse(tenantsCsv, {columns: true});
const firmsApi = firms.map(x => ({
  token: x.FirmAuthToken,
  name: x.FirmName
}));

var config = {
  routingPath: '/api/graphql',
  baseUrl,
  batchinsightRoot,
  batchqueryRoot,
  collectorRoot,
  defaultProduct: 'ims',
  roundingUnit: 1000 * 60 * 15,
  window: 1000 * 3600 * 4,
  firms,
  firmsApi,
  clientFirms: firms.map(f => f.FirmAuthToken),
  bugcrowdFirms: [
    'T51R0',
    'TQQBF'
  ],
  // Note: we don't need to maintain this list going forward. Eze users will be named according to a convention  
  ezeUsers: ['JSinkevich', 'KThomas', 'EChristofferson', 'NSandle', 'Sruane', 'credfern', 'poakham']
};

console.log(config);

log.info(`Registered firms: ${JSON.stringify(config.clientFirms)}`);

export default config;
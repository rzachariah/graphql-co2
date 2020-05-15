var fs = require('fs');

function clientSessions(req, firm, user, start, end) {
  var items = JSON.parse(fs.readFileSync('./tests/unit/stats-library/sessions.json', 'utf8'));
  return Promise.resolve(items);
}

export default {
  clientSessions
};
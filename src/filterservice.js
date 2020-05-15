import config from './config';

var hasProperties = (item, propertyExists) => {
  if (!propertyExists) {
    return item;
  }
  var pass = true;
  propertyExists.forEach(prop => {
    if (!item.hasOwnProperty(prop)) {
      pass = false;
    }
  });
  return pass;
};

var meetsRequirements = (item, requirements) => {
  var metAllRequirementsSeen = true;
  if (requirements) {
    requirements.forEach(req => {
      if (!item[req.property] || !item[req.property].match(req.value)) {
        metAllRequirementsSeen = false;
      }
    })
  }
  return metAllRequirementsSeen;
};

var excluded = (item, exclusions) => {
  var failedAnyExclusionSeen = false;
  if (exclusions) {
    exclusions.forEach(excl => {
      if (item[excl.property] && item[excl.property].match(excl.value)) {
        failedAnyExclusionSeen = true;
      }
    });
  }
  return failedAnyExclusionSeen;
};

var applyFilter = (items, filter) => {
  if (!filter) {
    return items;
  }
  var predicate = getPredicate(filter);
  return items.filter(predicate);
};

var getPredicate = (filter) => {
  if (!filter) {
    return () => true;
  }
  return item => {
    return hasProperties(item, filter.propertyExists) &&
      meetsRequirements(item, filter.requirements) &&
      !excluded(item, filter.exclusions);
  };
}

var getUserFilter = (user) => {
  return {
    requirements: [{
      property: 'username',
      value: user
    }]
  };
};

var getExcludeEzeFilter = (firm) => {
  var filter = {
    exclusions: config.ezeUsers.map(username => {
      return {
        property: 'username',
        value: new RegExp(username, 'gi')
      };
    })
  };
  if (firm) {
    filter.exclusions.push({
      property: 'username',
      value: new RegExp(`_${firm}$`, 'gi')
    });
  }
  return filter;
};

export default {
  getPredicate,
  applyFilter,
  getUserFilter,
  getExcludeEzeFilter,
  meetsRequirements,
  excluded
};
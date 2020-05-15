import AWS from 'aws-sdk';
AWS.config.region = 'us-east-1';
const https = require('https');

const dynamodb = new AWS.DynamoDB({
  httpOptions: {
    agent: new https.Agent({
      ciphers: 'ALL',
      secureProtocol: 'TLSv1_method'
    })
  }
});

const docClient = new AWS.DynamoDB.DocumentClient({
  service: dynamodb
});

function getByFqn(fqn, start, end) {
  return {
    TableName: 'SessionDetail',
    IndexName: 'fqn-time-index',
    KeyConditionExpression: '#fqn = :fqn and #time between :start and :end',
    ExpressionAttributeNames: {
      '#fqn': 'fqn',
      '#time': 'time'
    },
    ExpressionAttributeValues: {
      ':fqn': fqn,
      ':start': start,
      ':end': end
    }
  };
}

function getByEnvironment(environment, start, end) {
  return {
    TableName: 'SessionDetail',
    IndexName: 'environment-time-index',
    KeyConditionExpression: '#environment = :environment and #time between :start and :end',
    ExpressionAttributeNames: {
      '#environment': 'environment',
      '#time': 'time'
    },
    ExpressionAttributeValues: {
      ':environment': environment,
      ':start': start,
      ':end': end
    }
  };
}

function getByFirm(firm, start, end) {
  return {
    TableName: 'SessionDetail',
    IndexName: 'firmCode-time-index',
    KeyConditionExpression: '#firmCode = :firmCode and #time between :start and :end',
    ExpressionAttributeNames: {
      '#firmCode': 'firmCode',
      '#time': 'time'
    },
    ExpressionAttributeValues: {
      ':firmCode': firm,
      ':start': start,
      ':end': end
    }
  };
}

async function scan(req, params, maxPages) {
  const log = req.log;
  if (maxPages < 1) {
    return {
      Items: []
    }
  }
  var dynamoResponse;
  try {
    log.info(`Querying SessionDetail. maxPages=${maxPages}`)
    dynamoResponse = await docClient.query(params).promise();
  } catch(error) {
    log.error(`Unable to query. Error: ${JSON.stringify(error)}`);
    throw 'Error fetching SessionDetail';
  }
  if (dynamoResponse.LastEvaluatedKey && maxPages > 1) {
    params.ExclusiveStartKey = dynamoResponse.LastEvaluatedKey;
    var nextResponse = await scan(req, params, maxPages - 1);
    var combinedItems = dynamoResponse.Items.concat(nextResponse.Items);
    nextResponse.Items = combinedItems;
    return nextResponse;
  } else {
    return dynamoResponse;
  }
}

export default async function get(req, environment='AWSProd', firm, user, start, end, maxPages=1) {
  const log = req.log;
  if (!start) {
    start = Date.now() - 12 * 60 * 60 * 1000;
  }
  if (!end) {
    end = Date.now();
  }
  var params;
  if (firm && user) {
    const fqn=`${environment}/${firm.toUpperCase()}/${user}`;
    params = getByFqn(fqn, start, end);
  }
  else if (firm) {
    params = getByFirm(firm, start, end);
  }
  else {
    params = getByEnvironment(environment, start, end);
  }

  const dynamoResponse = await scan(req, params, maxPages);
  const items = dynamoResponse.Items;
  const count = items.length;
  var curated = {
    items,
    count
  }
  if (count > 0 && dynamoResponse.LastEvaluatedKey) {
    curated.truncated = true;
    curated.lastTime = dynamoResponse.LastEvaluatedKey.time;
  }
  else {
    curated.truncated = false;
    curated.lastTime = count > 0 ? curated.items[count - 1].time : end;
  }

  log.info(`Received ${count} items from DynamoDB. [truncated=${curated.truncated}]`);
  return curated;
}
var frisby = require('frisby');
frisby.globalSetup({
  timeout: 30000 // 30 second timeout
});
var getQueryUrl = function (query) {
  return getApiUrl(`?query=${query}`);
};
var getApiUrl = function (path) {
  var baseUrl = process.env['BASE_URL'];
  if (!baseUrl) {
    baseUrl = 'http://graphql:80';
  }
  var basePath = '/api/graphql';
  return `${baseUrl}${basePath}${path}`;
};

frisby.create('Can get health')
  .get(getApiUrl('/health'))
  .expectStatus(200)
  .toss();

frisby.create('Can get omtm by firm and user')
  .get(getQueryUrl(`
    {
      omtm(firm: "T7BSS", user: "AJSecrist") {
        value
        newsTime
        unit
      }
    }
  `))
  .expectJSONTypes('data.omtm', {
    value: Number,
    newsTime: String,
    unit: String
  })
  .inspectBody()  
  .toss();

// frisby.create('Can get omtm from start')
//   .get(getQueryUrl(`
//     {
//       omtm(start: "1492747200000", firm: "T7BSS") {
//         value
//         newsTime
//         unit
//       }
//     }
//   `))
//   .expectJSONTypes('data.omtm', {
//     value: Number,
//     newsTime: String,
//     unit: String
//   })
//   .inspectBody()  
//   .toss();

frisby.create('Can get range of early adopter interactions - v2')
  .get(getQueryUrl(`
    {
      interactions2(product: "ims", environment: "AWSProd", start: "1472562542355", end: "1472562666259", filter: {requirements: {property:"firmCode", value: "TSY3M"}, exclusions: [{property: "username", value: "JSinkevich"}, {property: "username", value: "KThomas"}, {property: "username", value: "EChristofferson"}], propertyExists: ["username"]}) {
        host
        time
        product
        subproduct
        component
        firmCode
        username
        action
      }
    }
  `))
  .expectJSONTypes('data', {
    interactions2: Array
  })
  .toss();

frisby.create('Can get amtm')
  .get(getQueryUrl(`
    {
      amtm {
        value
        newsTime
        unit
      }
    }  
  `))
  .expectJSONTypes('data.amtm', {
    value: Number,
    newsTime: String,
    unit: String
  })
  .inspectBody()  
  .toss();

frisby.create('Can get amtm by firm and user')
  .get(getQueryUrl(`
    {
      amtm(firm: "T7BSS", user: "AJSecrist") {
        value
        newsTime
        unit
      }
    }
  `))
  .expectJSONTypes('data.amtm', {
    value: Number,
    newsTime: String,
    unit: String
  })
  .inspectBody()  
  .toss();

frisby.create('Can get amtm from start')
  .get(getQueryUrl(`
    {
      amtm(start: "1492747200000", firm: "T7BSS") {
        value
        newsTime
        unit
      }
    }
  `))
  .expectJSONTypes('data.amtm', {
    value: Number,
    newsTime: String,
    unit: String
  })
  .inspectBody()  
  .toss();  

frisby.create('Can get earlyAdopterInteractions')
  .get(getQueryUrl(`
    {
      earlyAdopterInteractions(firm: "T7BSS") {
        host
        time
        product
        subproduct
        component
        firmCode
        username
        action
      }
    }
  `))
  .expectJSONTypes('data', {
    earlyAdopterInteractions: Array
  })
  .toss();

frisby.create('Can get earlyAdopterInteractions since')
  .get(getQueryUrl(`
    {
      earlyAdopterInteractions(start: "1492790494626", firm: "T7BSS") {
        host
        time
        product
        subproduct
        component
        firmCode
        username
        action
      }
    }
  `))
  .expectJSON('data.earlyAdopterInteractions.*', {
    firmCode: 'T7BSS',
    time: time => expect(time).not.toBeLessThan('1492790494626')
  })
  .toss();

frisby.create('Can get earlyAdopterSessions')
  .get(getQueryUrl(`
    {
      earlyAdopterSessions(start: "1478813542664", end: "1479046859121") {
        time
        firmCode
        username
        minutes
      }
    }
  `))
  .expectJSONTypes('data', {
    earlyAdopterSessions: Array
  })
  .toss();

frisby.create('Can get sessions')
  .get(getQueryUrl(`
    {
      sessions(product: "ims", environment: "AWSProd", start: "1475450520475", filter: {requirements: [{property: "firmCode", value: "TSY3M"}], exclusions: [{property: "username", value: "JSinkevich"}, {property: "username", value: "KThomas"}, {property: "username", value: "EChristofferson"}]}) {
        id
        time
        product
        environment
        firmCode
        username
        minutes
      }
    }
  `))
  .expectJSONTypes('data', {
    sessions: Array
  })
  .toss();

frisby.create('Can get API metrics')
  .get(getQueryUrl(`
    {
      apiMetrics(product: "DigitalExhaust", environment: "DigitalExhaust", start: "1475514264091", end: "1475515637608") {
        url
        latency
        time
        product
        environment
        service
      }
    }  
  `))
  .expectJSONTypes('data', {
    apiMetrics: Array
  })
  .toss();

frisby.create('Can get graphqlMetrics')
  .get(getQueryUrl(`
    {
      graphqlMetrics {
        parameters {
          product
          start
          end
        }
        count
        lastTime
        completed
        items {
          url
          latency
          time
          product
          environment
          service
          host
          pathname
          query
        }
      }
    }
  `))
  .expectJSONTypes('data.graphqlMetrics', {
    items: Array,
    parameters: Object,
    count: Number,
    lastTime: String,
    completed: Boolean
  })
  .toss();

frisby.create('Can get bugcrowdSessions')
  .get(getQueryUrl(`
    {
      bugcrowdSessions(start: "1504372905236", end: "1504694651688") {
        id
        time
        firmCode
        username
        minutes
      }
    }
  `))
  .expectJSONTypes('data.bugcrowdSessions', Array)
  .expectJSONTypes('data.bugcrowdSessions.*', {
    id: String,
    time: String,
    firmCode: String,
    username: String,
    minutes: Number,
  })
  .toss();

  frisby.create('Can get earlyAdopters')
  .get(getQueryUrl(`
    {
      earlyAdopters
    }
  `))
  .expectJSONTypes('data.earlyAdopters', Array)
  .expectJSON('data', {
    earlyAdopters:  earlyAdopters => expect(earlyAdopters.length).toBe(18)
  })
  .toss();

  frisby.create('Can get usersOnline')
  .get(getQueryUrl(`
    {
      usersOnline {
        userCount
        sessionCount
        newsTime
        unit
      }
    }
  `))
  .expectJSONTypes('data.usersOnline', {
    userCount: Number,
    sessionCount: Number,
    newsTime: String,
    unit: String
  })
  .inspectBody()
  .toss();

  // This query needs AWS DynamoDB data. Figure out a mocking approach
  // frisby.create('Can get sessionDetail')
  // .get(getQueryUrl(`
  //   {
  //     sessionDetail(start: ${Date.now() - 5*60*1000}, environment: Castle) {
  //       items {
  //         firmCode
  //         username
  //       }
  //     }
  //   }
  // `))
  // .expectJSONTypes('data.sessionDetail', {
  //   items: Array
  // })
  // .toss();

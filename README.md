# graphql-co2
GraphQL API to the Digital Exhaust

## Try out the live server!
Navigate to https://digitalexhaust.ezesoft.net/api/graphql

## Prerequisites
1. node 10
2. docker

## Configuration
To avoid routing through envoy
```
export BASE_URL=https://digitalexhaust.ezesoft.net
```

## Start the server
```
yarn
yarn start
```

Navigate over to http://localhost:3000 to start querying with GraphiQL!

## Build and test
```
bash scripts/build.sh
```
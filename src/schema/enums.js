import {
  GraphQLEnumType
} from 'graphql';


const Product = new GraphQLEnumType({
  name: 'Product',
  values: {
    Eclipse: {},
    DigitalExhaust: {}
  }
});

const Environment = new GraphQLEnumType({
  name: 'Environment',
  values: {
    AWSProd: {},
    Castle: {},
    Perf: {}
  }
});

export default {
  Product,
  Environment
}
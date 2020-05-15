#!/bin/bash

ls ./envoy-config
echo "Using $MODE-envoy.yaml"
cp ./envoy-config/$MODE-envoy.yaml service-envoy.yaml
env && yarn serve & ./envoy -l info -c service-envoy.yaml --service-cluster 'graphql' --service-node 'graphql' --log-format '[METADATA][%Y-%m-%d %T.%e][%t][%l][%n] %v'
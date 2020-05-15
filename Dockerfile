FROM envoyproxy/envoy-alpine:v1.11.0 as envoy

FROM node:10 as builder
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn config set registry http://bosdevartifactory.ezesoft.net:8081/artifactory/api/npm/npm-eze
RUN yarn
COPY . /app
ARG VERSION=0.0.2
RUN npm version $VERSION --no-git-tag-version
RUN yarn lint
RUN yarn test
RUN yarn build

FROM node:10-slim
WORKDIR /app
COPY --from=builder /app/package.json /app/yarn.lock /app/
ENV NODE_ENV production
RUN yarn config set registry http://bosdevartifactory.ezesoft.net:8081/artifactory/api/npm/npm-eze
RUN yarn
COPY --from=builder /app/data /app/data
COPY --from=builder /app/dist /app/dist
COPY --from=envoy /usr/local/bin/envoy /app/envoy
ENV MODE production
COPY ./envoy-config /app/envoy-config/
COPY ./start.sh /app/
RUN chmod +x ./start.sh
CMD ./start.sh
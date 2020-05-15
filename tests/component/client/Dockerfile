FROM node:10
WORKDIR /app

RUN yarn global add jasmine-node
COPY package.json yarn.lock /app/
RUN yarn config set registry https://bosdevartifactory.ezesoft.net/artifactory/api/npm/npm-eze
RUN yarn
COPY . /app

CMD [ "bash", "./test.sh"]
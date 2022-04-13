FROM node:14.17.0

ARG ENV

ENV ENV=${ENV}

RUN echo "Creating application with ENV=$ENV"

WORKDIR /app

COPY package.json /app/package.json

RUN npm install

COPY . /app

EXPOSE 3000

RUN npm run build

CMD npm run start:${ENV}

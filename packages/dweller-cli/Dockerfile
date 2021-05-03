FROM node:14-alpine

WORKDIR /usr/share/app

COPY package*.json ./

RUN npm install --development

COPY . .

ENTRYPOINT ["node", "./src/cli.js"]

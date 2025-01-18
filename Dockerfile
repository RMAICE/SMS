FROM node:20.16.0-slim

RUN mkdir -p /home/app/node_modules && chown -R node:node /home/app

WORKDIR /home/app

ENV NODE_ENV=production

USER node

COPY package*.json ./

COPY --chown=node:node . .

RUN npm ci

EXPOSE 9000

CMD ["node", "app.js"]

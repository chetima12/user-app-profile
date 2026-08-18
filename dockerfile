FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY . .
RUN chown -R node:node /app

USER node
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
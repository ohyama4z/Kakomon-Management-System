FROM node:12.18.3-slim

WORKDIR /app/client
COPY package.json ./
COPY package-lock.json ./

RUN npm ci
CMD ["npm", "run", "serve"]

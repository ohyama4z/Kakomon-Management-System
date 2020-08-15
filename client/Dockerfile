FROM node:12.18.3-alpine

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./

RUN npm ci
CMD ["npm", "run", "serve"]

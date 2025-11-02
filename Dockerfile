FROM node:20

WORKDIR /src

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["node", "dist/index.js"]
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .
RUN npm run build

COPY . .

EXPOSE 3000



RUN ls

CMD ["node", "dist/index.jss"]
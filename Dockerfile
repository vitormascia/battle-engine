FROM node:24.4.1-alpine3.20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . ./app

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

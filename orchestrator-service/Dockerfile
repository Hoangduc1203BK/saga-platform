FROM node:14-alpine3.10 as ts-compiler

EXPOSE 3000

WORKDIR /

RUN npm i npm@latest -g

COPY package.json package-lock.json ./

COPY tsconfig*.json ./

run npm install

COPY . .


CMD ["npm", "start"]
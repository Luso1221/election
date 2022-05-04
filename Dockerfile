FROM node:16

RUN npm install -g ganache-cli
RUN npm install -g truffle@5.2.1 -g
RUN npm install -g babel-runtime
FROM node:16

COPY . /apps
WORKDIR /apps
RUN npm install -g ganache-cli
RUN npm install -g truffle@5.2.1
RUN npm install -g babel-runtime
RUN npm install -g nodemon
RUN npm install -g nodemon
RUN npm install web3
RUN npm install truffle-contract
CMD ["ganache-cli","-h","0.0.0.0","-m","dsu"]
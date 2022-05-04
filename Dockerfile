FROM node:16

COPY . /app
WORKDIR /app
RUN npm install -g ganache-cli
RUN npm install -g truffle@5.2.1 -g
RUN npm install -g babel-runtime
RUN npm install
CMD ["ganache-cli","-m dsu 0.0.0.0"]
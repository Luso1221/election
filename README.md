docker build -t "node_truffle_ganache" .
docker run -p 8545:8545 -p 3000:3000 -p 3001:3001 -p 8080:8080 -d -t -v /$(PWD):/apps --name node_truffle_ganache node_truffle_ganache 
docker exec -it node_truffle_ganache bash | cd /apps && truffle migrate --reset
truffle test

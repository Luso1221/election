docker build -t "node_truffle_ganache" .
docker run -p 8545:8545 -p 3000:3000 -p 3001:3001 -d -t -v /$(PWD):/apps --name node_truffle_ganache node_truffle_ganache
docker exec -it node_truffle_ganache bash
truffle test

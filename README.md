docker build -t "node_truffle_ganache" .
docker run -p 8545:8545 -p 3000:3000 -d -t node_truffle_ganache node_truffle_ganache
docker exec -it node_truffle_ganache bash
truffle test

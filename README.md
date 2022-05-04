docker build -t "node_truffle_ganache" .
docker run -p 8545:8545 -p 3000:3000 -d -t -v /$(PWD):/apps --name node_truffle_ganache node_truffle_ganache
docker exec -it node_truffle_ganache bash
cd apps
ganache-cli -m dsu -h 0.0.0.0
truffle test

docker build -t "node_truffle_ganache" .
docker run -p 8545:8545 -p 3000:3000 -p 3001:3001 -p 8080:8080 -d -t -v /$(PWD):/apps --name node_truffle_ganache node_truffle_ganache 
docker exec -it node_truffle_ganache bash
truffle test
nodemon --legacy-watch src/js/server.js -watch
run.sh




let SC = await Admin.deployed();
await addClient('0x07E4bE8e931Ea6c7D694350552e127182a32f211');
await instance.addScores('0x07E4bE8e931Ea6c7D694350552e127182a32f211', 20);

//3

It looks like you deployed to the development network but are running truffle console with the default network, so assume that these are different.

You should deploy and use the console on the same network.

truffle migrate --network development
truffle console --network development
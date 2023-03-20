console.log("Loading libraries")
const express = require('express')
const app = express()
const port = 8080;
const Web3 = require('web3');
const TruffleContract = require('truffle-contract');
const ElectionJSON = require('../../build/contracts/Election.json'); // import your compiled contract JSON

const web3 = new Web3('http://localhost:8545'); // assuming you're using Ganache CLI on the default port

const Election = TruffleContract(ElectionJSON);
Election.setProvider(web3.currentProvider);
let SC;
let accounts = [];
const start = async function(a, b) { 
  console.log("TEST ASYNC")
  SC = await Election.new( {from: "0x07E4bE8e931Ea6c7D694350552e127182a32f211"});
  accounts = await web3.eth.getAccounts();
  for (let index = 0; index < accounts.length; index++) {
    await SC.addCandidate.sendTransaction("Candidate "+index,accounts[index], {from: accounts[0]});
    
  }
}
start();


const initialize = async function(a,b) {
  
  let accounts = await SC();
}
console.log("Libraries succesfully added")

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/candidate', async (req, res) => {

  let candidates = [];
  let candidatesCount = await SC.candidatesCount();
  candidatesCount = candidatesCount.toNumber();
  for (let i = 1; i <= candidatesCount; i++) {
    let candidate = await SC.candidates(i);
    candidates.push(candidate);
    
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true); // optional
  res.send(JSON.stringify({candidates:candidates,candidatesCount:candidatesCount}));
  
})
// POST method route
app.post('/candidate', async (req, res) => {
  console.log("Adding candidate")
  let err = await SC.addCandidate.sendTransaction("Candidate 3","0x07E4bE8e931Ea6c7D694350552e127182a32f211", {from: "0x07E4bE8e931Ea6c7D694350552e127182a32f211",
  gas: 3000000 });
    console.log("Candidate added")
  res.send(err);
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
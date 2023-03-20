const Web3 = require('web3');
const contract = require('truffle-contract');
const ElectionJSON = require('../../build/contracts/Election.json'); // import your compiled contract JSON

const web3 = new Web3('http://localhost:8545'); // assuming you're using Ganache CLI on the default port

const Election = contract(ElectionJSON);
Election.setProvider(web3.currentProvider);
const start = async function(a, b) { 
    console.log("TEST ASYNC")
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
}
start();
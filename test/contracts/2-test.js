var Admin = artifacts.require("./Admin.sol");

const fs = require('fs');

describe('Test', function () {
    contract("Admin", function () {

        it('check get cumulative scores', async function () {
            let accounts = await web3.eth.getAccounts();
            let SC = await Admin.new({ from: accounts[0] });
            await SC.addClient.sendTransaction(accounts[0], { from: accounts[0]});
            await SC.setCumScores.sendTransaction(accounts[0], [10,25,30,50,30], { from: accounts[0] });
            let cumScores = await SC.getAllCumScore(accounts[0]);
            
            await SC.setEvalScores.sendTransaction(accounts[0],accounts[1],[20,30,40,50], { from: accounts[0] });
            let evalScores = await SC.getEvalScores(accounts[0],accounts[1]);
            console.log(cumScores,evalScores);


        })
    })
});

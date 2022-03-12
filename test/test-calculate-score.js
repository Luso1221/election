var Admin = artifacts.require("./Admin.sol");
const timeMachine = require("./helper/time-machine");

// const truffleAssert = require('truffle-assertions');

describe('Start', function () {
  contract('Admin', function (accounts) {
    const client = accounts[0]; 
    let SC;
    let latestBlock;

    beforeEach('deploy contract', async function () {
      SC = await Admin.new();
      for (let index = 0; index < 5; index++) {
        await SC.addClientEvent(client, 1, {
          from: client
        });
      }

      latestBlock = await web3.eth.getBlock('latest');
    });

    it("Test calculate worker/training contribution", async function() {

      
    });
    it("Test calculate reviewer contribution", async function() {

      
    });
  });
});
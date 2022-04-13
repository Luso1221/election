var Admin = artifacts.require("./Admin.sol");

// const truffleAssert = require('truffle-assertions');

describe('Start', function () {
  contract('Admin', function (accounts) {
    const clients = accounts; 
    let SC;

    beforeEach('deploy contract', async function () {
      SC = await Admin.new();
      for (let index = 0; index < 8; index++) {
        await SC.addClient(clients[index], {from:clients[index]});
      }
    });


    it("Test address length", async function() {
      let clientCount = await SC.getClientCount();
      console.log("Address count",clientCount.toString());
    });
  });
});
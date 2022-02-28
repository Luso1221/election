var Admin = artifacts.require("./Admin.sol");
// const truffleAssert = require('truffle-assertions');

describe('Start', function () {
  contract('Admin', function (accounts) {
    const client = accounts[0]; 
    let SC;

    beforeEach('deploy contract', async function () {
      SC = await Admin.new();
    });

    it("should save credit", async function() {

      for (let index = 0; index < 5; index++) {
        
        await SC.addClientEvent(client, 1, {
          from: client
        });
        
      }

      await SC.saveCreditEvent(client, {from: client});
      
      let creditEvents = [];
      for (let index = 0; index < 5; index++) {
        let creditEvent = await SC.getCreditEvent(client,index,{from:client});
        creditEvents.push({score:creditEvent[0].toString(),time:creditEvent[1].toString()})
      }
      assert.notEqual(creditEvents[0].score,0, "save credit not working");
    });
    
    it("should calculate credit score", async function() {

      await SC.calculateCreditScore(client, {from: client});
      
      let creditEvents = [];
      for (let index = 0; index < 5; index++) {
        let creditEvent = await SC.getCreditEvent(client,index,{from:client});
        creditEvents.push({score:creditEvent[0].toString(),time:creditEvent[1].toString()})
      }
      console.log("line30",creditEvents);
      // assert.notEqual(clientData[1], clientData2[1], "client doesn't gain exp");
    });
  });
});
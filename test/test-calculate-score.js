var Admin = artifacts.require("./Admin.sol");
const timeMachine = require("./helper/time-machine");

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

    it("Test calculate worker/training contribution", async function() {
      let randomValues = [];
      for (let index = 1; index < clients.length; index++) {
        let randomValue = Math.ceil(Math.random() * 75 + 25);
        // console.log(randomValue);
        await SC.setEvalScore(randomValue,clients[0],clients[index]);
        randomValues.push(randomValue);
      }
      await SC.setScore(50,clients[0])
      let score = await SC.calculateWorkerContribution.call(clients[0], {
        from: clients[0]
      });
      console.log(randomValues);
      console.log("Worker contribution :",score.toString());
      
    });
    it("Test calculate reviewer contribution", async function() {
      let randomValues = [];
      for (let index = 1; index < clients.length; index++) {
        let randomValue = Math.ceil(Math.random() * 75 + 25);
        // console.log(randomValue);
        await SC.setEvalScore(randomValue,clients[0],clients[index]);
        randomValues.push(randomValue);
      }
      await SC.setScore(50,clients[0])
      let score = await SC.calculateReviewerContribution.call(clients[0], {
        from: clients[0]
      });
      console.log(randomValues);
      console.log("Worker contribution :",score.toString());

    });
  });
});
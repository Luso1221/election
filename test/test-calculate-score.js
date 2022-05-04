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

    // it("Test calculate worker/training contribution (odd numbers)", async function() {
    //   let randomValuesOdd = [30,10,20,60,50];
    //   for (let index = 0; index < randomValuesOdd.length; index++) {
    //     await SC.setEvalScore(randomValuesOdd[index],clients[0],clients[index+1]);
    //   }
    //   await SC.setScore(30,clients[0])
    //   let score = await SC.calculateWorkerContribution(clients[0], {
    //     from: clients[0]
    //   });
    //   console.log("Worker contribution :",score.toString());
      
    // });
    // it("Test calculate worker/training contribution (even numbers)", async function() {
    //   let randomValuesEven = [30,10,20,60,50,40];
    //   for (let index = 0; index < randomValuesEven.length; index++) {
    //     await SC.setEvalScore(randomValuesEven[index],clients[0],clients[index+1]);
    //   }
    //   await SC.setScore(30,clients[0])
    //   let score = await SC.calculateWorkerContribution(clients[0], {
    //     from: clients[0]
    //   });
    //   console.log("Worker contribution :",score.toString());
      
    // });
    // it("Test calculate reviewer contribution (odd numbers)", async function() {
    //   let randomValuesOdd = [300,100,20,60,50];
    //   for (let index = 0; index < randomValuesOdd.length; index++) {
    //     await SC.setEvalScore(randomValuesOdd[index],clients[0],clients[index+1]);
    //   }
    //   await SC.setScore(30,clients[0])
    //   let differences = await SC.calculateReviewerContribution(clients[1], {
    //     from: clients[0]
    //   });
    //   let punishedList = await SC.getPunishedList();
      
    //   console.log("Reviewer contribution :",differences[0].toString());
    //   console.log("Punished list :",punishedList);
      
    // });
    it("Test calculate reviewer contribution (even numbers)", async function() {
      let randomValuesEven = [300,10,20,60,50,40];
      for (let index = 0; index < randomValuesEven.length; index++) {
        await SC.setEvalScore(randomValuesEven[index],clients[0],clients[index+1]);
      }
      await SC.setScore(30,clients[0])
      
      await SC.calculateReviewerContribution(clients[1], {
        from: clients[0]
      });
      
      let punishedList = await SC.getPunishedList();
      
      // console.log("Reviewer contribution :",differences);
      console.log("Punished list :",punishedList);
    });

    // it("Test get addresses",async function(){
    //   let addresses = await SC.getAddresses();
    //   console.log("Addresses: ",addresses);
    //   let length = await SC.getClientCount();
    //   console.log("Addresses length: ",length);
    // })
  });
});
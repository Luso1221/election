// var Admin = artifacts.require("./Admin.sol");
// const timeMachine = require("./helper/time-machine");

// // const truffleAssert = require('truffle-assertions');

//Start stage
//Commit-Train
//Reveal-Train
//Commit-Eval
//Reveal-Eval
//Aggregate
// describe('Stage test', function () {
//   contract('Admin', function (accounts) {
//     const client = accounts[0]; 
//     let SC;

//     beforeEach('', async function () {
//       SC = await Admin.new();
//       for (let index = 0; index < 5; index++) {
//         await SC.addClientEvent(client, 1, {
//           from: client
//         });
//       }

//       await SC.saveCreditEvent(client, {from: client});
      
//       let creditEvents = [];
//       for (let index = 0; index < 5; index++) {
//         let creditEvent = await SC.getCreditEvent(client,index,{from:client});
//         creditEvents.push({score:creditEvent[0].toString(),time:creditEvent[1].toString()})
//       }
//       latestBlock = await web3.eth.getBlock('latest');
//     });

//     it("Credit score before advancing time", async function() {

//       let creditScore = await SC.calculateCreditScore(client, {from: client});

//       console.log("Credit score before advancing time",creditScore.toString());

//       latestNewBlock = await web3.eth.getBlock('latest');
//       console.log("Timestamp diff",latestNewBlock.timestamp - latestBlock.timestamp);
//     });
//     it("Credit score after time + 12H", async function() {

//       await timeMachine.advanceTimeAndBlock(43200);
//       creditScore = await SC.calculateCreditScore(client, {from: client});
      
//       console.log("Credit score after 12hr :",creditScore.toString());

//       latestNewBlock = await web3.eth.getBlock('latest');
//       console.log("Timestamp diff",latestNewBlock.timestamp - latestBlock.timestamp);
//     });
//     it("Credit score after time + 1D", async function() {

//       await timeMachine.advanceTimeAndBlock(86400);
      

//       creditScore = await SC.calculateCreditScore(client, {from: client});

//       console.log("Credit score after 1d :",creditScore.toString());

//       latestNewBlock = await web3.eth.getBlock('latest');
//       console.log("Timestamp diff",latestNewBlock.timestamp - latestBlock.timestamp);
//     });
//   });
// });
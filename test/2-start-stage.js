var Admin = artifacts.require("./Admin.sol");
const timeMachine = require("./helper/time-machine");
const objectHash = require("object-hash");
const datefns = require("date-fns");
// const truffleAssert = require('truffle-assertions');

// Start stage
// Commit-Train
// Reveal-Train
// Commit-Eval
// Reveal-Eval
// Aggregate
describe('Stage test', function () {
  contract('Admin', function (accounts) {
    const client = accounts[0]; 
    const baseDeposit = 100;
    let SC;
    let model;
      
    beforeEach('deploy contract', async function () {
        SC = await Admin.new();
    })

    
    it("start stage", async function() {
      let model = [];
      let dataset = require('./dataset.json');
      let ipfsData = {
        model : model,
        dataset : dataset,
        task_description : "SUPERVISED", 
        timestamp : new Date().toISOString(),
        nonce : Date.now(),
      }
      // Y ipfs
      // 1 = IPFS(M(0) | dtest | task desc | timestamp now | nonce )
      let ipfsHash = objectHash(ipfsData);
      console.log(ipfsData);
      console.log(ipfsHash);
      // let creditScore = await SC.calculateCreditScore(client, {from: client});

      // console.log("Credit score before advancing time",creditScore.toString());

      // latestNewBlock = await web3.eth.getBlock('latest');
      // console.log("Timestamp diff",latestNewBlock.timestamp - latestBlock.timestamp);
//       task target (e.g., achieving 90% accuracy),
//  the base deposit value , the total reward for this task R, the minimum clients
//  level lmin, and reputation Cmin to join the task.
      await SC.addClient(client);

      let taskTargetAccuracy = 90; // accuracy
      let minClientLevel = 1;
      let minimumReputation = 0;
      let currentTime = new Date();
      let registrationTimeout = datefns.addDays(currentTime,1);
      
      
      //combo 
      
      

      // total deposit = beta+ lmin/li * beta + min reputation / current reputation  * beta
      minimumDeposit = baseDeposit + minClientLevel/client.
    });
  });
});
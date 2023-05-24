// const { log } = require("console");

// var Election = artifacts.require("./Election.sol");

// contract("Election", function(accounts) {
//   let SC;
//   let voterAccounts = [true,true,true,false,false,false,false,false,false,false];
//   let maliciousAccounts = [false,true,false,false,false,true,true,true,true,true];
//   // let initialModelAccuracy = 80;
//   beforeEach('deploy contract', async function () {
//     SC = await Election.new();
//   });
//   it('perform training simulation', async function () {
    
//     console.log("Initializing trainers and mock malicious users..")
//     let candidates = [];
//     let voters = [];
//     // let number_of_trainers_selected = 3;
//     let accounts = await web3.eth.getAccounts();
//     for (let index = 0; index < accounts.length; index++) {
//       await SC.addCandidate.sendTransaction("Candidate "+index,accounts[index], {from: accounts[0]});
//     }
//     let candidatesCount = await SC.candidatesCount();
//     candidatesCount = candidatesCount.toNumber();
    
//     for (let i = 1; i <= candidatesCount; i++) {
//       let indexArray = i-1;
//       let candidate = await SC.candidates(i);

//       const randomValue = Math.random() * (80 - 70) + 70;
//       const randomValueMalicious = Math.random() * (70 - 60) + 60;

//       if (!voterAccounts[indexArray])
//         candidates.push({candidate:candidate, accuracy: maliciousAccounts[indexArray] ? randomValueMalicious:randomValue });
//       else
//         voters.push({voter:candidate, votes: []})
      
//       // log(candidates[indexArray].accuracy);
//     }

//     console.log("Candidate scores are selected..")

//     let candidateScores = Array(candidates.length).fill(0);
//     for (let i = 0; i < voters.length; i++) {
//       for (let j = 0; j < candidates.length; j++) {
//         if(maliciousAccounts[i]){
//           if(maliciousAccounts[j]){
//             voters[i].votes.push(j);
//             candidateScores[j] += voters[i].reputation;
//           } 
//         } 

//         if(!maliciousAccounts[i]) {
//           if(!maliciousAccounts[j]){
//             voters[i].votes.push(j);
//             candidateScores[j] += voters[i].reputation;
//           } 
//         }
//       }
      
//     }

//     console.log("Selecting highest scores..")
//     //get highest scores 
//     let highest1 = 0;
//     let highest2 = 0;
//     let highest3 = 0;

//     for (let i = 0; i < candidates.length; i++) {

//       if (candidates[i] > candidateScores[highest1]) {
//         highest3 = highest2;
//         highest2 = highest1;
//         highest1 = i;
//       } else if (candidates[i] > candidateScores[highest2]) {
//         highest3 = highest2;
//         highest2 = i;
//       } else if (candidates[i] > candidateScores[highest3]) {
//         highest3 = i;
//       }
//     }
//     console.log("1. Candidate" + highest1 + ", accuracy : " + candidates[highest1].accuracy);
//     console.log("2. Candidate" + highest2 + ", accuracy : " + candidates[highest2].accuracy);
//     console.log("3. Candidate" + highest3 + ", accuracy : " + candidates[highest3].accuracy);
//     let globalAccuracyAfterAveraging = (candidates[highest1].accuracy + candidates[highest2].accuracy + candidates[highest3].accuracy) / 3;
   
//     console.log("Check voters who vote on lower scores and trainers with low accuracy..");
//     let punishList = [];
//     for (let i = 0; i < candidates.length; i++) {
//       if(candidates[i].accuracy < candidates[highest3].accuracy) {
//         punishList.push(i);
//         for (let j = 0; j < voters.length; j++) {
//           if(voters[j].votes.includes(i) && !punishList.includes(j)){
//             punishList.push(j);
//           }
//         }
//       }
//     }
//     console.log("List of candidates and voters with low scores:",punishList);

//     console.log("New global accuracy: ",globalAccuracyAfterAveraging);

//     //aggregator submits the new averaged model to blockchain
    
    
//   });
//   // it("initializes with two candidates", function() {
//   //   return Election.deployed().then(function(instance) {
//   //     return instance.candidatesCount();
//   //   }).then(function(count) {
//   //     assert.equal(count, 2);
//   //   });
//   // });

//   // it("it initializes the candidates with the correct values", function() {
//   //   return Election.deployed().then(function(instance) {
//   //     electionInstance = instance;
//   //     return electionInstance.candidates(1);
//   //   }).then(function(candidate) {
//   //     assert.equal(candidate[0], 1, "contains the correct id");
//   //     assert.equal(candidate[1], "Candidate 1", "contains the correct name");
//   //     assert.equal(candidate[2], 0, "contains the correct votes count");
//   //     assert.equal(candidate[3], '0x66E69B9590Bfa91DeA91059C13fbDd83c803E897', "contains the correct address");
//   //     return electionInstance.candidates(2);
//   //   }).then(function(candidate) {
//   //     assert.equal(candidate[0], 2, "contains the correct id");
//   //     assert.equal(candidate[1], "Candidate 2", "contains the correct name");
//   //     assert.equal(candidate[2], 0, "contains the correct votes count");
//   //   });
//   // });

//   // it("allows a voter to cast a vote", function() {
//   //   return Election.deployed().then(function(instance) {
//   //     electionInstance = instance;
//   //     candidateId = 1;
//   //     return electionInstance.vote(candidateId, { from: accounts[0] });
//   //   }).then(function(receipt) {
//   //     assert.equal(receipt.logs.length, 1, "an event was triggered");
//   //     assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
//   //     assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct");
//   //     return electionInstance.voters(accounts[0]);
//   //   }).then(function(voted) {
//   //     assert(voted, "the voter was marked as voted");
//   //     return electionInstance.candidates(candidateId);
//   //   }).then(function(candidate) {
//   //     var voteCount = candidate[2];
//   //     assert.equal(voteCount, 1, "increments the candidate's vote count");
//   //   })
//   // });

//   // it("throws an exception for invalid candiates", function() {
//   //   return Election.deployed().then(function(instance) {
//   //     electionInstance = instance;
//   //     return electionInstance.vote(99, { from: accounts[1] })
//   //   }).then(assert.fail).catch(function(error) {
//   //     assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
//   //     return electionInstance.candidates(1);
//   //   }).then(function(candidate1) {
//   //     var voteCount = candidate1[2];
//   //     assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
//   //     return electionInstance.candidates(2);
//   //   }).then(function(candidate2) {
//   //     var voteCount = candidate2[2];
//   //     assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
//   //   });
//   // });

//   // it("throws an exception for double voting", function() {
//   //   return Election.deployed().then(function(instance) {
//   //     electionInstance = instance;
//   //     candidateId = 2;
//   //     electionInstance.vote(candidateId, { from: accounts[1] });
//   //     return electionInstance.candidates(candidateId);
//   //   }).then(function(candidate) {
//   //     var voteCount = candidate[2];
//   //     assert.equal(voteCount, 1, "accepts first vote");
//   //     // Try to vote again
//   //     return electionInstance.vote(candidateId, { from: accounts[1] });
//   //   }).then(assert.fail).catch(function(error) {
//   //     assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
//   //     return electionInstance.candidates(1);
//   //   }).then(function(candidate1) {
//   //     var voteCount = candidate1[2];
//   //     assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
//   //     return electionInstance.candidates(2);
//   //   }).then(function(candidate2) {
//   //     var voteCount = candidate2[2];
//   //     assert.equal(voteCount, 1, "candidate 2 did not receive any votes");
//   //   });
//   // });
// });

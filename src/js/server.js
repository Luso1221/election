
const express = require('express');
const app = express();
const port = process.argv[3] == undefined ? 8080 : process.argv[3];
const Web3 = require('web3');
const helpers = require('./helpers');
const trainingReview = require('./training-review');
const TruffleContract = require('truffle-contract');
const ElectionJSON = require('../../build/contracts/Election.json'); // import your compiled contract JSON
const AdminJSON = require('../../build/contracts/Admin.json'); // import your compiled contract JSON
const web3 = new Web3('http://localhost:8545'); // assuming you're using Ganache CLI on the default port
const NUMBER_OF_ITERATIONS = 11;
const Election = TruffleContract(ElectionJSON);
const Admin = TruffleContract(AdminJSON);
Election.setProvider(web3.currentProvider);
Admin.setProvider(web3.currentProvider);
let SC;
let SC2;
let accounts = [];

const initialize = async function() { 
  accounts = await web3.eth.getAccounts();
  SC = await Election.new({from:accounts[0]});
  SC2 = await Admin.new({from:accounts[0]});
  // let voterAccounts = [
  //   true,true,true,true,true,true,true,true,true,true,
  //   false,false,false,false,false,false,false,false,false,false,
  //   false,false,false,false,false,false,false,false,false,false
  // ];
  // let maliciousAccounts = [
  //   true,true,true,true,true,false,false,false,false,false,
  //   false,false,false,false,false,false,false,false,false,false,
  //   true,true,true,true,true,true,true,true,true,true
  // ];
  // for (let index = 0; index < accounts.length; index++) {
  //   let rng = 50;
  //   if(maliciousAccounts[index]){
  //     rng = 60;
  //   } else {
  //     rng = 40;
  //   }
  //   // rng = Math.ceil(Math.random() * 50 + 40);
  //   await SC.addCandidate.sendTransaction("Candidate "+index,accounts[index],rng,maliciousAccounts[index],voterAccounts[index], {from: accounts[0]});
  // }
  // let candidatesCount = await SC.candidatesCount();

  // console.log(candidatesCount.toNumber());
  
};
// start();

app.get('/', (req, res) => {
  res.send('Hello World!')
})
// app.get('/chart', async (req,res) => {
//   const Chart = require('chart.js');
//   const canvas = createCanvas(400, 400);
//   const chart = new Chart(ctx, {
//     type: 'pie',
//     data: {
//       labels: ['Red', 'Blue', 'Yellow'],
//       datasets: [{
//         label: '# of Votes',
//         data: [12, 19, 3],
//         backgroundColor: [
//           'rgba(255, 99, 132, 0.2)',
//           'rgba(54, 162, 235, 0.2)',
//           'rgba(255, 206, 86, 0.2)'
//         ],
//         borderColor: [
//           'rgba(255, 99, 132, 1)',
//           'rgba(54, 162, 235, 1)',
//           'rgba(255, 206, 86, 1)'
//         ],
//         borderWidth: 1
//       }]
//     },
//     options: {
//       scales: {
//         yAxes: [{
//           ticks: {
//             beginAtZero: true
//           }
//         }]
//       }
//     }
//   });

//   const chartUrl = canvas.toDataURL();
//   res.render('test', { chartUrl });

// })

app.get('/candidate', async (req, res) => {

  let candidates = [];
  let candidatesCount = await SC.candidatesCount();
  candidatesCount = candidatesCount.toNumber();
  for (let i = 0; i < candidatesCount; i++) {
    let address = await SC.addressList(i);
    let candidate = await SC.candidates(address);
    candidates.push(candidate);
    
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true); // optional
  res.send(JSON.stringify({candidates:candidates,candidatesCount:candidatesCount}));
  
})
app.get('/us01', function(req, res) {
  console.log(req.query);
  res.send("ok");
});
app.get('/test', async(req,res)=>{
  console.log("Initializing trainers and mock malicious users..")
    
  console.log("Line 112: ",req.query, res.query);
  let voterAccounts = [];
  let maliciousAccounts = [];
  let filename = req.query.choice;
  let totalRepeat = 10;

  let startingSnapshot = await helpers.takeSnapshot(web3);
  let number_of_clients = req.query.clients != undefined ? req.query.clients : 0;
  console.log("Total clients:",number_of_clients)
  if (req.query.choice == '2') {

    voterAccounts = [
      true,true,true,true,true,true,true,true,true,true,
      true,true,true,true,true,true,true,true,true,true,
      true,true,true,true,true,true,true,true,true,true,
    ];
    maliciousAccounts = [
      true,true,true,true,true,false,false,false,false,false,
      false,false,false,false,false,false,false,false,false,false,
      true,true,true,true,true,true,true,true,true,true
    ];

  } else {
    
    voterAccounts = helpers.assignMalicious(number_of_clients,0.5);
    maliciousAccounts = helpers.assignMalicious(number_of_clients,0.5);
  }

  for (let i = 0; i < number_of_clients; i++) {
    let rng = 50;
    if(maliciousAccounts[i]){
      rng = 60;
    } else {
      rng = 40;
    }
    let isTrainer = true;
    let isMalicious = false;
    // if (req.query.choice == '1')
    // isTrainer = !(voterAccounts[i]);
    // else
    // isTrainer = true;

    if(maliciousAccounts.includes(i))
    isMalicious = true;

    if(voterAccounts.includes(i))
    isTrainer = false;
    // rng = Math.ceil(Math.random() * 50 + 40);
    await SC.addCandidate.sendTransaction("Candidate "+i,accounts[i],rng,isMalicious,!isTrainer,isTrainer, {from: accounts[0]});
  }
  let allRepeats = [];
  for (let n = 0; n < totalRepeat; n++) {
    
    let repeatSnapshot = await helpers.takeSnapshot(web3);
    let trainingResults = [];
    for (let i = 0; i < NUMBER_OF_ITERATIONS; i++) {
      console.log("iteration " + (i+1));
      let result = await helpers.doTraining(SC, accounts[0],i);
      trainingResults.push(result);
    }
    allRepeats.push([]);
    allRepeats[n] = trainingResults;
    await helpers.revertToSnapShot(web3,repeatSnapshot['result']);
  }
  // for (let i = 0; i < NUMBER_OF_ITERATIONS; i++) {
  //   let total = 0;
  //   for (let j = 0; j < NUMBER_OF_ITERATIONS; j++) {
  //     total = total + allRepeats[j][i]
  //   }
  //   total = total / NUMBER_OF_ITERATIONS;
  //   averages.push(total);
  // }

  // const FileSystem = require("fs");
  // FileSystem.writeFile(filename+'.json', JSON.stringify(trainingResults), (error) => {
  //    if (error) throw error;
  //  });
  await helpers.revertToSnapShot(web3,startingSnapshot['result']);
  console.log("Finished all the training")
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true); // optional
  res.send(JSON.stringify({allRepeats}))
})
app.get('/train',async(req,res)=>{
  
})
// POST method route
app.post('/candidate', async (req, res) => {
  console.log("Adding candidate")
  let startReputation = Math.random() * 50 + 40;
  let err = await SC.addCandidate.sendTransaction("Candidate 3","0x07E4bE8e931Ea6c7D694350552e127182a32f211", startReputation, {from: "0x07E4bE8e931Ea6c7D694350552e127182a32f211",
  gas: 3000000 });
    console.log("Candidate added")
  res.send(err);
})

app.get('/data', async (req, res) => {
  const fs = require('fs');
  var trainingResults = JSON.parse(fs.readFileSync('1.json', 'utf8'));
  var trainingResults2 = JSON.parse(fs.readFileSync('2.json', 'utf8'));
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true); // optional
  res.send(JSON.stringify({trainingResults,trainingResults2}))
})

app.get('/result', async (req, res) => {
    
  console.log("Line 231: ",req.query, res.query);
  let filename = req.query.choice;
  let totalRepeat = 10;

  let startingSnapshot = await helpers.takeSnapshot(web3);
  let number_of_clients = req.query.clients != undefined ? req.query.clients : 0;
  console.log("Total clients:",number_of_clients)
  
  for (let i = 0; i < number_of_clients; i++) {
    
    // rng = Math.ceil(Math.random() * 50 + 40);
    await SC2.addClient.sendTransaction(accounts[i], {from: accounts[0]})
  }
  
  let allRepeats = [];
  for (let n = 0; n < totalRepeat; n++) {
    
    let repeatSnapshot = await helpers.takeSnapshot(web3);
    let trainingResults = [];
    for (let i = 0; i < NUMBER_OF_ITERATIONS; i++) {
      console.log("iteration " + (i+1));
      let result = await trainingReview.doTrainingAndReview(SC2, accounts[0],i);
      trainingResults.push(result);
    }
    allRepeats.push([]);
    allRepeats[n] = trainingResults;
    await helpers.revertToSnapShot(web3,repeatSnapshot['result']);
  }
  await helpers.revertToSnapShot(web3,startingSnapshot['result']);
  console.log("Finished all the training")
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true); // optional
  res.send(JSON.stringify({allRepeats}))
})



app.listen(port, async () => {

  console.log("Loading libraries and init contract")
  await initialize();
  console.log(`Example app listening on port ${port}`)
  console.log("Setup finished")
})

function getAverage(arr){
  let total = 0;
  for (let index = 0; index < arr.length; index++) {
    total += arr[index]
  }
  return total / arr.length;
}
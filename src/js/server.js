
const express = require('express')
const app = express()
const port = 8080;
const Web3 = require('web3');
const helpers = require('./helpers');
const TruffleContract = require('truffle-contract');
const ElectionJSON = require('../../build/contracts/Election.json'); // import your compiled contract JSON

const web3 = new Web3('http://localhost:8545'); // assuming you're using Ganache CLI on the default port
const NUMBER_OF_ITERATIONS = 10;
const Election = TruffleContract(ElectionJSON);
Election.setProvider(web3.currentProvider);
let SC;
let accounts = [];

const initialize = async function() { 
  accounts = await web3.eth.getAccounts();
  SC = await Election.new({from:accounts[0]});
  
  let voterAccounts = [
    true,true,true,true,true,true,true,true,true,true,
    false,false,false,false,false,false,false,false,false,false,
    false,false,false,false,false,false,false,false,false,false,
    false,false,false,false,false,false,false,false,false,false,
    true,true,true,true,true,true,true,true,true,true
  ];
  let maliciousAccounts = [
    true,true,true,true,true,true,true,true,true,true, //voter
    false,false,false,false,false,false,false,false,false,false, //trainer
    true,true,true,true,true,false,false,false,false, //trainer
    false,false,false,false,false,false,false,false,false,false, //trainer
    false,false,false,false,false,false,false,false,false,false //voter
  ];
  for (let index = 0; index < accounts.length; index++) {
    let rng = 50;
    // if(maliciousAccounts[index] && voterAccounts[index]){
    //   rng = 60;
    // } else {
    //   rng = 40;
      // rng = Math.ceil(Math.random() * 50 + 40);
    // }
    await SC.addCandidate.sendTransaction("Candidate "+index,accounts[index],rng,maliciousAccounts[index],voterAccounts[index], {from: accounts[0]});
  }
  let candidatesCount = await SC.candidatesCount();

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

app.get('/test', async(req,res)=>{
  console.log("Initializing trainers and mock malicious users..")
    
  let trainingResults = [];

  for (let i = 0; i < NUMBER_OF_ITERATIONS; i++) {
    console.log("iteration " + (i+1));
    let result = await helpers.doTraining(SC, accounts[0]);
    trainingResults.push(result);
  }


  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true); // optional
  res.send(JSON.stringify({trainingResults}))
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


app.listen(port, async () => {

  console.log("Loading libraries and init contract")
  await initialize();
  console.log(`Example app listening on port ${port}`)
  console.log("Setup finished")
})
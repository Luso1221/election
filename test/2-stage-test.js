var Admin = artifacts.require("./Admin.sol");
const timeMachine = require("./helper/time-machine");
const objectHash = require("object-hash");
const datefns = require("date-fns");
const ethCrypto = require('eth-crypto');
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
      
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
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
      
      await SC.addClient(client);
      //0 level, 1 experience, 2 experienceNext, 3 events
      let clientData = await SC.getClient(client, {
        from: client
      });
      

      let taskTargetAccuracy = 90; // accuracy
      let minClientLevel = 1;
      let minimumReputation = 0;
      let currentTime = new Date();
      let registrationTimeout = datefns.addDays(currentTime,1);
     
      //combo 
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
      });
      
      await SC.setPublicKey(client, publicKey.toString());

      // total deposit = beta+ lmin/li * beta + min reputation / current reputation  * beta
      let minimumDeposit = baseDeposit + minClientLevel/clientData[0] * baseDeposit + minimumReputation / 1 * baseDeposit;

      client.deposit(minimumDeposit);

      //prolong registration step?

    });
    it("commit-train stage", async function(){
      
      const randomSecretKey  = crypto.generateKey('hmac', { length: 64 }, (err, key) => {
        if (err) throw err;
        console.log(key.export().toString('hex'));  // 46e..........620
      });

      const signature = crypto.sign('sha',randomSecretKey,privateKey);

      const identity = ethCrypto.createIdentity();
      const publicKey = ethCrypto.publicKeyByPrivateKey(
        identity.privateKey
      );
      const privateKey = ethCrypto.publicKeyByPrivateKey(
        identity.privateKey
      );
      




    })
  });
});
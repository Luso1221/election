var Admin = artifacts.require("./Admin.sol");
const datefns = require("date-fns");
const EthCrypto = require("eth-crypto");
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
      let ipfsHash =  EthCrypto.hash.keccak256(ipfsData);
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
      // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      //   modulusLength: 2048,
      // });
      
      // await SC.setPublicKey(client, publicKey.toString());

      // total deposit = beta+ lmin/li * beta + min reputation / current reputation  * beta
      let minimumDeposit = baseDeposit + minClientLevel/clientData[0] * baseDeposit + minimumReputation / 1 * baseDeposit;

      await SC.deposit(minimumDeposit, {from: client});

      
      //prolong registration step?

    });
    it("commit-train stage", async function(){
      
      const trainerIdentity = EthCrypto.createIdentity();
      const modelOwnerIdentity = EthCrypto.createIdentity();
      const randomSecretKey = EthCrypto.publicKeyByPrivateKey(modelOwnerIdentity.privateKey);
      
      
      
      const hashedSecretKey  = EthCrypto.hash.keccak256(randomSecretKey);
      const secretKeySignature = EthCrypto.sign(modelOwnerIdentity.privateKey, hashedSecretKey);
      
      const encryptedSecretKeyObject = await EthCrypto.encryptWithPublicKey(trainerIdentity.publicKey, hashedSecretKey);
      const encryptedSecretKey = EthCrypto.cipher.stringify(encryptedSecretKeyObject);
      console.log({modelOwnerIdentity})
      console.log({trainerIdentity})
      console.log({randomSecretKey});
      console.log({hashedSecretKey});
      console.log({encryptedSecretKey});
      console.log({secretKeySignature})
      
      const parsedSecretKey = EthCrypto.cipher.parse(encryptedSecretKey);
      const decryptedSecretKey = await EthCrypto.decryptWithPrivateKey(trainerIdentity.privateKey,parsedSecretKey)

      const model = [];
      // try {

      //   let wrongDecryptSecretKey = await EthCrypto.decryptWithPrivateKey(modelOwnerIdentity.privateKey,parsedSecretKey)
      //   console.log({wrongDecryptSecretKey});
      // } catch (error) {
      //   console.log({error});
      // }
      const recoveredSecretKeySignature = EthCrypto.recoverPublicKey(secretKeySignature,hashedSecretKey);
      console.log({recoveredSecretKeySignature});
      
      console.log({decryptedSecretKey});

      const ipfsData2 = {
        secretKeySignature : secretKeySignature,
        encryptedSecretKey : encryptedSecretKey
      }
      const secretKeyHash = EthCrypto.hash.keccak256(ipfsData2);
      
      // let c = await SC.getClient(client);
      // console.log({clientKey},clientKey);
      const hashedModel = EthCrypto.hash.keccak256(model);
      const encryptedModelObject = await EthCrypto.encryptWithPublicKey(trainerIdentity.publicKey, hashedModel);
      const encryptedModel = EthCrypto.cipher.stringify(encryptedModelObject);
      const modelSignature = EthCrypto.sign(trainerIdentity.privateKey, hashedModel);
      const ipfsData3 = {
        modelSignature : modelSignature,
        model : encryptedModel        
      }
      const commitHash = EthCrypto.hash.keccak256(ipfsData3);

      console.log({secretKeyHash});
      console.log({commitHash});

      //reveal train stage
      
      
    });
  });
});
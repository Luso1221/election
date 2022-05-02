var Admin = artifacts.require("./Admin.sol");
const EthCrypto = require('eth-crypto');

// CJS
const {parse, stringify, toJSON, fromJSON} = require('flatted');
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
    let SC;
      
    beforeEach('deploy contract', async function () {
        SC = await Admin.new();
        await SC.addClient(client ,{
          from: client
        });
    })

    it("set level", async function() {
      await SC.setLevel(client, 5);

      let c = await SC.getClient(client);
      console.log(JSON.stringify(c));
    })
    
    it("set public key and signature", async function() {

      const trainerIdentity = EthCrypto.createIdentity();
      const modelOwnerIdentity = EthCrypto.createIdentity();
      const randomSecretKey = EthCrypto.publicKeyByPrivateKey(modelOwnerIdentity.privateKey);
      
      
      
      const hashedSecretKey  = EthCrypto.hash.keccak256(randomSecretKey);
      let signature = EthCrypto.sign(modelOwnerIdentity.privateKey, hashedSecretKey);
      
      let encryptedSecretKeyObject = await EthCrypto.encryptWithPublicKey(trainerIdentity.publicKey, hashedSecretKey);
      let encryptedSecretKey = EthCrypto.cipher.stringify(encryptedSecretKeyObject);
      console.log({modelOwnerIdentity})
      console.log({trainerIdentity})
      console.log({randomSecretKey});
      console.log({hashedSecretKey});
      console.log({encryptedSecretKey});
      console.log({signature})
      
      const parsedSecretKey = EthCrypto.cipher.parse(encryptedSecretKey);
      let decryptedSecretKey = await EthCrypto.decryptWithPrivateKey(trainerIdentity.privateKey,parsedSecretKey)

      try {

        let wrongDecryptSecretKey = await EthCrypto.decryptWithPrivateKey(modelOwnerIdentity.privateKey,parsedSecretKey)
        console.log({wrongDecryptSecretKey});
      } catch (error) {
        console.log({error});
      }
      let recoveredSignature = EthCrypto.recoverPublicKey(signature,hashedSecretKey);
      console.log({recoveredSignature});
      
      console.log({decryptedSecretKey});


      
      // let c = await SC.getClient(client);
      // console.log({clientKey},clientKey);
      let commitHash = EthCrypto.hash.keccak256();

    })

  });
});
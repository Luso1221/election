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
      
      await SC.setPublicKey(client, trainerIdentity.publicKey);

      let c = await SC.getClient(client);
      // console.log({clientKey},clientKey);
      
      let clientKey = c[4];
      const hashedSecretKey  = EthCrypto.hash.keccak256(randomSecretKey);
      let signature = EthCrypto.sign(modelOwnerIdentity.privateKey, hashedSecretKey);
      
      let encryptedSecretKey = EthCrypto.encryptWithPublicKey(clientKey, hashedSecretKey);

      
      console.log({hashedSecretKey},hashedSecretKey);
      console.log({encryptedSecretKey},encryptedSecretKey);
      console.log({signature},signature);


    })

  });
});
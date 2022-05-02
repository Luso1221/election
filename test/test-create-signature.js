
const EthCrypto = require('eth-crypto');


async function test () {

  const trainerIdentity = EthCrypto.createIdentity();
  const modelOwnerIdentity = EthCrypto.createIdentity();
  const randomSecretKey = EthCrypto.publicKeyByPrivateKey(modelOwnerIdentity.privateKey);
  
  
  
  const hashedSecretKey  = EthCrypto.hash.keccak256(randomSecretKey);
  let signature = EthCrypto.sign(modelOwnerIdentity.privateKey, hashedSecretKey);
  
  let encryptedSecretKey = await EthCrypto.encryptWithPublicKey(trainerIdentity.publicKey, hashedSecretKey);
  
  console.log({randomSecretKey},randomSecretKey);
  console.log({hashedSecretKey},hashedSecretKey);
  console.log({encryptedSecretKey},encryptedSecretKey);
  console.log({signature},signature)
  
}
test();
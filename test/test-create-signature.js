
const EthCrypto = require('eth-crypto');
// const utils = require('ethereumjs-utils');

async function test () {
  console.log(new Date())
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
}
test();
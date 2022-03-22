var Admin = artifacts.require("./Admin.sol");

// const truffleAssert = require('truffle-assertions');

describe('Start', function () {
  contract('Admin', function (accounts) {
    let SC;
    let array = [24,26,29,35,48,72,150,161,181,183,185];

    beforeEach('deploy contract', async function () {
      SC = await Admin.new();
    });

    it("Test", async function() {
      let result = await SC.test(array);

      let keys =  Object.keys(result);
      for (let index = 0; index < keys.length; index++) {
        const element = result[keys[index]];
        console.log("Index ",index," :",element.toString());
      }
    });
  });
});
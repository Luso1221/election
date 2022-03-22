var Admin = artifacts.require("./Admin.sol");

// const truffleAssert = require('truffle-assertions');

describe('Start', function () {
  contract('Admin', function (accounts) {
    let SC;
    let array = [24,26,29,35,48,72,150,161,181,183,183];

    beforeEach('deploy contract', async function () {
      SC = await Admin.new();
    });

    it("Test slice array 0-3", async function() {
      let result = await SC.getSlice(0,3,array);
      console.log("Original :",array.toString())
      console.log("Sliced 0-3:",result.toString())
    });
    it("Test slice array 4-5", async function() {
      let result = await SC.getSlice(4,5,array);
      console.log("Original :",array.toString())
      console.log("Sliced 4-5:",result.toString())
    });
    it("Test normalize array", async function() {
      let result = await SC.normalizeArray(array);
      console.log("Original :",array.toString())
      console.log("Normalized:",result.toString())
    });
  });
});
var Admin = artifacts.require("./Admin.sol");

// const truffleAssert = require('truffle-assertions');

describe('Start', function () {
  contract('Admin', function (accounts) {
    let SC;

    let randomValuesOdd = [30,10,20,60,50,500];
    let result;
    let quartiles;
    beforeEach('deploy contract', async function () {
      SC = await Admin.new();
       result = await SC.getQuarters(randomValuesOdd);
       quartiles = [result[0],result[1],result[2]];
      interQtr = quartiles[2]-quartiles[0];
    });

    it("Test malicious reviewer is too high", async function() {
      let isTooHigh = await SC.isReviewerScoreTooHigh(500,quartiles,interQtr);
      console.log("Is too high :",isTooHigh.toString());
      
    });
    it("Test malicious reviewer is too low", async function() {
      let isTooLow = await SC.isReviewerScoreTooLow(500,quartiles,interQtr);
      console.log("Is too low :",isTooLow.toString());
      
    });
  });
});
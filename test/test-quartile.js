var Admin = artifacts.require("./Admin.sol");
const timeMachine = require("./helper/time-machine");

// const truffleAssert = require('truffle-assertions');

describe('Test quartile', function () {
  contract('Admin', function () {
    let SC;

    beforeEach('Deploy contract', async function () {
      SC = await Admin.new();
    });

    it("Get quartiles", async function() {

      let arr = [24,26,29,35,48,72,150,161,181,183,183];
      
      let quartiles = await SC.getQuarters(arr);

      console.log("Q1:",quartiles[0]);
      console.log("Q2:",quartiles[1]);
      console.log("Q3:",quartiles[2]);

    });
    it("Test sort", async function(){
      
      let randomValues = [];
      for (let index = 0; index < 10; index++) {
        let randomValue = Math.ceil(Math.random() * 75 + 25);
        // console.log(randomValue);
        randomValues.push(randomValue);
      }
      let sortedRandomValues = await SC.sort(randomValues);
      console.log(randomValues);
      console.log(sortedRandomValues.toString());

    });
  });
});
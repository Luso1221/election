var Admin = artifacts.require("./Admin.sol");
const timeMachine = require("./helper/time-machine");

// const truffleAssert = require('truffle-assertions');

describe('Test quartile', function () {
  contract('Admin', function () {
    let SC;
    let arr = [500,10,20,60,50,40];

    beforeEach('Deploy contract', async function () {
      SC = await Admin.new();
    });

    it("Get quartiles", async function() {

      
      let sorted = await SC.sort(arr);
      console.log(sorted);
      let quartiles = await SC.getQuarters(sorted);

      console.log("Q1:",quartiles[0].toString());
      console.log("Q2:",quartiles[1].toString());
      console.log("Q3:",quartiles[2].toString());

    });
    it("Get median", async function() {

      
      let median = await SC.getMedian(arr);

      console.log("median :",median);

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
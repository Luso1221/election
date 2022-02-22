var Admin = artifacts.require("./Admin.sol");

contract("Admin", function() {
  var adminInstance;

  it("should be deployed", function() {
    return Admin.deployed().then(function(instance) {
      adminInstance = instance;
    });
  });

  it("should add client", function() {
    return Admin.deployed().then(function() {
      adminInstance.addClient('0x81baA2622dD9629B3b4e8d3451259DA04d1b31C8');
    });
  });

  
  it("should add client event", function() {
    return Admin.deployed().then(function() {
      adminInstance.addClientEvent('0x81baA2622dD9629B3b4e8d3451259DA04d1b31C8',1);
    });
  });

  it("should gain experience", function() {
    return Admin.deployed().then(function() {
      adminInstance.gainExperience('0x81baA2622dD9629B3b4e8d3451259DA04d1b31C8');
    });
  });
  
  it("should save credit score", function() {
    return Admin.deployed().then(function() {
      adminInstance.saveCreditEvent('0x81baA2622dD9629B3b4e8d3451259DA04d1b31C8');
    });
  });

  
});

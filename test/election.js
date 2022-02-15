var Admin = artifacts.require("./Admin.sol");

contract("Admin", function() {
  var adminInstance;

  it("test deploy", function() {
    return Admin.deployed().then(function(instance) {
      adminInstance = instance;
    });
  });

  it("test add client", function() {
    return Admin.deployed().then(function() {
      adminInstance.addClient('0x81baA2622dD9629B3b4e8d3451259DA04d1b31C8');
    });
  });

  
  it("test add client event", function() {
    return Admin.deployed().then(function() {
      adminInstance.addClientEvent('0x81baA2622dD9629B3b4e8d3451259DA04d1b31C8',1);
    });
  });

  it("test gain experience", function() {
    return Admin.deployed().then(function() {
      adminInstance.gainExperience('0x81baA2622dD9629B3b4e8d3451259DA04d1b31C8');
    });
  });
  
  it("test save credit score", function() {
    return Admin.deployed().then(function() {
      adminInstance.saveCreditEvent('0x81baA2622dD9629B3b4e8d3451259DA04d1b31C8');
    });
  });

  it("check client", function() {
    return Admin.deployed().then(function() {
      return adminInstance.getClient('0x81baA2622dD9629B3b4e8d3451259DA04d1b31C8');
    }).then(function(client){
      console.log(client);
    });
  });

  it("check client count", function() {
    return Admin.deployed().then(function() {
      return adminInstance.clientCount();
    }).then(function(count) {
      console.log(count.toString());
    });
  });

  
  
});

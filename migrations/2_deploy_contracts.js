var Election = artifacts.require("Election");
var Admin = artifacts.require("Admin");

module.exports = function(deployer){
  deployer.then(async () => {
    await deployer.deploy(Election);
    await deployer.deploy(Admin);
  });
}
var Admin = artifacts.require("./Admin.sol");
// const truffleAssert = require('truffle-assertions');

describe('Start', function () {
  contract('Admin', function (accounts) {
    const client = accounts[0]; 
    let SC;

    beforeEach('deploy contract', async function () {
      SC = await Admin.new();
    });

    it('should success if client is added', async function () {
      await SC.addClient(client, {
        from: client
      });

      let addresses = await SC.getAddresses({from:client});
      assert.equal(addresses.length, 1, "client is not added");

    });
    it("should add client event", async function() {
        await SC.addClientEvent(client,1, {
          from: client
        });

        let clientData = await SC.getClient(client, {
            from: client
          });
        let events = clientData[3];
        assert.equal(events[0], 1, "client event is not added");
    });

    it("should gain experience", async function() {
        let clientData = await SC.getClient(client, {
            from: client
          });
        await SC.gainExperience(client, {
          from: client
        });
        let clientData2 = await SC.getClient(client, {
            from: client
          });
        assert.notEqual(clientData[1], clientData2[1], "client doesn't gain exp");
    });
  });
});
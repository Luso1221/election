var Admin = artifacts.require("./Admin.sol");
const truffleAssert = require('truffle-assertions');

describe('When registering users', function () {
  contract('Admin', function (accounts) {
    const owner = accounts[0];
    const manager = accounts[1];
    const node = accounts[2];
    const verifier = accounts[3];
    const observer = accounts[9];
    let SC;

    beforeEach('deploy contract', async function () {
      SC = await Admin.new();
    });

    it('should success if anyone register manager', async function () {
      let status = await SC.isRegisteredManager(manager, {
        from: observer
      });
      assert.equal(status, false, "manager should not exist yet");

      const tx = await SC.addManager({
        from: manager
      });
      truffleAssert.eventEmitted(tx, 'ManagerAdded');

      status = await SC.isRegisteredManager(manager, {
        from: observer
      });
      assert.equal(status, true, "manager should have been registered");

      status = await SC.isRegisteredUser(manager, {
        from: observer
      });
      assert.equal(status, true, "manager is considered as user");
    });

    it('should fail if double register manager', async function () {
      await SC.addManager({
        from: manager
      });

      await truffleAssert.reverts(
        SC.addManager({
          from: manager
        }), 'manager is already registered'
      );
    });

    it('should success if manager register node', async function () {
      await SC.addManager({
        from: manager
      });

      let status = await SC.isRegisteredNode(node, {
        from: observer
      });
      assert.equal(status, false, "node should not exist yet");

      const tx = await SC.addNode(node, {
        from: manager
      });
      truffleAssert.eventEmitted(tx, 'NodeAdded');

      status = await SC.isRegisteredNode(node, {
        from: observer
      });
      assert.equal(status, true, "node should have been registered");

      status = await SC.isRegisteredUser(node, {
        from: observer
      });
      assert.equal(status, true, "node is considered as user");
    });

    it('should success if manager register many nodes', async function () {
      await SC.addManager({
        from: manager
      });

      await SC.addNode(node, {
        from: manager
      });
      await SC.addNode(accounts[7], {
        from: manager
      });
      await SC.addNode(accounts[8], {
        from: manager
      });
      const storedNodes = await SC.getAllNodes(manager, {
        from: observer
      });
      assert.equal(storedNodes.length, 3, "should return correct number of nodes");
    });

    it('should fail if double register node', async function () {
      await SC.addManager({
        from: manager
      });
      await SC.addNode(node, {
        from: manager
      });

      await truffleAssert.reverts(
        SC.addNode(node, {
          from: manager
        }), 'node is already registered'
      );
    });

    it('should success if owner register verifier', async function () {
      let status = await SC.isRegisteredVerifier(verifier, {
        from: observer
      });
      assert.equal(status, false, "verifier should not exist yet");

      const tx = await SC.addVerifier(verifier, {
        from: owner
      });
      truffleAssert.eventEmitted(tx, 'VerifierAdded');

      status = await SC.isRegisteredVerifier(verifier, {
        from: observer
      });
      assert.equal(status, true, "verifier should have been registered");

      status = await SC.isRegisteredUser(verifier, {
        from: observer
      });
      assert.equal(status, true, "verifier is considered as user");
    });

    it('should fail if double register verifier', async function () {
      await SC.addVerifier(verifier, {
        from: owner
      });

      await truffleAssert.reverts(
        SC.addVerifier(verifier, {
          from: owner
        }), 'verifier is already registered'
      );
    });

    it('should fail if random people register new node', async function () {
      await truffleAssert.reverts(
        SC.addNode(node, {
          from: observer
        }), 'only for registered manager'
      );
    });

    it('should fail if random people register new verifier', async function () {
      await truffleAssert.reverts(
        SC.addVerifier(verifier, {
          from: observer
        }), 'only for owner'
      );
    });
  });
});
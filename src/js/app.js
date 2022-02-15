App = {
  web3Provider: null,
  contracts: {},
  account: '0x07E4bE8e931Ea6c7D694350552e127182a32f211',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    // if (typeof web3 !== 'undefined') {
    //   // If a web3 instance is already provided by Meta Mask.
    //   App.web3Provider = web3.currentProvider;
    //   web3 = new Web3(web3.currentProvider);
    // } else {
    //   // Specify default instance if no web3 instance provided
    //   App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    //   web3 = new Web3(App.web3Provider);
    // }
    
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Admin.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Admin = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Admin.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Admin.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      // instance.votedEvent({}, {
      //   fromBlock: 0,
      //   toBlock: 'latest'
      // }).watch(function(error, event) {
      //   console.log("event triggered", event)
      //   // Reload when a new vote is recorded
      //   App.render();
      // });
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      console.log(account)
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Admin.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.clientCount();
    }).then(function(clientsCount) {
      loader.hide();
      content.show();
      var clientsResults = $("#clientsResults");
      clientsResults.empty();

      var clientsSelect = $('#clientsSelect');
      clientsSelect.empty();

      let accList = [];
      web3.eth.getAccounts(function(err,acc){

        if(err){
            console.log('error.............',err);
        } else {
          accList = acc;
          for (var i = 0; i < accList.length; i++) {
              // Render client Result
              var clientTemplate = "<option value="+accList[i]+">" + accList[i] + "</option>";
              clientsSelect.append(clientTemplate);
          }
        }
      });
      
      App.contracts.Admin.deployed().then(function() {
        return electionInstance.getAll();
      }).then(function(clients) {
        loader.hide();
        content.show();
        for (var i = 0; i < clients.length; i++) {
          electionInstance.clients(i).then(function(client) {
            var id = client[0];
            var name = client[1];
            var voteCount = client[2];
  
            // Render client Result
            var clientTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
            clientsResults.append(clientTemplate);
  
          });
        }
      });
    }).catch(function(error) {
      console.warn(error);
    });
  },

  addClient: function() {
    var clientId = $('#clientsSelect').val();
    App.contracts.Admin.deployed().then(function(instance) {
      return instance.addClient(clientId);
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

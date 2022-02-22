App = {
  web3Provider: null,
  contracts: {},
  account: '0x07E4bE8e931Ea6c7D694350552e127182a32f211',
  hasVoted: false,
  runningInstance: null,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }; // "0.2.0"
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    web3 = new Web3(App.web3Provider);
    web3.eth.defaultAccount = web3.eth.accounts[0];
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Admin.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Admin = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Admin.setProvider(App.web3Provider);

      App.listenForEvents();

    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Admin.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      App.runningInstance = instance;
    }).then(function(){
      App.runningInstance.clientAddedEvent().watch(function(err,result){
  
          console.log("Client added event")
        if(err){
            console.log('error.............',err);
        } else {
          console.log(result);
        }
      })
      App.runningInstance.clientAdded().watch(function(err,result){
          console.log("Client added")
        if(err){
            console.log('error.............',err);
        } else {
          console.log(result);
        }
      })
      // App.runningInstance.gainExperienceEvent().watch(function(err,result){
      //     console.log("Client gained exp")
      //   if(err){
      //       console.log('error.............',err);
      //   } else {
      //     console.log(result);
      //   }
      // })
      // App.runningInstance.getAllEvent( {fromBlock:'latest', toBlock: 'latest' }).watch(function(err,result){
      //   console.log("Get event", result.args.addr)
      //   if(err){
      //       console.log('error.............',err);
      //   } else {
      //     console.log(result);
      //     var loader = $("#loader");
      //     var content = $("#content");
      
      //     var clientsResults = $("#clientsResults");
      //     // Load contract data
      //     loader.hide();
      //     content.show();
  
      //     var args = result.args;
          
      //     var wallet = args.addr;
      //     var level = args.level;
      //     var experience = args.experience;
      //     var experienceNext = args.experienceNext;
      //     var events = args.events;
  
      //     // Render client Result
      //     var clientTemplate = `<tr><th>${wallet}</th><td>${level}</td><td>${experience}</td><td>${experienceNext}</td><td>${events}</td><td>`;
      //     clientTemplate += `<button class='btn btn-warning' onclick='App.addClientEvent(${wallet},1)'>JOIN</button>`;
      //     clientTemplate += `<button class='btn btn-success' onclick='App.addClientEvent(${wallet},2)'>TRAIN</button>`;
      //     clientTemplate += `<button class='btn btn-info' onclick='App.addClientEvent(${wallet},3)'>EVAL</button>`;
      //     clientTemplate += `<button class='btn btn-danger' onclick='App.addClientEvent(${wallet},4)'>PUNISH</button>`;
      //     clientTemplate += `<button class='btn btn-primary' onclick='App.gainExperience(${wallet})'>+EXP</button>`;
      //     clientTemplate += `<button class='btn btn-default' onclick='App.saveCreditEvent(${wallet})'>Save credit</button></td></tr>`;
      //     clientsResults.append(clientTemplate);
      //   }
      // })
      App.render();
    });
  },

  render: function() {

    var loader = $("#loader");
    var content = $("#content");
    var clientsResults = $("#clientsResults");
        clientsResults.empty();
    var clientsSelect = $('#clientsSelect');
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      console.log(account)
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });


    let accList = [];

    web3.eth.getAccounts(function(err,acc){

      clientsSelect.empty();
      loader.hide();
      content.show();
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
    
    // App.runningInstance.getAll();
    
    App.getAllClients();
  },

  addClient: function() {
    var clientId = $('#clientsSelect').val();
    App.runningInstance.addClient(clientId, {gas:1000000}).then(function(){
      App.render();
    }).catch(function(err) {
      console.error(err);
    });
  },
  addClientEvent: function(address, eventType) {
    App.runningInstance.addClientEvent(address, eventType, {gas:1000000}).send().then(function(){
      App.render();
    }).catch(function(err) {
      console.error(err);
    });
  },
  gainExperience: function(address) {
    App.runningInstance.gainExperience(address, {gas:1000000}).send().then(function(){
      App.render();
    }).catch(function(err) {
      console.error(err);
    });
  },
  saveCreditEvent: function(address) {
    App.runningInstance.saveCreditEvent(address, {gas:1000000}).then(function(){
      App.render();
    }).catch(function(err) {
      console.error(err);
    });
  },
  getAllClients : function() {
    console.log("get all clients");
    App.runningInstance.getAddresses({gas:1000000}).then(function(addresses){
      console.log("get addresses", addresses);
      for (let index = 0; index < addresses.length; index++) {
        const address = addresses[index];

        
        App.runningInstance.getClient(address, {gas:1000000}).then(function(val){
          console.log(val)
          var loader = $("#loader");
          var content = $("#content");
      
          var clientsResults = $("#clientsResults");
          // Load contract data
          loader.hide();
          content.show();
  
          
          var wallet = address;
          var level = val[0];
          var experience = val[1];
          var experienceNext = val[2];
          var events = val[3];
  
          // Render client Result
          var clientTemplate = `<tr><th>${wallet}</th><td>${level}</td><td>${experience}</td><td>${experienceNext}</td><td>${events}</td><td>`;
          clientTemplate += `<button class='btn btn-warning' onclick='App.addClientEvent(${wallet},1)'>JOIN</button>`;
          clientTemplate += `<button class='btn btn-success' onclick='App.addClientEvent(${wallet},2)'>TRAIN</button>`;
          clientTemplate += `<button class='btn btn-info' onclick='App.addClientEvent(${wallet},3)'>EVAL</button>`;
          clientTemplate += `<button class='btn btn-danger' onclick='App.addClientEvent(${wallet},4)'>PUNISH</button>`;
          clientTemplate += `<button class='btn btn-primary' onclick='App.gainExperience(${wallet})'>+EXP</button>`;
          clientTemplate += `<button class='btn btn-default' onclick='App.saveCreditEvent(${wallet})'>Save credit</button></td></tr>`;
          clientsResults.append(clientTemplate);
        });
      }
    })
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

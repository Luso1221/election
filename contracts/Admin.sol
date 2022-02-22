// SPDX-License-Identifier: MIT
pragma solidity >=0.8;

// import "hardhat/console.sol";
contract Admin {
    // Client model
    uint constant JOIN_EVENT = 1;
    uint constant TRAIN_EVENT = 2;
    uint constant EVAL_EVENT = 3;
    uint constant PUNISH_EVENT = 4;
    int constant JOIN_VALUE = 1;
    int constant TRAIN_VALUE = 3;
    int constant EVAL_VALUE = 3;
    int constant PUNISH_VALUE = -10;
    uint constant STARTING_LEVEL = 1;
    uint constant STARTING_EXPERIENCE = 0;
    uint constant
    EXPIRE_TIME = 86400;
    uint constant EXP_MULTIPLIER = 5;
    uint constant MAX_EVENTS = 5;

    struct Client {
        uint level;
        uint experience;
        uint experienceNext;
        uint[] events;
        CumulativeScore[] scores;
        bool isExist;
        int creditScore;
    }

    struct CumulativeScore {
        int score;
        uint time;
    }

    //clients
    mapping(address => Client) public clients;

    //clientList
    address[] public addresses; 
    //score
    mapping(address => CumulativeScore) public scores;
    
    event clientAdded(address sender, address wallet, uint256 level, uint256 experience, uint256 experienceNext, uint[] events);
    event clientAddedEvent(address sender, uint eventCode, uint[] events);

    // Store client Count
    uint public clientCount;

    constructor () public {
    }
    function addClient (address wallet) public {
        if (!clients[wallet].isExist) {
            Client storage client  = clients[wallet];
            client.isExist = true;
            client.level = STARTING_LEVEL;
            client.experience = STARTING_EXPERIENCE;
            client.experienceNext = EXP_MULTIPLIER * STARTING_LEVEL;
            addresses.push(wallet);
            emit clientAdded(msg.sender, wallet, client.level, client.experience, client.experienceNext, client.events);
        }
    }
    function addClientEvent (address wallet, uint eventCode) public {
        
        Client storage client  = clients[wallet];
        client.events.push(eventCode);
        emit clientAddedEvent(wallet, eventCode, client.events);
    }

    function getClient (address wallet) public view returns (uint256, uint256, uint256, uint[] memory) {
        return (clients[wallet].level, clients[wallet].experience, clients[wallet].experienceNext, clients[wallet].events);
    }
    function getAddresses () public view returns (address[] memory) {
        return addresses;
    }
    
    function saveCreditEvent (address wallet) public {
        // require a valid client
        uint[] memory creditEventScores = clients[wallet].events;
        uint length = creditEventScores.length;
        int countJoin = 0; 
        int countTrain = 0;
        int countEval = 0;
        int countPunish = 0;
        int total = 0;
        for(uint i=0;i<length;i++){
            if (creditEventScores[i] == JOIN_EVENT) {
                countJoin++;
            }
            if (creditEventScores[i] == TRAIN_EVENT) {
                countTrain++;
            }
            if (creditEventScores[i] == EVAL_EVENT) {
                countEval++;
            }
            if (creditEventScores[i] == PUNISH_EVENT) {
                countPunish++;
            }
        }
        total = countJoin * JOIN_VALUE + countTrain * TRAIN_VALUE + countEval * EVAL_VALUE + countPunish * PUNISH_VALUE;
        CumulativeScore memory cScore =  CumulativeScore(total,block.timestamp);
        clients[wallet].scores.push(cScore);

    }

    function gainExperience (address wallet) public {
        //increment experience
        Client storage client  = clients[wallet];
        client.experience = clients[wallet].experience + 1;
        //check if enough exp to lv up, client gains level
        if (client.experience == client.experienceNext) {
            client.level++;
            client.experienceNext = client.level * STARTING_LEVEL;
            client.experience = 0;
        }
    }

    function calculateCreditScore (address wallet) public {
        
        int total = 0;
        Client storage client  = clients[wallet];
        for (uint256 index = 0; index < client.scores.length; index++) {
            if (client.scores[index].time > (block.timestamp - EXPIRE_TIME)){
                total += client.scores[index].score;
            }    
        }
        client.creditScore = total;
    }

}

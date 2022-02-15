// SPDX-License-Identifier: MIT
pragma solidity >=0.4.2;

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
    uint constant EXP_MULTIPLIER = 5;
    uint constant MAX_EVENTS = 5;

    struct Client {
        uint level;
        uint experience;
        uint experienceNext;
        uint[] events;
        CumulativeScore[] scores;
        bool isExist;
    }

    struct CumulativeScore {
        int score;
        uint cumulativeTime;
    }

    //clients
    mapping(address => Client) public clients;

    //clientList
    address[] public addresses; 
    //score
    mapping(address => CumulativeScore) private scores;
    

    // Store client Count
    uint public clientCount;

    constructor () public {
    }

    function addClient (address wallet) public {
        Client storage client  = clients[wallet];
        client.isExist = true;
        client.level = STARTING_LEVEL;
        client.experience = STARTING_EXPERIENCE;
        client.experienceNext = EXP_MULTIPLIER * STARTING_LEVEL;
        // addresses.push(wallet);
    }

    function addClientEvent (address wallet, uint eventCode) public {
        clients[wallet].events.push(eventCode); 
    }

    function getClient (address wallet) public view returns (uint256, uint256, uint256, uint[] memory) {
        Client memory client = clients[wallet];
        return (client.level, client.experience, client.experienceNext, client.events);
    }

    function getAll () public view returns (address[] memory) {
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
        clients[wallet].experience = clients[wallet].experience + 1;
        //check if enough exp to lv up, client gains level
        if (clients[wallet].experience == clients[wallet].experienceNext) {
            clients[wallet].level++;
            clients[wallet].experienceNext = clients[wallet].level * STARTING_LEVEL;
            clients[wallet].experience = 0;
        }
    }

}

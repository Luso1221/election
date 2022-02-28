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
    uint constant EXPIRE_TIME = 86400;
    uint constant EXP_MULTIPLIER = 5;
    uint constant MAX_EVENTS = 5;

    struct Client {
        uint level;
        uint experience;
        uint experienceNext;
        uint[] events;
        CumulativeScore[] scores;
        
        int[] trainingScores;
        int prevClaimScore;
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
    function getCreditEvent (address wallet, uint index) public view returns (int, uint) {
        if (index < clients[wallet].scores.length)
            return (clients[wallet].scores[index].score, clients[wallet].scores[index].time);
        return (0,0);
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
    function calculateCreditScore (address wallet) public returns (int) {
        Client storage client  = clients[wallet];
        client.creditScore = 0;
        for (uint256 index = 0; index < client.scores.length; index++) {
            if (client.scores[index].time > (block.timestamp - EXPIRE_TIME)){
            }
        }
    }
    function addScore(int score, address wallet) public {
        clients[wallet].trainingScores.push(score);
    }
    function calculateWorkerContribution(address wallet) public view returns (int) {
        int firstQuarter = clients[wallet].trainingScores[clients[wallet].trainingScores.length/4];
        int secondQuarter = clients[wallet].trainingScores[clients[wallet].trainingScores.length/2];
        int thirdQuarter = clients[wallet].trainingScores[clients[wallet].trainingScores.length/4*3];
        int interQuarter = thirdQuarter - firstQuarter;
        if (clients[wallet].prevClaimScore < (firstQuarter - interQuarter) || clients[wallet].prevClaimScore > (secondQuarter + interQuarter)) {

        }
        return secondQuarter;
    }
    function calculateReviewerContribution(address reviewer) public view returns (int) {
        int minDifference = 0;
        int maxDifference = 0;
        int difference = 0;
        int normalDifference = 0;
        for (uint256 index = 0; index < addresses.length; index++) {
            int total = 0;
            for (uint256 j = 0; j < clients[addresses[index]].trainingScores.length; j++) {  
                total += clients[addresses[index]].trainingScores[j];
            }
            int firstQuarter = clients[addresses[index]].trainingScores[clients[addresses[index]].trainingScores.length/4];
            int secondQuarter = clients[addresses[index]].trainingScores[clients[addresses[index]].trainingScores.length/2];
            int thirdQuarter = clients[addresses[index]].trainingScores[clients[addresses[index]].trainingScores.length/4*3];
            int interQuarter = thirdQuarter - firstQuarter;
            if (clients[addresses[index]].prevClaimScore < (firstQuarter - interQuarter)) {
                difference = abs((firstQuarter - interQuarter) - secondQuarter);
            } else if (clients[addresses[index]].prevClaimScore > (secondQuarter + interQuarter)) {
                difference = abs((thirdQuarter + interQuarter) - secondQuarter);
            } else {
                difference = abs(total - secondQuarter);
            }
            if (maxDifference < difference) {
                maxDifference = difference;
            }
            if (minDifference > difference) {
                minDifference = difference;
            }
        }
        normalDifference = 1 - ((difference - minDifference)/(maxDifference - minDifference));
        return normalDifference;
    }
    function abs(int x) private pure returns (int) {
        return x >= 0 ? x : -x;
    }
}

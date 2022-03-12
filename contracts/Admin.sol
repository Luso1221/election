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
        //training score for worker
        //training score for reviewer
        uint level;
        uint experience;
        uint experienceNext;
        uint[] events;
        CumulativeScore[] scores;
        int trainingScore; //ganti jadi bukan array
        mapping(address => int)  evalScores;
        bool isExist;
        bool isPunished;
        string publicKey;
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
    address[] public punishList;
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
    function setPrivateKey(address wallet, string memory key) public {
        clients[wallet].publicKey = key;
    }
    function addClientEvent (address wallet, uint eventCode) public {
        Client storage client  = clients[wallet];
        client.events.push(eventCode);
        emit clientAddedEvent(wallet, eventCode, client.events);
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
        if (clients[wallet].scores.length > MAX_EVENTS) {
            clients[wallet].scores.pop();
        }
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
    function calculateCreditScore (address wallet) public view returns (int) {
        Client storage client  = clients[wallet];
        int creditScore = 0;
        for (uint256 index = 0; index < client.scores.length; index++) {
            if (client.scores[index].time > (block.timestamp - EXPIRE_TIME)){
                 int freshNess = (int(EXPIRE_TIME) - (int(block.timestamp) - int(client.scores[index].time)))*100 / int(EXPIRE_TIME) ;
                
                creditScore += client.scores[index].score * freshNess / 100;
            }
        }
        return creditScore;
    }
    function setScore(int score, address wallet) public {
        clients[wallet].trainingScore = score;
    }
    function calculateWorkerContribution(address wallet) public view returns (int) {
        int[] memory trainingScores = clients[wallet].trainingScores;
        sort(clients[wallet].trainingScores);
        Client storage client = clients[wallet];
        int firstQuartile = trainingScores[trainingScores.length/4];
        int secondQuartile = trainingScores[client.trainingScores.length/2];
        int thirdQuartile = trainingScores[client.trainingScores.length/4*3];
        int interQuartile = thirdQuartile - firstQuartile;
        if (client.prevClaimScore < (firstQuartile - interQuartile) || client.prevClaimScore > (secondQuartile + interQuartile)) {
            //punish
            punishList.push(wallet);
        }
        return secondQuartile;
    }
    // function calculateReviewerContribution(address wallet) public view returns (int) {
    //     int[] memory evalScores = clients[wallet].evalScores;
    //     sort(clients[wallet].evalScores);
    //     int minDifference = 0;
    //     int maxDifference = 0;
    //     int difference = 0;
    //     int normalDifference = 0;
    //     for (uint256 index = 0; index < addresses.length; index++) {
    //         if (addresses[index] != wallet) {
    //             int[] memory evalScores = clients[wallet].evalScores;
    //             int total = 0;
    //             Client memory client = clients[addresses[index]];
    //             for (uint256 j = 0; j < client.evalScores.length; j++) {  
    //                 total += client.evalScores[j];
    //             }
                
    //             int firstQuarter = client.evalScores[client.evalScores.length/4];
    //             int secondQuarter = client.evalScores[client.evalScores.length/2];
    //             int thirdQuarter = client.evalScores[client.evalScores.length/4*3];
    //             int interQuarter = thirdQuarter - firstQuarter;
    //             if (client.prevClaimScore < (firstQuarter - interQuarter)) {
    //                 difference = abs((firstQuarter - interQuarter) - secondQuarter);
    //             } else if (client.prevClaimScore > (secondQuarter + interQuarter)) {
    //                 difference = abs((thirdQuarter + interQuarter) - secondQuarter);
    //             } else {
    //                 difference = abs(total - secondQuarter);
    //             }
    //             if (maxDifference < difference) {
    //                 maxDifference = difference;
    //             }
    //             if (minDifference > difference) {
    //                 minDifference = difference;
    //             }
    //         }
    //     }
    //     normalDifference = 1 - ((difference - minDifference)/(maxDifference - minDifference));
    //     return normalDifference;
    // }
    function setTrainingScores (address wallet, int[] memory _scores) public {
        clients[wallet].trainingScores = _scores;
    }
    // function setEvalScores (address wallet, int[] memory _scores) public {
    //     clients[wallet].evalScores = _scores;
    // }
    // function getClientScore (address wallet) public view returns (int) {
    //     return clients[wallet].creditScore;
    // }
    function getCreditEvent (address wallet, uint index) public view returns (int, uint) {
        if (index < clients[wallet].scores.length)
            return (clients[wallet].scores[index].score, clients[wallet].scores[index].time);
        return (0,0);
    }
    function getAddresses () public view returns (address[] memory) {
        return addresses;
    }
    function getClient (address wallet) public view returns (uint256, uint256, uint256, uint[] memory) {
        return (clients[wallet].level, clients[wallet].experience, clients[wallet].experienceNext, clients[wallet].events);
    }
    function abs(int x) private pure returns (int) {
        return x >= 0 ? x : -x;
    }
    function sort(int[] memory data) public pure returns (int[] memory) {
        quickSort(data, uint(0), uint(data.length - 1));
        return data;
    }
    function quickSort(int[] memory arr, uint left, uint right) private pure {
        uint i = left;
        uint j = right;
        if (i == j) return;
        int pivot = arr[uint(left + (right - left) / 2)];
        while (i <= j) {
            while (arr[uint(i)] < pivot) i++;
            while (pivot < arr[uint(j)]) j--;
            if (i <= j) {
                (arr[uint(i)], arr[uint(j)]) = (arr[uint(j)], arr[uint(i)]);
                i++;
                j--;
            }
        }
        if (left < j)
            quickSort(arr, left, j);
        if (i < right)
            quickSort(arr, i, right);
    }
}

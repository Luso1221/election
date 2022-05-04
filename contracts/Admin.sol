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
        int trainingScore;
        mapping(address => int)  evalScores; //eval score of other workers
        bool isExist;
        bool isPunished;
        string publicKey;
    }

    struct CumulativeScore {
        int score;
        uint time;
    }
    mapping(address => bool) public punishMap;
    //clients
    mapping(address => Client) public clients;
    //clientList
    address[] public addresses; 
    //score
    address[] public punishList;
    // mapping(address => CumulativeScore) public scores;
    event clientAdded(address sender, address wallet, uint256 level, uint256 experience, uint256 experienceNext, uint[] events);
    event clientAddedEvent(address sender, uint eventCode, uint[] events);
    event sortedArray(int[] arr);
    event maliciousClient(address client);
    event getReviewerContribution(int[] differences);
    event Deposited(address sender, uint value);
    event Withdrawn(address sender, uint balance);
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
            // emit clientAdded(msg.sender, wallet, client.level, client.experience, client.experienceNext, client.events);
        }
    }
    function deposit() public payable {
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw() public {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
        emit Withdrawn(msg.sender, balance);
    }


    function setPublicKey(address wallet, string memory key) public {
        clients[wallet].publicKey = key;
    }
    function setLevel(address wallet, uint level) public {
        clients[wallet].level = level;
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
    function setEvalScore(int score, address worker, address reviewer) public {
        clients[reviewer].evalScores[worker] = score;
    }
    function calculateWorkerContribution(address wallet) public returns (int) {
        int score = clients[wallet].trainingScore;
        int[] memory scores = new int[](addresses.length);
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] != wallet) {
                scores[i] = (clients[addresses[i]].evalScores[wallet]);
            }
        }
        int[] memory sortedScores = sort(scores);
        int[] memory quarters = new int[](3);
        (quarters[0], quarters[1], quarters[2]) = getQuarters(sortedScores);
        int interQtr = quarters[2] - quarters[0];
        if (score < quarters[0] - interQtr || score > quarters[2] + interQtr ) {
            //punish
            if (!punishMap[wallet]) {
                punishList.push(wallet);
                punishMap[wallet] = true;
            }
            
        }
        return quarters[1];
    }
    function calculateReviewerContribution(address reviewer) public {
        int minDifference = 0;
        int maxDifference = 0;
        int[] memory differences = new int[](addresses.length);
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] != reviewer) {
                // int total = 0;
                int[] memory _scores = new int[](addresses.length);
                int difference = 0;
                for (uint256 j = 0; j < addresses.length; j++) {
                    if (addresses[j] != addresses[i]) {
                        _scores[j] = (clients[addresses[j]].evalScores[addresses[i]]);
                        // total += clients[addresses[j]].evalScores[addresses[i]];
                    }
                }
                int[] memory sortedScores = sort(_scores);
                int[] memory quarters = new int[](3);
                (quarters[0], quarters[1], quarters[2]) = getQuarters(sortedScores);
                
                int interQtr = quarters[2] - quarters[0];
                int reviewerScoreOnThisClient =  clients[reviewer].evalScores[addresses[i]];
                if (isReviewerScoreTooHigh(reviewerScoreOnThisClient, quarters, interQtr)) {
                    difference = abs((quarters[2] + interQtr) - quarters[1]);
                    if (!punishMap[reviewer]) {
                        punishList.push(reviewer);
                        punishMap[reviewer] = true;
                    }
                } else if (isReviewerScoreTooLow(reviewerScoreOnThisClient, quarters, interQtr)) {
                    difference = abs((quarters[0] - interQtr) - quarters[1]);
                    if (!punishMap[reviewer]) {
                        punishList.push(reviewer);
                        punishMap[reviewer] = true;
                    }
                } else {
                    difference = abs(reviewerScoreOnThisClient - quarters[1]);
                }
                if (difference > maxDifference) {
                    maxDifference = difference;
                }
                if (difference < minDifference) {
                    minDifference = difference;
                }
                differences[i] = difference;
            }
        }
        differences = normalizeArray(differences);
        emit getReviewerContribution(differences);
    }
    function isReviewerScoreTooHigh (int reviewerScoreOnThisClient, int[] memory quarters, int interQtr) public pure returns (bool) {
        if (reviewerScoreOnThisClient > (quarters[2] + interQtr)) {
            return true;
        } 
        return false;
    }
    function isReviewerScoreTooLow (int reviewerScoreOnThisClient, int[] memory quarters, int interQtr) public pure returns (bool) {
        if (reviewerScoreOnThisClient < (quarters[0] - interQtr)) {
            return true;
        } 
        return false;
    }
    function getCreditEvent (address wallet, uint index) public view returns (int, uint) {
        if (index < clients[wallet].scores.length)
            return (clients[wallet].scores[index].score, clients[wallet].scores[index].time);
        return (0,0);
    }
    function getPunishedList () public view returns (address[] memory){
        return punishList;
    }
    function getAddresses () public view returns (address[] memory) {
        return addresses;
    }
    function getClientCount () public view returns (uint) {
        return addresses.length;
    }
    function getClient (address wallet) public view returns (uint256, uint256, uint256, uint[] memory, string memory) {
        return (clients[wallet].level, clients[wallet].experience, clients[wallet].experienceNext, clients[wallet].events, clients[wallet].publicKey);
    }
    function getMedian(int[] memory arr) public pure returns (int) { // arr is already sorted
        int median;
        uint mid = arr.length / 2 - 1;

        if (arr.length % 2 == 0) {
            median = (arr[mid-1] + arr[mid+1]) / 2;
        } else {
            median = arr[mid];
        }

        return median;
    }
    function getEvalScore (address worker,address reviewer) public view returns (int) {
        return clients[reviewer].evalScores[worker];
    }
    function getSlice(uint256 begin, uint256 end, int[] memory text) public pure returns (int[] memory) {
        int[] memory a = new int[](end-begin+1);
        for(uint i=0;i<=end-begin;i++){
            a[i] = text[i+begin];
        }
        return a;    
    }
    function getQuarters(int[] memory arr) public pure returns (int,int,int) {
        int q1; 
        int q2;
        int q3; 
        int[] memory firstHalf;
        int[] memory secondHalf;
        //console.log(arr);

        q2 = getMedian(arr);

        uint mid = ceil(arr.length /2, 1);
        if (arr.length % 2 == 0) {
            firstHalf = getSlice(0, mid,arr);
            //console.log(firstHalf);

        } else {
            firstHalf = getSlice(0, mid - 1,arr);
            //console.log(firstHalf);
        }

        secondHalf = getSlice(mid, arr.length-1, arr);
        //console.log(secondHalf);

        q1 = getMedian(firstHalf);
        q3 = getMedian(secondHalf);

        return (q1, q2, q3);
    }
    function test(int[] memory arr) public view returns (int,int,int, int[] memory, int[] memory){
        int q1; 
        int q2;
        int q3; 

        int[] memory firstHalf;
        int[] memory secondHalf;

        q2 = getMedian(arr);

        uint mid = ceil(arr.length /2, 1);
        if (arr.length % 2 == 0) {
            firstHalf = getSlice(0, mid,arr);

        } else {
            firstHalf = getSlice(0, mid - 1,arr);
        }

        secondHalf = getSlice(mid, arr.length-1, arr);

        q1 = getMedian(firstHalf);
        q3 = getMedian(secondHalf);
        

        return (q1,q2,q3,firstHalf,secondHalf);
    }
    function ceil(uint a, uint m) private pure returns (uint ) {
        return ((a + m - 1) / m) * m;
    }
    function abs(int x) private pure returns (int) {
        return x >= 0 ? x : -x;
    }
    function sort(int[] memory arr) public pure returns (int[] memory) {
        // quickSort(arr, uint(0), uint(data.length - 1));
        sort_array(arr);
        return arr;
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
    function sort_array(int[] memory arr) private pure returns (int[] memory) {
        uint256 l = arr.length;
        for(uint i = 0; i < l; i++) {
            for(uint j = i+1; j < l ;j++) {
                if(arr[i] > arr[j]) {
                    int temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                }
            }
        }
        return arr;
    }
    function normalizeArray(int[] memory arr) public pure returns (int[] memory) {
        int[] memory normalized_array = new int[](arr.length);
        int start = 1;
        int end = 10;
        int width = end - start;
        for (uint256 i = 0; i < arr.length; i++) {
            int _max = max(arr);
            int _min = min(arr);
            int normalized = (((arr[i] - _min) *  width )/ (_max - _min)) + start;
            normalized_array[i] = normalized;
        }

        return normalized_array;
    }
    function reverseNormalizeArray(int[] memory arr) public pure returns (int[] memory){
        int[] memory normalized = normalizeArray(arr);
        int[] memory reversed_array = new int[](arr.length);
        for (uint256 i = 0; i < normalized.length; i++) {
            int reversed = 1 - normalized[i];
            reversed_array[i] = reversed;
        }

        return reversed_array;
    }
    function convert2dTo1d(int[][] memory arr) public pure returns (int[] memory) {
        int[] memory newArray = new int[](arr.length *2);
        for (uint256 i = 0; i < arr.length; i++) {
            for(uint256 j = 0; j < arr.length; j++) {
                newArray[i] = arr[i][j]; 
            }
        }

        return newArray;
    }
    // function convert2dTo1d(int[] memory arr) public pure returns (int[][] memory) {
        
    //     int[] memory newArray = new int[](arr.length/2);
    //     int number_of_element_per_row = addresses.length;
    //     while(arr.length) newArray.push(arr.splice(0, number_of_element_per_row));
            
    //     return newArray;
    // }
    function min(int[] memory arr) public pure returns (int) {
        int val = arr[0];
        for (uint256 index = 0; index < arr.length; index++) {
            if (val > arr[index]) {
                val = arr[index];
            }
        }
        return val;
    } 
    function max(int[] memory arr) public pure returns (int) {
        int val = arr[0];
        for (uint256 index = 0; index < arr.length; index++) {
            if (val < arr[index]) {
                val = arr[index];
            }
        }
        return val;
    }
    
}

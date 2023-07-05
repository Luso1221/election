pragma solidity >=0.8.1;

contract Election {
    // Model a Candidate
    uint STARTING_REPUTATION = 50; 
    uint MINIMUM_REPUTATION = 40; 
    uint STARTING_VOTE_COUNT = 0; 
    struct Candidate {
        uint id;
        string name;
        uint score;
        address addr;
        uint reputation;
        uint[] events;
        uint accuracy;
        string[] trainingHashes;
        string[] ipfsAddresses;
        bool isMalicious;
        bool isVoter;
        bool isTrainer;
        bool isBanned;
        int totalGwei;
    }
    struct Vote {
        address voter;
        uint value;
    }
    mapping(address => Vote[]) public votes;

    // Store accounts that have voted
    uint public globalAccuracy;
    mapping(address => bool) public voters;
    // Store Candidates
    // Fetch Candidate
    mapping(address => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;
    address[] public addressList;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );

    constructor () public {
        globalAccuracy = 50;
        // addCandidate("Candidate 1",0x07E4bE8e931Ea6c7D694350552e127182a32f211);
        // addCandidate("Candidate 2",0x81baA2622dD9629B3b4e8d3451259DA04d1b31C8);
    }
    function send(address payable _addr) payable public {
        // require(msg.value >= 1);
        (bool sent, bytes memory data) = _addr.call{value: 200}("");
        require(sent, "Failed to send Ether");
    }
    fallback () external {
    }
    function addCandidate (string memory _name, address addr, uint reputation, bool isMalicious, bool isVoter, bool isTrainer) public {
        candidatesCount ++;
        addressList.push(addr);
        candidates[addr] = Candidate(candidatesCount, _name, STARTING_VOTE_COUNT, addr, reputation, new uint[](10),0, new string[](10), new string[](10), isMalicious, isVoter, isTrainer, false, 5000000);
    }

    function clearCandidates () public{
        while(candidatesCount > 0){
            delete candidates[addressList[candidatesCount--]];
        }
    }
    function calculateReputation () public {
        for (uint256 index = 0; index < addressList.length; index++) {
            if (candidates[addressList[index]].reputation < MINIMUM_REPUTATION){ 
                candidates[addressList[index]].isBanned = true;
            }
        }
    }
    function setGlobalAccuracy (uint accuracy) public {
        globalAccuracy = accuracy;
    }
    function setReputation(address addr, uint reputation) public {
        
        Candidate storage candidate  = candidates[addr];
        candidate.reputation = reputation;
    }
    function submitModel(uint id, address addr, uint accuracy, string memory trainingHash, string memory ipfsAddress) public {
        
        Candidate storage candidate  = candidates[addr];
        candidate.accuracy = accuracy;
        candidate.trainingHashes.push(trainingHash);
        candidate.ipfsAddresses.push(ipfsAddress);
    }
    function submitVote(address trainerAddr, address voterAddr, uint value) public {
        Vote memory vote;
        vote.voter = voterAddr;
        vote.value = value;
        votes[trainerAddr].push(vote);
    }
    function addClientEvent (uint id, address addr, uint eventCode) public {
        Candidate storage candidate  = candidates[addr];
        candidate.events.push(eventCode);
    } 
    function setGwei(address addr,int _gwei) public{
        
        Candidate storage candidate  = candidates[addr];
        candidate.totalGwei = _gwei;
    }
     function sendViaTransfer(address payable _to) public payable {
        // This function is no longer recommended for sending Ether.
        _to.transfer(msg.value);
    }

    function sendEther(address payable _to) public payable {
        // Send 1 ether to the contract
        address payable receiver = payable(_to);
        receiver.transfer(1 ether);
    }
    function sendViaSend(address payable _to) public payable {
        // Send returns a boolean value indicating success or failure.
        // This function is not recommended for sending Ether.
        bool sent = _to.send(msg.value);
        require(sent, "Failed to send Ether");
    }

    function vote (uint _candidateIdTarget, address addr, uint _candidateIdVoter) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require  valid candidates
        require(_candidateIdTarget > 0 && _candidateIdVoter > 0 && _candidateIdTarget <= candidatesCount 
        && _candidateIdVoter <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[addr].score += candidates[addr].reputation;

        // trigger voted event
        // emit votedEvent(_candidateIdVoter);
    }
    
    // function sort(int[] memory arr) public pure returns (int[] memory) {
    //     // quickSort(arr, uint(0), uint(data.length - 1));
    //     sort_array(arr);
    //     return arr;
    // }
    
    // function quickSort(int[] memory arr, uint left, uint right) private pure {
    //     uint i = left;
    //     uint j = right;
    //     if (i == j) return;
    //     int pivot = arr[uint(left + (right - left) / 2)];
    //     while (i <= j) {
    //         while (arr[uint(i)] < pivot) i++;
    //         while (pivot < arr[uint(j)]) j--;
    //         if (i <= j) {
    //             (arr[uint(i)], arr[uint(j)]) = (arr[uint(j)], arr[uint(i)]);
    //             i++;
    //             j--;
    //         }
    //     }
    //     if (left < j)
    //         quickSort(arr, left, j);
    //     if (i < right)
    //         quickSort(arr, i, right);
    // }
    // function sort_array(int[] memory arr) private pure returns (int[] memory) {
    //     uint256 l = arr.length;
    //     for(uint i = 0; i < l; i++) {
    //         for(uint j = i+1; j < l ;j++) {
    //             if(arr[i] > arr[j]) {
    //                 int temp = arr[i];
    //                 arr[i] = arr[j];
    //                 arr[j] = temp;
    //             }
    //         }
    //     }
    //     return arr;
    // }
}

pragma solidity >=0.8;

contract Election {
    // Model a Candidate
    uint STARTING_REPUTATION = 50; 
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
    }
    

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );

    constructor () public {
        // addCandidate("Candidate 1",0x07E4bE8e931Ea6c7D694350552e127182a32f211);
        // addCandidate("Candidate 2",0x81baA2622dD9629B3b4e8d3451259DA04d1b31C8);
    }

    function addCandidate (string memory _name, address addr) public {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, STARTING_VOTE_COUNT, addr, STARTING_REPUTATION, new uint[](10),0, new string[](10), new string[](10));
    }

    function calculateReputation () public {
        for (uint256 index = 0; index < candidatesCount; index++) {
            
        }
    }
    function submitModel(uint id, uint accuracy, string memory trainingHash, string memory ipfsAddress) public {
        
        Candidate storage candidate  = candidates[id];
        candidate.accuracy = accuracy;
        candidate.trainingHashes.push(trainingHash);
        candidate.ipfsAddresses.push(ipfsAddress);
    }
    function addClientEvent (uint id, uint eventCode) public {
        Candidate storage candidate  = candidates[id];
        candidate.events.push(eventCode);
    } 
    function vote (uint _candidateIdTarget, uint _candidateIdVoter) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require  valid candidates
        require(_candidateIdTarget > 0 && _candidateIdVoter > 0 && _candidateIdTarget <= candidatesCount 
        && _candidateIdVoter <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateIdTarget].score += candidates[_candidateIdVoter].reputation;

        // trigger voted event
        // emit votedEvent(_candidateIdVoter);
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
}

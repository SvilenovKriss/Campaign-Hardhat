pragma solidity ^0.4.17;

contract PollingSystem {
    struct Choise {
        string name;
        address[] voters;
    }

    struct Poll {
        mapping(uint => Choise[]) choises;
        uint deadline;  
    }

    string[] public pollNames;
    mapping(string => Poll[]) public polls;

    function createPoll(string memory name, uint deadline) public {
        require(!!polls[name], "Poll with this name already exist!");
        polls[name] = Poll(0, deadline);
        pollNames.push(name);
    }

    function createChoise(string memory pollName, string memory choise) public {
        polls[pollName].choises.push(Choise(choise, 0));
    }

    function vote(string memory pollName, string memory choiseName) public{
        Choise[] storage choises = polls[pollName].choises;

        for(uint i = 0; i < choises.length; i++) {
            if (choises[i].name == choiseName) {
                choises[i].voters.push(msg.sender);
            }
        }
    }
}
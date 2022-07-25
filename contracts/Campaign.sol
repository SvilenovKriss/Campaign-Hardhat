pragma solidity ^0.4.17;

import "hardhat/console.sol";

contract CampaignFactory {
    address[] public campaigns;

    function createCampaign(uint256 minimunContribution) public {
        address campaign = new Campaign(minimunContribution, msg.sender);
        campaigns.push(campaign);
    }

    function getCampaigns() public view returns (address[]) {
        return campaigns;
    }
}

contract Campaign {
    address public manager;
    uint256 public minimumContribution;
    Request[] public requests;
    uint256 public votersCount;
    mapping(address => bool) public approvers;

    struct Request {
        string description;
        uint256 amount;
        address vendor;
        bool status;
        uint256 approvalCount;
        mapping(address => bool) voters;
    }

    constructor(uint256 _minimumContribution, address _addr) public {
        minimumContribution = _minimumContribution;
        manager = _addr;
    }

    modifier isManager() {
        require(msg.sender == manager, "You need to be the owner.");
        _;
    }

    function contribute() public payable {
        require(
            msg.value >= minimumContribution,
            "Amount should be greater or equal to minimum contribution!"
        );

        approvers[msg.sender] = true;
        votersCount++;
    }

    function createRequest(
        address vendor,
        uint256 amount,
        string memory description
    ) public isManager {
        requests.push(Request(description, amount, vendor, false, 0));
    }

    function approveRequest(uint256 _index, bool _status) public {
        require(
            approvers[msg.sender],
            "You need to be contributor to be able to approve!"
        );

        require(
            !requests[_index].voters[msg.sender],
            "You cannot vote more than once per request!"
        );

        requests[_index].voters[msg.sender] = true;

        if (_status) {
            requests[_index].approvalCount++;
        }
    }

    function finalizeRequest(uint256 index) public isManager {
        require(index < requests.length, "Request don't exist!");
        require(
            !requests[index].status,
            "You cannot finalize the same request!"
        );
        require(
            requests[index].approvalCount > (votersCount / 2),
            "To finalize request, approvals needs to be more or equal to 50% of all contributors."
        );
        require(requests[index].amount <= address(this).balance);

        requests[index].status = true;
        requests[index].vendor.transfer(requests[index].amount);
    }
}
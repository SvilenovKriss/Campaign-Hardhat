pragma solidity ^0.8.7;

contract Credit {
    struct Requirements {
        address tokenToBorrow;
        uint tokenToBorrowAmount;
        uint depositedAmount;
    }

    uint private borrowPercentageCut = 20;
    mapping(address => Requirements) public borrower;

    constructor(address requiredToken, uint amount, address sender) payable {
        require(msg.value - ((msg.value / 100) * borrowPercentageCut) == amount, "Amount of required amount to borrow should be 20% smaller than deposited.");

        borrower[sender] = Requirements(requiredToken, amount, msg.value);
    }
}
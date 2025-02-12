// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ChamaTreasury {
    address public chamaGroup;
    uint256 public totalBalance;
    event PayoutDistributed(address indexed recipient, uint256 amount);

    modifier onlyChama() {
        require(msg.sender == chamaGroup, "Unauthorized");
        _;
    }

    constructor(address _chamaGroup) {
        chamaGroup = _chamaGroup;
    }

    function receiveContribution() external payable onlyChama {
        totalBalance += msg.value;
    }

    function distributePayout(address _recipient) external onlyChama {
        require(totalBalance > 0, "Insufficient balance");
        uint256 payoutAmount = totalBalance;
        totalBalance = 0;
        payable(_recipient).transfer(payoutAmount);
        emit PayoutDistributed(_recipient, payoutAmount);
    }
}

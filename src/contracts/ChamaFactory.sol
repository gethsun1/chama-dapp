// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ChamaGroup.sol";

contract ChamaFactory {
    address[] public allChamas;
    event ChamaCreated(address indexed chamaAddress, string name, uint256 cycleDuration, uint256 contributionAmount);

    function createChama(
        string memory _name, 
        uint256 _cycleDuration, 
        uint256 _contributionAmount
    ) external {
        ChamaGroup newChama = new ChamaGroup(_name, _cycleDuration, _contributionAmount, msg.sender);
        allChamas.push(address(newChama));
        emit ChamaCreated(address(newChama), _name, _cycleDuration, _contributionAmount);
    }

    function getAllChamas() external view returns (address[] memory) {
        return allChamas;
    }
}

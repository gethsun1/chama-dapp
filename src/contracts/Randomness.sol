// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RandomnessOracle {
    function getRandomNumber(uint256 _seed) public view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, _seed))) % 100;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ChamaTreasury.sol";

contract ChamaGroup {
    struct Member {
        address addr;
        bool hasContributed;
        bool hasReceivedPayout;
    }

    string public chamaName;
    uint256 public cycleDuration;
    uint256 public contributionAmount;
    address public owner;
    address[] public members;
    mapping(address => Member) public memberDetails;
    ChamaTreasury public chamaTreasury;

    event MemberJoined(address indexed member);
    event ContributionMade(address indexed member, uint256 amount);
    event PayoutDistributed(address indexed recipient, uint256 amount);

    constructor(string memory _name, uint256 _cycleDuration, uint256 _contributionAmount, address _creator) {
        chamaName = _name;
        cycleDuration = _cycleDuration;
        contributionAmount = _contributionAmount;
        owner = _creator;
        chamaTreasury = new ChamaTreasury(address(this));
    }

    function joinChama() external {
        require(memberDetails[msg.sender].addr == address(0), "Already joined");
        members.push(msg.sender);
        memberDetails[msg.sender] = Member(msg.sender, false, false);
        emit MemberJoined(msg.sender);
    }

    function contribute() external payable {
        require(memberDetails[msg.sender].addr != address(0), "Not a member");
        require(msg.value == contributionAmount, "Incorrect amount");
        require(!memberDetails[msg.sender].hasContributed, "Already contributed this cycle");

        memberDetails[msg.sender].hasContributed = true;
        payable(address(chamaTreasury)).transfer(msg.value);
        emit ContributionMade(msg.sender, msg.value);
    }

    function requestPayout() external {
        require(memberDetails[msg.sender].hasContributed, "Must contribute first");
        require(!memberDetails[msg.sender].hasReceivedPayout, "Already received payout");

        chamaTreasury.distributePayout(msg.sender);
    }
}

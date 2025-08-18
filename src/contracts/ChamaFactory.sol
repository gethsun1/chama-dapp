// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";



/**
 * @title ChamaFactory
 * @dev A decentralized savings system (Chama) factory implementing a ROCSA-based group savings model.
 * This version penalizes members who default on their contributions by slashing a percentage of their deposit,
 * with the collected penalties added to the payout for the scheduled recipient.
 *
 * Features:
 *  - Creation of a Chama with specific parameters.
 *  - Member enrollment with duplicate membership prevention.
 *  - Cycle-based contribution tracking with time-bound contribution windows.
 *  - Automatic penalty enforcement for defaulting members.
 *  - Round-robin payout execution that aggregates contributions and penalties.
 *  - Reentrancy protection during payout operations.
 */
contract ChamaFactory is ReentrancyGuard {
    uint256 public chamaCount; // Total number of Chamas created

    /**
     * @dev Represents a Chama (group savings pool).
     */
    struct Chama {
        uint256 id;                    // Unique Chama ID
        address creator;               // Address of the creator
        string name;                   // Name of the Chama
        string description;            // Description and goals
        uint256 depositAmount;         // Initial deposit required to join (serves as collateral)
        uint256 contributionAmount;    // Recurring contribution per cycle
        uint256 penalty;               // Penalty percentage (e.g., 10 for 10%)
        uint256 maxMembers;            // Maximum number of members allowed
        uint256 membersCount;          // Current number of members in the Chama
        uint256 cycleDuration;         // Duration of each contribution cycle (in seconds)
        uint256 currentRound;          // Pointer to the member scheduled for payout (1-indexed)
        uint256 currentCycle;          // Current contribution cycle number
        uint256 nextCycleStart;        // Timestamp for the start of the next cycle
        address[] members;             // Array of member addresses
        bool isActive;                 // Indicates if the Chama is active
    }

    // Mapping of Chama ID to Chama details
    mapping(uint256 => Chama) public chamas;
    // Mapping to track contributions: chamaId => cycle => member => contribution status
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public contributions;
    // Mapping to track member deposits for each Chama: chamaId => member => deposit balance
    mapping(uint256 => mapping(address => uint256)) public memberDeposit;

    // Events to log key actions
    event ChamaCreated(uint256 indexed chamaId, string name, address indexed creator);
    event JoinedChama(uint256 indexed chamaId, address indexed member);
    event ContributionMade(uint256 indexed chamaId, uint256 cycle, address indexed member, uint256 amount);
    event PayoutExecuted(uint256 indexed chamaId, uint256 cycle, address indexed recipient, uint256 totalPayout);

    /**
     * @notice Creates a new Chama.
     * @param _name Name of the Chama.
     * @param _description Description and goals of the Chama.
     * @param _depositAmount Required deposit amount for joining.
     * @param _contributionAmount Recurring contribution per cycle.
     * @param _penalty Penalty percentage for missed contributions.
     * @param _maxMembers Maximum number of members allowed.
     * @param _cycleDuration Duration of a contribution cycle in seconds.
     * @return The unique ID of the newly created Chama.
     *
     * Requirements:
     * - `_maxMembers`, `_depositAmount`, and `_contributionAmount` must be greater than 0.
     */
    function createChama(
        string memory _name,
        string memory _description,
        uint256 _depositAmount,
        uint256 _contributionAmount,
        uint256 _penalty,
        uint256 _maxMembers,
        uint256 _cycleDuration
    ) external returns (uint256) {
        require(_maxMembers > 0, "Max members must be > 0");
        require(_depositAmount > 0, "Deposit amount must be > 0");
        require(_contributionAmount > 0, "Contribution amount must be > 0");

        chamaCount++;
        Chama storage newChama = chamas[chamaCount];
        newChama.id = chamaCount;
        newChama.creator = msg.sender;
        newChama.name = _name;
        newChama.description = _description;
        newChama.depositAmount = _depositAmount;
        newChama.contributionAmount = _contributionAmount;
        newChama.penalty = _penalty;
        newChama.maxMembers = _maxMembers;
        newChama.cycleDuration = _cycleDuration;
        newChama.currentRound = 1;
        newChama.currentCycle = 1;
        newChama.nextCycleStart = block.timestamp + _cycleDuration;
        newChama.isActive = true;

        emit ChamaCreated(chamaCount, _name, msg.sender);
        return chamaCount;
    }

    /**
     * @notice Allows a user to join an active Chama.
     * @param _chamaId The ID of the Chama to join.
     *
     * Requirements:
     * - The Chama must be active and not full.
     * - The sender must not already be a member.
     * - The exact deposit amount in ETH must be sent.
     */
    function joinChama(uint256 _chamaId) external payable {
        Chama storage chama = chamas[_chamaId];
        require(chama.isActive, "Chama is not active");
        require(chama.membersCount < chama.maxMembers, "Chama is full");
        require(msg.value == chama.depositAmount, "Incorrect deposit amount");
        require(!isMember(_chamaId, msg.sender), "Already a member");

        chama.members.push(msg.sender);
        chama.membersCount++;
        // Record the member's deposit (collateral)
        memberDeposit[_chamaId][msg.sender] = chama.depositAmount;
        emit JoinedChama(_chamaId, msg.sender);
    }

    /**
     * @notice Allows a member to make a scheduled contribution for the current cycle.
     * @param _chamaId The ID of the Chama.
     *
     * Requirements:
     * - The Chama must be active.
     * - The sender must be a member.
     * - The exact contribution amount in ETH must be sent.
     * - Contributions must be made before the current cycle ends.
     * - A member may only contribute once per cycle.
     */
    function contribute(uint256 _chamaId) external payable {
        Chama storage chama = chamas[_chamaId];
        require(chama.isActive, "Chama is not active");
        require(isMember(_chamaId, msg.sender), "Not a member of this Chama");
        require(msg.value == chama.contributionAmount, "Incorrect contribution amount");
        require(block.timestamp < chama.nextCycleStart, "Contribution period over for current cycle");
        require(!contributions[_chamaId][chama.currentCycle][msg.sender], "Contribution already made for current cycle");

        contributions[_chamaId][chama.currentCycle][msg.sender] = true;
        emit ContributionMade(_chamaId, chama.currentCycle, msg.sender, msg.value);
    }

    /**
     * @dev Internal function to calculate the total pool for the current cycle.
     * Iterates over all members to sum contributions and apply penalties for defaults.
     * @param _chamaId The ID of the Chama.
     * @return totalPool The total pooled amount for the cycle.
     */
    function _calculateTotalPool(uint256 _chamaId) internal returns (uint256 totalPool) {
        Chama storage chama = chamas[_chamaId];
        uint256 penaltyAmount;
        for (uint256 i = 0; i < chama.members.length; i++) {
            address member = chama.members[i];
            if (contributions[_chamaId][chama.currentCycle][member]) {
                totalPool += chama.contributionAmount;
            } else {
                penaltyAmount = (chama.depositAmount * chama.penalty) / 100;
                require(memberDeposit[_chamaId][member] >= penaltyAmount, "Insufficient deposit for penalty");
                memberDeposit[_chamaId][member] -= penaltyAmount;
                totalPool += penaltyAmount;
            }
        }
    }

    /**
     * @notice Executes a payout for the current cycle.
     *
     * This function collects contributions from members who contributed and deducts a penalty
     * from defaulting members’ deposits. The total pool (contributions plus penalties) is then
     * transferred to the scheduled recipient in a round-robin manner. After payout, the cycle
     * is advanced.
     *
     * Requirements:
     * - The Chama must be active and full.
     * - The contribution period for the current cycle must have ended.
     */
    function payout(uint256 _chamaId) external nonReentrant {
        Chama storage chama = chamas[_chamaId];
        require(chama.isActive, "Chama is not active");
        require(block.timestamp >= chama.nextCycleStart, "Current cycle not ended yet");
        require(chama.members.length == chama.maxMembers, "Chama is not full yet");

        // Calculate the total pool via the helper function
        uint256 totalPool = _calculateTotalPool(_chamaId);

        // Determine the payout recipient based on the current round (1-indexed)
        address recipient = chama.members[chama.currentRound - 1];

        // Update the round pointer in a circular round-robin fashion
        chama.currentRound = (chama.currentRound % chama.maxMembers) + 1;

        // Store the current cycle for event logging and advance the cycle
        uint256 executedCycle = chama.currentCycle;
        chama.currentCycle++;
        chama.nextCycleStart = block.timestamp + chama.cycleDuration;

        (bool sent, ) = recipient.call{value: totalPool}("");
        require(sent, "Payout failed");

        emit PayoutExecuted(_chamaId, executedCycle, recipient, totalPool);
    }

    /**
     * @notice Checks whether a specific address is a member of a given Chama.
     * @param _chamaId The ID of the Chama.
     * @param _user The address to check.
     * @return True if the address is a member, false otherwise.
     */
    function isMember(uint256 _chamaId, address _user) public view returns (bool) {
        Chama storage chama = chamas[_chamaId];
        for (uint256 i = 0; i < chama.members.length; i++) {
            if (chama.members[i] == _user) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Fallback function to accept ETH directly.
     */
    receive() external payable {}
}

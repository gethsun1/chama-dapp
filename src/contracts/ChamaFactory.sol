// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ChamaFactory
 * @dev A decentralized savings system (Chama) factory that allows users to create,
 * join, contribute to, and receive payouts from group savings.
 *
 * Features:
 * - Create a Chama with specific parameters (name, description, deposit amount,
 *   contribution amount, penalty percentage, maximum members, and cycle duration).
 * - Allow users to join a Chama by sending the exact required deposit.
 * - Enable members to contribute the scheduled amount per cycle.
 * - Execute payouts to members in a round-robin fashion once the Chama is full.
 * - Provide on-chain data tracking for user participation and contributions.
 *
 * Note: This is a simplified example. For a production system, consider enhanced
 * contribution tracking, secure payout mechanisms, and robust handling of missed
 * contributions or penalties.
 */
contract ChamaFactory {
    uint256 public chamaCount; // Total number of Chamas created

    /**
     * @dev Represents a Chama (group savings pool).
     */
    struct Chama {
        uint256 id;                    // Unique Chama ID
        address creator;               // Address of the creator
        string name;                   // Name of the Chama
        string description;            // Description and goals
        uint256 depositAmount;         // Initial deposit required to join
        uint256 contributionAmount;    // Recurring contribution per cycle
        uint256 penalty;               // Penalty percentage for missing contributions
        uint256 maxMembers;            // Maximum number of members allowed
        uint256 public membersCount;   // Total number of members in a Chama count 
        uint256 cycleDuration;         // Duration of each contribution cycle (in seconds)
        address[] members;             // Array of member addresses
        uint256 currentRound;          // 1-indexed pointer to the member scheduled for payout
        bool isActive;                 // Status flag indicating if the Chama is active
    }

    // Mapping of Chama ID to Chama details
    mapping(uint256 => Chama) public chamas;

    // Events to log key actions
    event ChamaCreated(uint256 indexed chamaId, string name, address indexed creator);
    event JoinedChama(uint256 indexed chamaId, address indexed member);
    event ContributionMade(uint256 indexed chamaId, address indexed member, uint256 amount);
    event PayoutExecuted(uint256 indexed chamaId, address indexed recipient);

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
     * - `_maxMembers` must be greater than 0.
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
        newChama.isActive = true;

        emit ChamaCreated(chamaCount, _name, msg.sender);
        return chamaCount;
    }

    /**
     * @notice Allows a user to join an active Chama.
     * @param _chamaId The ID of the Chama to join.
     *
     * Requirements:
     * - The Chama must be active.
     * - The Chama must not be full.
     * - The sender must send exactly the required deposit amount in ETH.
     */
    function joinChama(uint256 _chamaId) external payable {
      Chama storage chama = chamas[_chamaId];
      require(chama.isActive, "Chama is not active");
      require(chama.membersCount < chama.maxMembers, "Chama is full");
      require(msg.value == chama.depositAmount, "Incorrect deposit amount");
    
      chama.members.push(msg.sender);
      chama.membersCount++;
      emit JoinedChama(_chamaId, msg.sender);
    }

    function getMembersCount(uint256 _chamaId) public view returns (uint256) {
      return chamas[_chamaId].membersCount;
    }
    /**
     * @notice Allows a member to make a scheduled contribution.
     * @param _chamaId The ID of the Chama to which the contribution is made.
     *
     * Requirements:
     * - The Chama must be active.
     * - The sender must be a member of the Chama.
     * - The sent ETH must match the scheduled contribution amount.
     */
    function contribute(uint256 _chamaId) external payable {
        Chama storage chama = chamas[_chamaId];
        require(chama.isActive, "Chama is not active");
        require(isMember(_chamaId, msg.sender), "Not a member of this Chama");
        require(msg.value == chama.contributionAmount, "Incorrect contribution amount");

        // Additional tracking of individual contributions could be implemented here.

        emit ContributionMade(_chamaId, msg.sender, msg.value);
    }

    /**
     * @notice Executes a payout for the current contribution round.
     *
     * This function transfers the pooled contribution from all members
     * to the member scheduled for payout in a round-robin manner and then advances
     * the current round pointer.
     *
     * Requirements:
     * - The Chama must be active.
     * - The Chama must be full (i.e., all spots are filled).
     */
    function payout(uint256 _chamaId) external {
        Chama storage chama = chamas[_chamaId];
        require(chama.isActive, "Chama is not active");
        require(chama.members.length == chama.maxMembers, "Chama is not full yet");

        // Determine the payout recipient based on the current round (1-indexed)
        address recipient = chama.members[chama.currentRound - 1];
        uint256 payoutAmount = chama.contributionAmount * chama.maxMembers;

        // Update the round pointer (circular round-robin)
        chama.currentRound = (chama.currentRound % chama.maxMembers) + 1;

        // Transfer the total pooled contributions to the recipient
        (bool sent, ) = recipient.call{value: payoutAmount}("");
        require(sent, "Payout failed");

        emit PayoutExecuted(_chamaId, recipient);
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

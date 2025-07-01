// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AquaCoin
 * @dev ERC20 token for Tidewy platform rewards
 */
contract AquaCoin is ERC20, Ownable, Pausable, ReentrancyGuard {
    // Events
    event CoinsEarned(address indexed user, uint256 amount, string reason, bytes32 indexed eventId);
    event CoinsSpent(address indexed user, uint256 amount, string reason, bytes32 indexed itemId);
    event ImpactRecorded(address indexed user, uint256 wasteCollected, uint256 hoursVolunteered);
    event AchievementUnlocked(address indexed user, bytes32 indexed achievementId, uint256 coinsAwarded);
    
    // Structs
    struct UserImpact {
        uint256 totalWasteCollected; // in grams
        uint256 totalHoursVolunteered; // in minutes
        uint256 eventsCompleted;
        uint256 achievementsUnlocked;
        uint256 totalCoinsEarned;
        uint256 totalCoinsSpent;
    }
    
    struct EventRecord {
        bytes32 eventId;
        address organizer;
        uint256 timestamp;
        uint256 participantCount;
        uint256 wasteCollected;
        bool isCompleted;
    }
    
    struct Achievement {
        bytes32 id;
        string name;
        string description;
        uint256 coinsReward;
        uint256 requirement;
        string requirementType; // "events", "hours", "waste", "custom"
        bool isActive;
    }
    
    // State variables
    mapping(address => UserImpact) public userImpacts;
    mapping(bytes32 => EventRecord) public events;
    mapping(bytes32 => Achievement) public achievements;
    mapping(address => mapping(bytes32 => bool)) public userAchievements;
    mapping(address => bool) public authorizedMinters;
    
    // Constants
    uint256 public constant EVENT_COMPLETION_REWARD = 50 * 10**18; // 50 AquaCoins
    uint256 public constant HOUR_VOLUNTEERED_REWARD = 10 * 10**18; // 10 AquaCoins per hour
    uint256 public constant WASTE_COLLECTION_REWARD = 1 * 10**15; // 0.001 AquaCoins per gram
    uint256 public constant IMAGE_UPLOAD_REWARD = 25 * 10**18; // 25 AquaCoins
    
    constructor() ERC20("AquaCoin", "AQUA") {
        _mint(msg.sender, 1000000 * 10**18); // Initial supply: 1M tokens
        
        // Initialize default achievements
        _createAchievement(
            keccak256("FIRST_CLEANUP"),
            "First Cleanup",
            "Complete your first beach cleanup event",
            100 * 10**18,
            1,
            "events"
        );
        
        _createAchievement(
            keccak256("TEAM_PLAYER"),
            "Team Player",
            "Participate in 5 beach cleanup events",
            250 * 10**18,
            5,
            "events"
        );
        
        _createAchievement(
            keccak256("OCEAN_GUARDIAN"),
            "Ocean Guardian",
            "Volunteer for 20+ hours",
            500 * 10**18,
            1200, // 20 hours in minutes
            "hours"
        );
        
        _createAchievement(
            keccak256("WASTE_WARRIOR"),
            "Waste Warrior",
            "Collect 10kg of waste",
            300 * 10**18,
            10000, // 10kg in grams
            "waste"
        );
    }
    
    modifier onlyAuthorized() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    // Authorization functions
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }
    
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }
    
    // Event completion reward
    function rewardEventCompletion(
        address user,
        bytes32 eventId,
        uint256 hoursVolunteered,
        uint256 wasteCollected
    ) external onlyAuthorized nonReentrant {
        require(user != address(0), "Invalid user address");
        require(!events[eventId].isCompleted, "Event already completed");
        
        // Record event
        events[eventId] = EventRecord({
            eventId: eventId,
            organizer: msg.sender,
            timestamp: block.timestamp,
            participantCount: 1,
            wasteCollected: wasteCollected,
            isCompleted: true
        });
        
        // Calculate total reward
        uint256 totalReward = EVENT_COMPLETION_REWARD;
        totalReward += hoursVolunteered * HOUR_VOLUNTEERED_REWARD;
        totalReward += wasteCollected * WASTE_COLLECTION_REWARD;
        
        // Update user impact
        userImpacts[user].eventsCompleted++;
        userImpacts[user].totalHoursVolunteered += hoursVolunteered;
        userImpacts[user].totalWasteCollected += wasteCollected;
        userImpacts[user].totalCoinsEarned += totalReward;
        
        // Mint and transfer coins
        _mint(user, totalReward);
        
        // Record impact
        emit ImpactRecorded(user, wasteCollected, hoursVolunteered);
        emit CoinsEarned(user, totalReward, "Event completion", eventId);
        
        // Check for achievements
        _checkAndAwardAchievements(user);
    }
    
    // Achievement reward
    function rewardAchievement(
        address user,
        bytes32 achievementId
    ) external onlyAuthorized nonReentrant {
        require(user != address(0), "Invalid user address");
        require(achievements[achievementId].isActive, "Achievement not active");
        require(!userAchievements[user][achievementId], "Achievement already unlocked");
        
        Achievement memory achievement = achievements[achievementId];
        
        // Mark achievement as unlocked
        userAchievements[user][achievementId] = true;
        userImpacts[user].achievementsUnlocked++;
        userImpacts[user].totalCoinsEarned += achievement.coinsReward;
        
        // Mint and transfer coins
        _mint(user, achievement.coinsReward);
        
        emit AchievementUnlocked(user, achievementId, achievement.coinsReward);
        emit CoinsEarned(user, achievement.coinsReward, "Achievement unlocked", achievementId);
    }
    
    // Store purchase
    function spendCoins(
        address user,
        uint256 amount,
        bytes32 itemId,
        string memory reason
    ) external onlyAuthorized nonReentrant {
        require(user != address(0), "Invalid user address");
        require(balanceOf(user) >= amount, "Insufficient balance");
        
        // Burn coins
        _burn(user, amount);
        
        // Update user impact
        userImpacts[user].totalCoinsSpent += amount;
        
        emit CoinsSpent(user, amount, reason, itemId);
    }
    
    // Image upload reward
    function rewardImageUpload(
        address user,
        bytes32 eventId
    ) external onlyAuthorized nonReentrant {
        require(user != address(0), "Invalid user address");
        
        // Update user impact
        userImpacts[user].totalCoinsEarned += IMAGE_UPLOAD_REWARD;
        
        // Mint and transfer coins
        _mint(user, IMAGE_UPLOAD_REWARD);
        
        emit CoinsEarned(user, IMAGE_UPLOAD_REWARD, "Image upload", eventId);
    }
    
    // Internal function to create achievements
    function _createAchievement(
        bytes32 id,
        string memory name,
        string memory description,
        uint256 coinsReward,
        uint256 requirement,
        string memory requirementType
    ) internal {
        achievements[id] = Achievement({
            id: id,
            name: name,
            description: description,
            coinsReward: coinsReward,
            requirement: requirement,
            requirementType: requirementType,
            isActive: true
        });
    }
    
    // Check and award achievements
    function _checkAndAwardAchievements(address user) internal {
        UserImpact memory impact = userImpacts[user];
        
        // Check events-based achievements
        if (impact.eventsCompleted >= 1 && !userAchievements[user][keccak256("FIRST_CLEANUP")]) {
            _awardAchievement(user, keccak256("FIRST_CLEANUP"));
        }
        
        if (impact.eventsCompleted >= 5 && !userAchievements[user][keccak256("TEAM_PLAYER")]) {
            _awardAchievement(user, keccak256("TEAM_PLAYER"));
        }
        
        // Check hours-based achievements
        if (impact.totalHoursVolunteered >= 1200 && !userAchievements[user][keccak256("OCEAN_GUARDIAN")]) {
            _awardAchievement(user, keccak256("OCEAN_GUARDIAN"));
        }
        
        // Check waste-based achievements
        if (impact.totalWasteCollected >= 10000 && !userAchievements[user][keccak256("WASTE_WARRIOR")]) {
            _awardAchievement(user, keccak256("WASTE_WARRIOR"));
        }
    }
    
    function _awardAchievement(address user, bytes32 achievementId) internal {
        Achievement memory achievement = achievements[achievementId];
        
        userAchievements[user][achievementId] = true;
        userImpacts[user].achievementsUnlocked++;
        userImpacts[user].totalCoinsEarned += achievement.coinsReward;
        
        _mint(user, achievement.coinsReward);
        
        emit AchievementUnlocked(user, achievementId, achievement.coinsReward);
        emit CoinsEarned(user, achievement.coinsReward, "Achievement unlocked", achievementId);
    }
    
    // Admin functions
    function createAchievement(
        bytes32 id,
        string memory name,
        string memory description,
        uint256 coinsReward,
        uint256 requirement,
        string memory requirementType
    ) external onlyOwner {
        _createAchievement(id, name, description, coinsReward, requirement, requirementType);
    }
    
    function deactivateAchievement(bytes32 achievementId) external onlyOwner {
        achievements[achievementId].isActive = false;
    }
    
    // View functions
    function getUserImpact(address user) external view returns (UserImpact memory) {
        return userImpacts[user];
    }
    
    function getAchievement(bytes32 achievementId) external view returns (Achievement memory) {
        return achievements[achievementId];
    }
    
    function hasAchievement(address user, bytes32 achievementId) external view returns (bool) {
        return userAchievements[user][achievementId];
    }
    
    function getEventRecord(bytes32 eventId) external view returns (EventRecord memory) {
        return events[eventId];
    }
    
    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Override required functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
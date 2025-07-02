// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AquaCoin.sol";

/**
 * @title Tidey
 * @dev Beach Cleaning Initiative Management Contract
 * @notice This contract manages volunteer registration, community service tasks, evidence submission, and token rewards
 *
 * Features:
 * - Volunteer registration with profile information
 * - Community service tasks (events) created by admin with batch rewards
 * - Evidence submission with ML scoring and automatic rewards
 * - Two reward systems: Task participation (20 AQUA) and Evidence submission (5 AQUA)
 * - Leaderboard based on total AQUA tokens earned
 */
contract Tidey is Ownable, Pausable, ReentrancyGuard {
    // ============ State Variables ============

    /// @notice Reference to the AquaCoin token contract
    AquaCoin public aquaCoinToken;

    /// @notice Fixed reward amount per evidence submission (5 AQUA tokens)
    uint256 public evidenceRewardAmount = 5 * 10 ** 18;

    /// @notice Fixed reward amount per task participation (20 AQUA tokens)
    uint256 public taskRewardAmount = 20 * 10 ** 18;

    /// @notice Minimum ML score required for evidence approval (0-100 scale)
    uint256 public minimumMLScore = 50;

    /// @notice Counter for total registered volunteers
    uint256 public totalVolunteers;

    /// @notice Counter for total community service tasks
    uint256 public totalTasks;

    /// @notice Counter for total evidence submissions
    uint256 public totalEvidenceSubmissions;

    /// @notice Counter for total approved evidence
    uint256 public approvedEvidenceCount;

    // ============ Structs ============

    /// @notice Volunteer profile information
    struct Volunteer {
        address volunteerAddress;
        string name;
        string email;
        string mobile;
        uint256 registrationTime;
        uint256 totalTokensEarned; // Total AQUA tokens earned
        uint256 evidenceSubmitted; // Number of evidence submitted
        uint256 tasksParticipated; // Number of tasks participated
        bool isActive;
        bool isRegistered;
    }

    /// @notice Community service task (event) information
    struct Task {
        uint256 taskId;
        string title;
        string description;
        string location;
        uint256 startTime;
        uint256 endTime;
        uint256 maxParticipants;
        uint256 currentParticipants;
        address[] participants;
        bool isActive;
        bool rewardsDistributed;
        address createdBy;
        uint256 createdTime;
    }

    /// @notice Evidence submission information
    struct Evidence {
        uint256 evidenceId;
        address volunteer;
        string photoHash; // IPFS hash or other storage hash
        uint256 mlScore; // AI/ML verification score (0-100)
        string geoLocation; // Latitude,Longitude or geohash
        uint256 timestamp;
        bool isApproved;
        bool rewardClaimed;
        string description; // Optional evidence description
        uint256 tokensAwarded;
    }

    /// @notice Leaderboard entry
    struct LeaderboardEntry {
        address volunteer;
        string name;
        uint256 tokensEarned;
        uint256 evidenceCount;
        uint256 tasksCount;
    }

    // ============ Mappings ============

    /// @notice Mapping from address to volunteer profile
    mapping(address => Volunteer) public volunteers;

    /// @notice Mapping from task ID to task details
    mapping(uint256 => Task) public tasks;

    /// @notice Mapping from evidence ID to evidence details
    mapping(uint256 => Evidence) public evidenceSubmissions;

    // / @notice Mapping from adress to evidences
    // mapping(address => Evidence[]) public userevidences;

    /// @notice Mapping to track volunteer addresses for iteration
    address[] public volunteerAddresses;

    /// @notice Mapping to track task participation (taskId => volunteer => participated)
    mapping(uint256 => mapping(address => bool)) public taskParticipation;

    /// @notice Mapping for admin addresses
    mapping(address => bool) public admins;

    // ============ Events ============

    /// @notice Emitted when a new volunteer registers
    event VolunteerRegistered(
        address indexed volunteer,
        string name,
        string email,
        uint256 timestamp
    );

    /// @notice Emitted when a community service task is created
    event TaskCreated(
        uint256 indexed taskId,
        string title,
        string location,
        uint256 startTime,
        uint256 endTime,
        uint256 maxParticipants,
        address indexed createdBy
    );

    /// @notice Emitted when a volunteer joins a task
    event TaskJoined(
        uint256 indexed taskId,
        address indexed volunteer,
        uint256 timestamp
    );

    /// @notice Emitted when task rewards are distributed
    event TaskRewardsDistributed(
        uint256 indexed taskId,
        address[] participants,
        uint256 rewardPerParticipant,
        uint256 totalRewards
    );

    /// @notice Emitted when evidence is submitted
    event EvidenceSubmitted(
        uint256 indexed evidenceId,
        address indexed volunteer,
        string photoHash,
        uint256 mlScore,
        string geoLocation,
        uint256 timestamp
    );

    /// @notice Emitted when evidence is approved and reward is distributed
    event EvidenceApproved(
        uint256 indexed evidenceId,
        address indexed volunteer,
        uint256 tokensAwarded
    );

    /// @notice Emitted when batch tokens are awarded
    event BatchTokensAwarded(
        address[] recipients,
        uint256[] amounts,
        string reason
    );

    // ============ Modifiers ============

    /// @notice Modifier to check if caller is registered volunteer
    modifier onlyRegisteredVolunteer() {
        require(
            volunteers[msg.sender].isRegistered,
            "Tidey: Not a registered volunteer"
        );
        require(
            volunteers[msg.sender].isActive,
            "Tidey: Volunteer account is inactive"
        );
        _;
    }

    /// @notice Modifier to check if caller is admin or owner
    modifier onlyAdminOrOwner() {
        require(
            admins[msg.sender] || msg.sender == owner(),
            "Tidey: Not authorized"
        );
        _;
    }

    // ============ Constructor ============

    /**
     * @dev Initializes the Tidey contract
     * @param _aquaCoinToken Address of the AquaCoin token contract
     * @param initialOwner Address of the contract owner (NGO)
     */
    constructor(
        address _aquaCoinToken,
        address initialOwner
    ) Ownable(initialOwner) {
        require(
            _aquaCoinToken != address(0),
            "Tidey: Invalid AquaCoin address"
        );
        aquaCoinToken = AquaCoin(_aquaCoinToken);

        // Set the owner as an admin
        admins[initialOwner] = true;
    }

    // ============ Registration Functions ============

    /**
     * @dev Register a new volunteer
     * @param _name Volunteer's full name
     * @param _email Volunteer's email address
     * @param _mobile Volunteer's mobile number
     */
    function registerVolunteer(
        string calldata _name,
        string calldata _email,
        string calldata _mobile
    ) external whenNotPaused {
        require(
            !volunteers[msg.sender].isRegistered,
            "Tidey: Already registered"
        );
        require(bytes(_name).length > 0, "Tidey: Name cannot be empty");
        require(bytes(_email).length > 0, "Tidey: Email cannot be empty");
        require(bytes(_mobile).length > 0, "Tidey: Mobile cannot be empty");

        volunteers[msg.sender] = Volunteer({
            volunteerAddress: msg.sender,
            name: _name,
            email: _email,
            mobile: _mobile,
            registrationTime: block.timestamp,
            totalTokensEarned: 0,
            evidenceSubmitted: 0,
            tasksParticipated: 0,
            isActive: true,
            isRegistered: true
        });

        volunteerAddresses.push(msg.sender);
        totalVolunteers++;

        emit VolunteerRegistered(msg.sender, _name, _email, block.timestamp);
    }

    /**
     * @dev Update volunteer profile information
     * @param _name Updated name
     * @param _email Updated email
     * @param _mobile Updated mobile
     */
    function updateVolunteerProfile(
        string calldata _name,
        string calldata _email,
        string calldata _mobile
    ) external onlyRegisteredVolunteer whenNotPaused {
        require(bytes(_name).length > 0, "Tidey: Name cannot be empty");
        require(bytes(_email).length > 0, "Tidey: Email cannot be empty");
        require(bytes(_mobile).length > 0, "Tidey: Mobile cannot be empty");

        volunteers[msg.sender].name = _name;
        volunteers[msg.sender].email = _email;
        volunteers[msg.sender].mobile = _mobile;
    }

    // ============ Community Service Task Functions ============

    /**
     * @dev Create a new community service task (admin only)
     * @param _title Task title
     * @param _description Task description
     * @param _location Task location
     * @param _startTime Task start time (timestamp)
     * @param _endTime Task end time (timestamp)
     * @param _maxParticipants Maximum number of participants
     */
    function createTask(
        string calldata _title,
        string calldata _description,
        string calldata _location,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxParticipants
    ) external onlyAdminOrOwner whenNotPaused {
        require(bytes(_title).length > 0, "Tidey: Title cannot be empty");
        require(bytes(_location).length > 0, "Tidey: Location cannot be empty");
        require(
            _startTime > block.timestamp,
            "Tidey: Start time must be in future"
        );
        require(
            _endTime > _startTime,
            "Tidey: End time must be after start time"
        );
        require(
            _maxParticipants > 0,
            "Tidey: Max participants must be greater than 0"
        );

        uint256 taskId = totalTasks + 1;

        tasks[taskId] = Task({
            taskId: taskId,
            title: _title,
            description: _description,
            location: _location,
            startTime: _startTime,
            endTime: _endTime,
            maxParticipants: _maxParticipants,
            currentParticipants: 0,
            participants: new address[](0),
            isActive: true,
            rewardsDistributed: false,
            createdBy: msg.sender,
            createdTime: block.timestamp
        });

        totalTasks++;

        emit TaskCreated(
            taskId,
            _title,
            _location,
            _startTime,
            _endTime,
            _maxParticipants,
            msg.sender
        );
    }

    /**
     * @dev Join a community service task
     * @param _taskId ID of the task to join
     */
    function joinTask(
        uint256 _taskId
    ) external onlyRegisteredVolunteer whenNotPaused {
        require(_taskId > 0 && _taskId <= totalTasks, "Tidey: Invalid task ID");
        require(tasks[_taskId].isActive, "Tidey: Task is not active");
        require(
            block.timestamp < tasks[_taskId].startTime,
            "Tidey: Task has already started"
        );
        require(
            tasks[_taskId].currentParticipants < tasks[_taskId].maxParticipants,
            "Tidey: Task is full"
        );
        require(
            !taskParticipation[_taskId][msg.sender],
            "Tidey: Already joined this task"
        );

        tasks[_taskId].participants.push(msg.sender);
        tasks[_taskId].currentParticipants++;
        taskParticipation[_taskId][msg.sender] = true;

        emit TaskJoined(_taskId, msg.sender, block.timestamp);
    }

    /**
     * @dev Distribute rewards to task participants (admin only)
     * @param _taskId ID of the task to distribute rewards for
     */
    function distributeTaskRewards(
        uint256 _taskId
    ) external onlyAdminOrOwner whenNotPaused nonReentrant {
        require(_taskId > 0 && _taskId <= totalTasks, "Tidey: Invalid task ID");
        require(
            block.timestamp > tasks[_taskId].endTime || tasks[_taskId].isActive==false,
            "Tidey: Task has not ended yet"
        );
        require(
            !tasks[_taskId].rewardsDistributed,
            "Tidey: Rewards already distributed"
        );
        require(
            tasks[_taskId].currentParticipants > 0,
            "Tidey: No participants to reward"
        );

        Task storage task = tasks[_taskId];
        uint256 totalRewards = task.currentParticipants * taskRewardAmount;

        // Distribute rewards to all participants
        for (uint256 i = 0; i < task.participants.length; i++) {
            address participant = task.participants[i];

            // Update volunteer stats
            volunteers[participant].totalTokensEarned += taskRewardAmount;
            volunteers[participant].tasksParticipated++;

            // Transfer tokens
            require(
                aquaCoinToken.transfer(participant, taskRewardAmount),
                "Tidey: Token transfer failed"
            );
        }

        task.rewardsDistributed = true;

        emit TaskRewardsDistributed(
            _taskId,
            task.participants,
            taskRewardAmount,
            totalRewards
        );
    }

    // ============ Evidence Submission Functions ============

    /**
     * @dev Submit cleanup evidence
     * @param _photoHash IPFS hash or storage hash of cleanup photo
     * @param _mlScore AI/ML verification score (0-100)
     * @param _geoLocation Geographic location (lat,lng or geohash)
     * @param _description Optional description of the cleanup evidence
     */
    function submitEvidence(
        string calldata _photoHash,
        uint256 _mlScore,
        string calldata _geoLocation,
        string calldata _description
    ) external onlyRegisteredVolunteer whenNotPaused nonReentrant {
        require(
            bytes(_photoHash).length > 0,
            "Tidey: Photo hash cannot be empty"
        );
        require(_mlScore <= 100, "Tidey: ML score cannot exceed 100");
        require(
            bytes(_geoLocation).length > 0,
            "Tidey: Geo location cannot be empty"
        );

        uint256 evidenceId = totalEvidenceSubmissions + 1;
        uint256 tokensAwarded = 0;
        bool isApproved = false;

        // Auto-approve evidence if ML score meets minimum requirement
        if (_mlScore >= minimumMLScore) {
            isApproved = true;
            tokensAwarded = evidenceRewardAmount;

            // Update volunteer stats
            volunteers[msg.sender].totalTokensEarned += tokensAwarded;
            volunteers[msg.sender].evidenceSubmitted++;
            approvedEvidenceCount++;

            // Distribute AquaCoin reward
            require(
                aquaCoinToken.transfer(msg.sender, tokensAwarded),
                "Tidey: Token transfer failed"
            );
        }

        evidenceSubmissions[evidenceId] = Evidence({
            evidenceId: evidenceId,
            volunteer: msg.sender,
            photoHash: _photoHash,
            mlScore: _mlScore,
            geoLocation: _geoLocation,
            timestamp: block.timestamp,
            isApproved: isApproved,
            rewardClaimed: isApproved,
            description: _description,
            tokensAwarded: tokensAwarded
        });

        totalEvidenceSubmissions++;

        emit EvidenceSubmitted(
            evidenceId,
            msg.sender,
            _photoHash,
            _mlScore,
            _geoLocation,
            block.timestamp
        );

        if (isApproved) {
            emit EvidenceApproved(evidenceId, msg.sender, tokensAwarded);
        }
    }

    /**
     * @dev Manually approve evidence (admin function)
     * @param _evidenceId ID of the evidence to approve
     */
    function approveEvidence(
        uint256 _evidenceId
    ) external onlyAdminOrOwner whenNotPaused nonReentrant {
        require(
            _evidenceId > 0 && _evidenceId <= totalEvidenceSubmissions,
            "Tidey: Invalid evidence ID"
        );
        require(
            !evidenceSubmissions[_evidenceId].isApproved,
            "Tidey: Evidence already approved"
        );

        Evidence storage evidence = evidenceSubmissions[_evidenceId];

        evidence.isApproved = true;
        evidence.rewardClaimed = true;
        evidence.tokensAwarded = evidenceRewardAmount;

        // Update volunteer stats
        volunteers[evidence.volunteer]
            .totalTokensEarned += evidenceRewardAmount;
        volunteers[evidence.volunteer].evidenceSubmitted++;
        approvedEvidenceCount++;

        // Distribute AquaCoin reward
        require(
            aquaCoinToken.transfer(evidence.volunteer, evidenceRewardAmount),
            "Tidey: Token transfer failed"
        );

        emit EvidenceApproved(
            _evidenceId,
            evidence.volunteer,
            evidenceRewardAmount
        );
    }

    // ============ Batch Reward Functions ============

    /**
     * @dev Batch award tokens to multiple volunteers
     * @param _recipients Array of volunteer addresses
     * @param _amounts Array of token amounts
     * @param _reason Reason for the batch award
     */
    function batchAwardTokens(
        address[] calldata _recipients,
        uint256[] calldata _amounts,
        string calldata _reason
    ) external onlyAdminOrOwner whenNotPaused nonReentrant {
        require(
            _recipients.length == _amounts.length,
            "Tidey: Arrays length mismatch"
        );
        require(_recipients.length > 0, "Tidey: Empty arrays");
        require(_recipients.length <= 100, "Tidey: Too many recipients");

        for (uint256 i = 0; i < _recipients.length; i++) {
            require(
                _recipients[i] != address(0),
                "Tidey: Invalid recipient address"
            );
            require(
                volunteers[_recipients[i]].isRegistered,
                "Tidey: Recipient not registered"
            );
            require(_amounts[i] > 0, "Tidey: Amount must be greater than 0");

            // Update volunteer stats
            volunteers[_recipients[i]].totalTokensEarned += _amounts[i];

            // Transfer tokens
            require(
                aquaCoinToken.transfer(_recipients[i], _amounts[i]),
                "Tidey: Token transfer failed"
            );
        }

        emit BatchTokensAwarded(_recipients, _amounts, _reason);
    }

    // ============ Leaderboard Functions ============

    /**
     * @dev Get top volunteers by total tokens earned
     * @param _count Number of top volunteers to return
     * @return Array of LeaderboardEntry structs
     */
    function getTopVolunteers(
        uint256 _count
    ) public view returns (LeaderboardEntry[] memory) {
        require(_count > 0, "Tidey: Count must be greater than 0");

        uint256 actualCount = _count > totalVolunteers
            ? totalVolunteers
            : _count;
        LeaderboardEntry[] memory leaderboard = new LeaderboardEntry[](
            actualCount
        );

        // Create array of all volunteers with tokens
        LeaderboardEntry[] memory allVolunteers = new LeaderboardEntry[](
            totalVolunteers
        );
        uint256 validVolunteers = 0;

        for (uint256 i = 0; i < volunteerAddresses.length; i++) {
            address volunteerAddr = volunteerAddresses[i];
            if (
                volunteers[volunteerAddr].isActive &&
                volunteers[volunteerAddr].totalTokensEarned > 0
            ) {
                allVolunteers[validVolunteers] = LeaderboardEntry({
                    volunteer: volunteerAddr,
                    name: volunteers[volunteerAddr].name,
                    tokensEarned: volunteers[volunteerAddr].totalTokensEarned,
                    evidenceCount: volunteers[volunteerAddr].evidenceSubmitted,
                    tasksCount: volunteers[volunteerAddr].tasksParticipated
                });
                validVolunteers++;
            }
        }

        // Simple bubble sort by tokens earned
        for (uint256 i = 0; i < validVolunteers - 1; i++) {
            for (uint256 j = 0; j < validVolunteers - i - 1; j++) {
                if (
                    allVolunteers[j].tokensEarned <
                    allVolunteers[j + 1].tokensEarned
                ) {
                    LeaderboardEntry memory temp = allVolunteers[j];
                    allVolunteers[j] = allVolunteers[j + 1];
                    allVolunteers[j + 1] = temp;
                }
            }
        }

        // Return top performers
        for (uint256 i = 0; i < actualCount && i < validVolunteers; i++) {
            leaderboard[i] = allVolunteers[i];
        }

        return leaderboard;
    }

    // ============ Admin Functions ============

    /**
     * @dev Add or remove admin privileges
     * @param _admin Address to modify admin status for
     * @param _status True to grant admin, false to revoke
     */
    function setAdminStatus(address _admin, bool _status) external onlyOwner {
        require(_admin != address(0), "Tidey: Invalid admin address");
        admins[_admin] = _status;
    }

    /**
     * @dev Update evidence reward amount
     * @param _newAmount New reward amount per evidence
     */
    function updateEvidenceRewardAmount(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0, "Tidey: Reward amount must be greater than 0");
        evidenceRewardAmount = _newAmount;
    }

    /**
     * @dev Update task reward amount
     * @param _newAmount New reward amount per task participation
     */
    function updateTaskRewardAmount(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0, "Tidey: Reward amount must be greater than 0");
        taskRewardAmount = _newAmount;
    }

    /**
     * @dev Update minimum ML score requirement
     * @param _newMinScore New minimum ML score (0-100)
     */
    function updateMinimumMLScore(uint256 _newMinScore) external onlyOwner {
        require(_newMinScore <= 100, "Tidey: Score cannot exceed 100");
        minimumMLScore = _newMinScore;
    }

    /**
     * @dev Deactivate/reactivate a volunteer account
     * @param _volunteer Volunteer address
     * @param _isActive True to activate, false to deactivate
     */
    function setVolunteerStatus(
        address _volunteer,
        bool _isActive
    ) external onlyAdminOrOwner {
        require(
            volunteers[_volunteer].isRegistered,
            "Tidey: Volunteer not registered"
        );
        volunteers[_volunteer].isActive = _isActive;
    }

    /**
     * @dev Deactivate a task
     * @param _taskId Task ID to deactivate
     */
    function deactivateTask(uint256 _taskId) external onlyAdminOrOwner {
        require(_taskId > 0 && _taskId <= totalTasks, "Tidey: Invalid task ID");
        tasks[_taskId].isActive = false;
    }

    /**
     * @dev Emergency withdraw function for contract AquaCoin balance
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Tidey: Amount must be greater than 0");
        require(
            aquaCoinToken.transfer(owner(), _amount),
            "Tidey: Transfer failed"
        );
    }

    /**
     * @dev Pause contract operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ View Functions ============

    /**
     * @dev Get volunteer information
     * @param _volunteer Volunteer address
     * @return Volunteer struct
     */
    function getVolunteerInfo(
        address _volunteer
    ) external view returns (Volunteer memory) {
        return volunteers[_volunteer];
    }

    /**
     * @dev Get task information
     * @param _taskId Task ID
     * @return Task struct
     */
    function getTaskInfo(uint256 _taskId) external view returns (Task memory) {
        require(_taskId > 0 && _taskId <= totalTasks, "Tidey: Invalid task ID");
        return tasks[_taskId];
    }

    /**
     * @dev Get evidence information
     * @param _evidenceId Evidence ID
     * @return Evidence struct
     */
    function getEvidenceInfo(
        uint256 _evidenceId
    ) external view returns (Evidence memory) {
        require(
            _evidenceId > 0 && _evidenceId <= totalEvidenceSubmissions,
            "Tidey: Invalid evidence ID"
        );
        return evidenceSubmissions[_evidenceId];
    }

    /**
     * @dev Get all active tasks
     * @return Array of active task IDs
     */
    function getActiveTasks() external view returns (uint256[] memory) {
        uint256[] memory activeTasks = new uint256[](totalTasks);
        uint256 activeCount = 0;

        for (uint256 i = 1; i <= totalTasks; i++) {
            if (tasks[i].isActive && block.timestamp < tasks[i].startTime) {
                activeTasks[activeCount] = i;
                activeCount++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeTasks[i];
        }

        return result;
    }

    /**
     * @dev Get contract statistics
     * @return totalVolunteers_ Total registered volunteers
     * @return totalTasks_ Total community service tasks
     * @return totalEvidenceSubmissions_ Total evidence submissions
     * @return approvedEvidenceCount_ Total approved evidence
     * @return contractTokenBalance Contract's AquaCoin balance
     */
    function getContractStats()
        external
        view
        returns (
            uint256 totalVolunteers_,
            uint256 totalTasks_,
            uint256 totalEvidenceSubmissions_,
            uint256 approvedEvidenceCount_,
            uint256 contractTokenBalance
        )
    {
        return (
            totalVolunteers,
            totalTasks,
            totalEvidenceSubmissions,
            approvedEvidenceCount,
            aquaCoinToken.balanceOf(address(this))
        );
    }

    /**
     * @dev Check if address is admin
     * @param _address Address to check
     * @return True if address is admin or owner
     */
    function isAdmin(address _address) external view returns (bool) {
        return admins[_address] || _address == owner();
    }
}

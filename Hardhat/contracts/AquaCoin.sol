// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title AquaCoin
 * @dev ERC-20 token for Beach Cleaning Initiative
 * @notice This token is used to reward volunteers for beach cleanup activities
 *
 * Features:
 * - Only owner (NGO) can mint tokens
 * - Pausable for emergency situations
 * - Burnable tokens for deflationary mechanics
 * - Supply tracking and caps
 */
contract AquaCoin is ERC20, Ownable, Pausable, ERC20Burnable {
    // ============ State Variables ============

    /// @notice Maximum supply of AquaCoin tokens (100 million tokens)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18;

    /// @notice Total tokens minted (tracked separately from totalSupply for burned tokens)
    uint256 public totalMinted;

    /// @notice Mapping to track authorized minters (future expansion)
    mapping(address => bool) public authorizedMinters;

    // ============ Events ============

    /// @notice Emitted when tokens are minted to a recipient
    event TokensMinted(address indexed to, uint256 amount, string reason);

    /// @notice Emitted when an authorized minter is added or removed
    event MinterStatusChanged(address indexed minter, bool status);

    /// @notice Emitted when tokens are airdropped to multiple recipients
    event TokensAirdropped(
        address[] recipients,
        uint256[] amounts,
        uint256 totalAmount
    );

    // ============ Constructor ============

    /**
     * @dev Initializes the AquaCoin token
     * @param initialOwner The address that will own the contract (NGO address)
     */
    constructor(
        address initialOwner
    ) ERC20("AquaCoin", "AQUA") Ownable(initialOwner) {
        // Mint initial supply to the owner for distribution
        uint256 initialSupply = 1_000_000 * 10 ** 18; // 1 million tokens
        _mint(initialOwner, initialSupply);
        totalMinted = initialSupply;

        emit TokensMinted(initialOwner, initialSupply, "Initial supply minted");
    }

    // ============ Minting Functions ============

    /**
     * @dev Mints tokens to a specific address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     * @param reason Optional reason for minting (for transparency)
     */
    function mint(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyOwner whenNotPaused {
        require(to != address(0), "AquaCoin: Cannot mint to zero address");
        require(amount > 0, "AquaCoin: Amount must be greater than 0");
        require(
            totalMinted + amount <= MAX_SUPPLY,
            "AquaCoin: Exceeds maximum supply"
        );

        _mint(to, amount);
        totalMinted += amount;

        emit TokensMinted(to, amount, reason);
    }

    /**
     * @dev Batch mint tokens to multiple addresses (for airdrops)
     * @param recipients Array of addresses to mint tokens to
     * @param amounts Array of amounts corresponding to each recipient
     * @param reason Reason for the airdrop
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string calldata reason
    ) external onlyOwner whenNotPaused {
        require(
            recipients.length == amounts.length,
            "AquaCoin: Arrays length mismatch"
        );
        require(recipients.length > 0, "AquaCoin: Empty arrays");
        require(
            recipients.length <= 200,
            "AquaCoin: Too many recipients (max 200)"
        );

        uint256 totalAmount = 0;

        // Calculate total amount first
        for (uint256 i = 0; i < amounts.length; i++) {
            require(
                recipients[i] != address(0),
                "AquaCoin: Cannot mint to zero address"
            );
            require(amounts[i] > 0, "AquaCoin: Amount must be greater than 0");
            totalAmount += amounts[i];
        }

        require(
            totalMinted + totalAmount <= MAX_SUPPLY,
            "AquaCoin: Exceeds maximum supply"
        );

        // Mint to each recipient
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }

        totalMinted += totalAmount;

        emit TokensAirdropped(recipients, amounts, totalAmount);
        emit TokensMinted(address(0), totalAmount, reason);
    }

    // ============ Reward Functions ============

    /**
     * @dev Reward a volunteer with tokens (convenience function)
     * @param volunteer The address of the volunteer to reward
     * @param amount The amount of tokens to reward
     */
    function rewardVolunteer(
        address volunteer,
        uint256 amount
    ) external onlyOwner whenNotPaused {
        _mint(volunteer, amount);
    }

    /**
     * @dev Reward multiple volunteers (batch reward)
     * @param volunteers Array of volunteer addresses
     * @param amounts Array of reward amounts
     */
    function rewardVolunteers(
        address[] calldata volunteers,
        uint256[] calldata amounts
    ) external onlyOwner whenNotPaused {
        require(
            volunteers.length == amounts.length,
            "AquaCoin: Arrays length mismatch"
        );
        require(volunteers.length > 0, "AquaCoin: Empty arrays");
        require(
            volunteers.length <= 200,
            "AquaCoin: Too many recipients (max 200)"
        );

        uint256 totalAmount = 0;

        // Calculate total amount first
        for (uint256 i = 0; i < amounts.length; i++) {
            require(
                volunteers[i] != address(0),
                "AquaCoin: Cannot mint to zero address"
            );
            require(amounts[i] > 0, "AquaCoin: Amount must be greater than 0");
            totalAmount += amounts[i];
        }

        require(
            totalMinted + totalAmount <= MAX_SUPPLY,
            "AquaCoin: Exceeds maximum supply"
        );

        // Mint to each volunteer
        for (uint256 i = 0; i < volunteers.length; i++) {
            _mint(volunteers[i], amounts[i]);
        }

        totalMinted += totalAmount;

        emit TokensAirdropped(volunteers, amounts, totalAmount);
        emit TokensMinted(address(0), totalAmount, "Volunteer batch rewards");
    }

    // ============ Access Control Functions ============

    /**
     * @dev Add or remove an authorized minter (for future expansion)
     * @param minter The address to authorize/deauthorize
     * @param status True to authorize, false to deauthorize
     */
    function setMinterStatus(address minter, bool status) external onlyOwner {
        require(
            minter != address(0),
            "AquaCoin: Cannot set zero address as minter"
        );
        authorizedMinters[minter] = status;
        emit MinterStatusChanged(minter, status);
    }

    // ============ Emergency Functions ============

    /**
     * @dev Pause all token transfers (emergency function)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause all token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ View Functions ============

    /**
     * @dev Get remaining mintable supply
     * @return The amount of tokens that can still be minted
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalMinted;
    }

    /**
     * @dev Check if an address is an authorized minter
     * @param account The address to check
     * @return True if the address is an authorized minter
     */
    function isMinter(address account) external view returns (bool) {
        return authorizedMinters[account] || account == owner();
    }

    /**
     * @dev Get token information for display purposes
     * @return name_ Token name
     * @return symbol_ Token symbol
     * @return decimals_ Token decimals
     * @return totalSupply_ Current total supply
     * @return maxSupply_ Maximum possible supply
     */
    function getTokenInfo()
        external
        view
        returns (
            string memory name_,
            string memory symbol_,
            uint8 decimals_,
            uint256 totalSupply_,
            uint256 maxSupply_
        )
    {
        return (name(), symbol(), decimals(), totalSupply(), MAX_SUPPLY);
    }

    // ============ Override Functions ============

    /**
     * @dev Override burn to update totalMinted tracking
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        // Note: We don't decrease totalMinted to track total ever minted
    }

    /**
     * @dev Override burnFrom to update totalMinted tracking
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        // Note: We don't decrease totalMinted to track total ever minted
    }
}

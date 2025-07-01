// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TideyCertificates
 * @dev NFT certificates for beach cleanup participation
 */
contract TideyCertificates is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    struct Certificate {
        uint256 tokenId;
        address volunteer;
        bytes32 eventId;
        string eventTitle;
        uint256 hoursWorked;
        uint256 wasteCollected;
        string organizationName;
        uint256 issuedAt;
        string ipfsHash;
    }
    
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public userCertificates;
    mapping(bytes32 => uint256[]) public eventCertificates;
    mapping(address => bool) public authorizedIssuers;
    
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed volunteer,
        bytes32 indexed eventId,
        string eventTitle,
        uint256 hoursWorked,
        uint256 wasteCollected
    );
    
    constructor() ERC721("Tidey Certificates", "TIDECERT") {}
    
    modifier onlyAuthorized() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    function addAuthorizedIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
    }
    
    function removeAuthorizedIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
    }
    
    function issueCertificate(
        address volunteer,
        bytes32 eventId,
        string memory eventTitle,
        uint256 hoursWorked,
        uint256 wasteCollected,
        string memory organizationName,
        string memory ipfsHash
    ) external onlyAuthorized returns (uint256) {
        require(volunteer != address(0), "Invalid volunteer address");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(volunteer, tokenId);
        
        Certificate memory cert = Certificate({
            tokenId: tokenId,
            volunteer: volunteer,
            eventId: eventId,
            eventTitle: eventTitle,
            hoursWorked: hoursWorked,
            wasteCollected: wasteCollected,
            organizationName: organizationName,
            issuedAt: block.timestamp,
            ipfsHash: ipfsHash
        });
        
        certificates[tokenId] = cert;
        userCertificates[volunteer].push(tokenId);
        eventCertificates[eventId].push(tokenId);
        
        // Set token URI to IPFS hash
        _setTokenURI(tokenId, ipfsHash);
        
        emit CertificateIssued(
            tokenId,
            volunteer,
            eventId,
            eventTitle,
            hoursWorked,
            wasteCollected
        );
        
        return tokenId;
    }
    
    function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId];
    }
    
    function getUserCertificates(address user) external view returns (uint256[] memory) {
        return userCertificates[user];
    }
    
    function getEventCertificates(bytes32 eventId) external view returns (uint256[] memory) {
        return eventCertificates[eventId];
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
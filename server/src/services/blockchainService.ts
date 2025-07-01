import { createPublicClient, createWalletClient, http, parseEther, keccak256, toBytes } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia, localhost } from 'viem/chains';
import aquaCoinABI from '../contracts/AquaCoin.json';
import certificatesABI from '../contracts/TideyCertificate.json';

interface BlockchainConfig {
  rpcUrl: string;
  privateKey: string;
  aquaCoinAddress: string;
  certificatesAddress: string;
  chain: any;
}

class BlockchainService {
  private config: BlockchainConfig;
  private publicClient: any;
  private walletClient: any;
  private account: any;

  constructor() {
    this.config = {
      rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545',
      privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      aquaCoinAddress: process.env.AQUACOIN_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      certificatesAddress: process.env.CERTIFICATES_CONTRACT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      chain: process.env.NODE_ENV === 'production' ? sepolia : localhost
    };

    this.account = privateKeyToAccount(this.config.privateKey as `0x${string}`);
    
    this.publicClient = createPublicClient({
      chain: this.config.chain,
      transport: http(this.config.rpcUrl)
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain: this.config.chain,
      transport: http(this.config.rpcUrl)
    });
  }

  // Event completion reward
  async rewardEventCompletion(
    userAddress: string,
    eventId: string,
    hoursVolunteered: number,
    wasteCollected: number
  ): Promise<string> {
    try {
      const eventIdHash = keccak256(toBytes(eventId));
      const hoursInMinutes = BigInt(hoursVolunteered * 60); // Convert hours to minutes
      const wasteInGrams = BigInt(wasteCollected * 1000); // Convert kg to grams

      const { request } = await this.publicClient.simulateContract({
        address: this.config.aquaCoinAddress,
        abi: aquaCoinABI,
        functionName: 'rewardEventCompletion',
        args: [userAddress, eventIdHash, hoursInMinutes, wasteInGrams],
        account: this.account
      });

      const hash = await this.walletClient.writeContract(request);
      
      console.log(`Event completion reward transaction: ${hash}`);
      return hash;
    } catch (error) {
      console.error('Error rewarding event completion:', error);
      throw error;
    }
  }

  // Achievement reward
  async rewardAchievement(
    userAddress: string,
    achievementId: string
  ): Promise<string> {
    try {
      const achievementIdHash = keccak256(toBytes(achievementId));

      const { request } = await this.publicClient.simulateContract({
        address: this.config.aquaCoinAddress,
        abi: aquaCoinABI,
        functionName: 'rewardAchievement',
        args: [userAddress, achievementIdHash],
        account: this.account
      });

      const hash = await this.walletClient.writeContract(request);
      
      console.log(`Achievement reward transaction: ${hash}`);
      return hash;
    } catch (error) {
      console.error('Error rewarding achievement:', error);
      throw error;
    }
  }

  // Store purchase
  async spendCoins(
    userAddress: string,
    amount: number,
    itemId: string,
    reason: string
  ): Promise<string> {
    try {
      const amountWei = parseEther(amount.toString());
      const itemIdHash = keccak256(toBytes(itemId));

      const { request } = await this.publicClient.simulateContract({
        address: this.config.aquaCoinAddress,
        abi: aquaCoinABI,
        functionName: 'spendCoins',
        args: [userAddress, amountWei, itemIdHash, reason],
        account: this.account
      });

      const hash = await this.walletClient.writeContract(request);
      
      console.log(`Spend coins transaction: ${hash}`);
      return hash;
    } catch (error) {
      console.error('Error spending coins:', error);
      throw error;
    }
  }

  // Image upload reward
  async rewardImageUpload(
    userAddress: string,
    eventId: string
  ): Promise<string> {
    try {
      const eventIdHash = keccak256(toBytes(eventId));

      const { request } = await this.publicClient.simulateContract({
        address: this.config.aquaCoinAddress,
        abi: aquaCoinABI,
        functionName: 'rewardImageUpload',
        args: [userAddress, eventIdHash],
        account: this.account
      });

      const hash = await this.walletClient.writeContract(request);
      
      console.log(`Image upload reward transaction: ${hash}`);
      return hash;
    } catch (error) {
      console.error('Error rewarding image upload:', error);
      throw error;
    }
  }

  // Issue certificate NFT
  async issueCertificate(
    volunteerAddress: string,
    eventId: string,
    eventTitle: string,
    hoursWorked: number,
    wasteCollected: number,
    organizationName: string,
    ipfsHash: string
  ): Promise<string> {
    try {
      const eventIdHash = keccak256(toBytes(eventId));
      const hoursInMinutes = BigInt(hoursWorked * 60);
      const wasteInGrams = BigInt(wasteCollected * 1000);

      const { request } = await this.publicClient.simulateContract({
        address: this.config.certificatesAddress,
        abi: certificatesABI,
        functionName: 'issueCertificate',
        args: [
          volunteerAddress,
          eventIdHash,
          eventTitle,
          hoursInMinutes,
          wasteInGrams,
          organizationName,
          ipfsHash
        ],
        account: this.account
      });

      const hash = await this.walletClient.writeContract(request);
      
      console.log(`Certificate issuance transaction: ${hash}`);
      return hash;
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw error;
    }
  }

  // Get user's AquaCoin balance
  async getBalance(userAddress: string): Promise<string> {
    try {
      const balance = await this.publicClient.readContract({
        address: this.config.aquaCoinAddress,
        abi: aquaCoinABI,
        functionName: 'balanceOf',
        args: [userAddress]
      });

      return balance.toString();
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  // Get user impact data
  async getUserImpact(userAddress: string): Promise<any> {
    try {
      const impact = await this.publicClient.readContract({
        address: this.config.aquaCoinAddress,
        abi: aquaCoinABI,
        functionName: 'getUserImpact',
        args: [userAddress]
      });

      return {
        totalWasteCollected: Number(impact.totalWasteCollected) / 1000, // Convert grams to kg
        totalHoursVolunteered: Number(impact.totalHoursVolunteered) / 60, // Convert minutes to hours
        eventsCompleted: Number(impact.eventsCompleted),
        achievementsUnlocked: Number(impact.achievementsUnlocked),
        totalCoinsEarned: impact.totalCoinsEarned.toString(),
        totalCoinsSpent: impact.totalCoinsSpent.toString()
      };
    } catch (error) {
      console.error('Error getting user impact:', error);
      throw error;
    }
  }

  // Check if user has achievement
  async hasAchievement(userAddress: string, achievementId: string): Promise<boolean> {
    try {
      const achievementIdHash = keccak256(toBytes(achievementId));
      
      const hasAchievement = await this.publicClient.readContract({
        address: this.config.aquaCoinAddress,
        abi: aquaCoinABI,
        functionName: 'hasAchievement',
        args: [userAddress, achievementIdHash]
      });

      return hasAchievement;
    } catch (error) {
      console.error('Error checking achievement:', error);
      throw error;
    }
  }

  // Get user's certificates
  async getUserCertificates(userAddress: string): Promise<number[]> {
    try {
      const certificates = await this.publicClient.readContract({
        address: this.config.certificatesAddress,
        abi: certificatesABI,
        functionName: 'getUserCertificates',
        args: [userAddress]
      });

      return certificates.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Error getting user certificates:', error);
      throw error;
    }
  }

  // Get certificate details
  async getCertificate(tokenId: number): Promise<any> {
    try {
      const certificate = await this.publicClient.readContract({
        address: this.config.certificatesAddress,
        abi: certificatesABI,
        functionName: 'getCertificate',
        args: [BigInt(tokenId)]
      });

      return {
        tokenId: Number(certificate.tokenId),
        volunteer: certificate.volunteer,
        eventId: certificate.eventId,
        eventTitle: certificate.eventTitle,
        hoursWorked: Number(certificate.hoursWorked) / 60, // Convert minutes to hours
        wasteCollected: Number(certificate.wasteCollected) / 1000, // Convert grams to kg
        organizationName: certificate.organizationName,
        issuedAt: new Date(Number(certificate.issuedAt) * 1000),
        ipfsHash: certificate.ipfsHash
      };
    } catch (error) {
      console.error('Error getting certificate:', error);
      throw error;
    }
  }

  // Add authorized minter (admin function)
  async addAuthorizedMinter(minterAddress: string): Promise<string> {
    try {
      const { request } = await this.publicClient.simulateContract({
        address: this.config.aquaCoinAddress,
        abi: aquaCoinABI,
        functionName: 'addAuthorizedMinter',
        args: [minterAddress],
        account: this.account
      });

      const hash = await this.walletClient.writeContract(request);
      
      console.log(`Add authorized minter transaction: ${hash}`);
      return hash;
    } catch (error) {
      console.error('Error adding authorized minter:', error);
      throw error;
    }
  }

  // Add authorized certificate issuer (admin function)
  async addAuthorizedIssuer(issuerAddress: string): Promise<string> {
    try {
      const { request } = await this.publicClient.simulateContract({
        address: this.config.certificatesAddress,
        abi: certificatesABI,
        functionName: 'addAuthorizedIssuer',
        args: [issuerAddress],
        account: this.account
      });

      const hash = await this.walletClient.writeContract(request);
      
      console.log(`Add authorized issuer transaction: ${hash}`);
      return hash;
    } catch (error) {
      console.error('Error adding authorized issuer:', error);
      throw error;
    }
  }
}

export default new BlockchainService();
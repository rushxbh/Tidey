import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther, keccak256, toBytes } from "viem";

describe("AquaCoin", function () {
  async function deployAquaCoinFixture() {
    const [owner, user1, user2, ngo] = await hre.viem.getWalletClients();
    
    const aquaCoin = await hre.viem.deployContract("AquaCoin");
    const publicClient = await hre.viem.getPublicClient();

    return {
      aquaCoin,
      owner,
      user1,
      user2,
      ngo,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { aquaCoin, owner } = await deployAquaCoinFixture();
      expect(await aquaCoin.read.owner()).to.equal(getAddress(owner.account.address));
    });

    it("Should have correct name and symbol", async function () {
      const { aquaCoin } = await deployAquaCoinFixture();
      expect(await aquaCoin.read.name()).to.equal("AquaCoin");
      expect(await aquaCoin.read.symbol()).to.equal("AQUA");
    });

    it("Should mint initial supply to owner", async function () {
      const { aquaCoin, owner } = await deployAquaCoinFixture();
      const balance = await aquaCoin.read.balanceOf([owner.account.address]);
      expect(balance).to.equal(parseEther("1000000"));
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to add authorized minters", async function () {
      const { aquaCoin, ngo } = await deployAquaCoinFixture();
      
      await aquaCoin.write.addAuthorizedMinter([ngo.account.address]);
      expect(await aquaCoin.read.authorizedMinters([ngo.account.address])).to.be.true;
    });

    it("Should not allow non-owner to add authorized minters", async function () {
      const { aquaCoin, user1, ngo } = await deployAquaCoinFixture();
      
      const aquaCoinAsUser1 = await hre.viem.getContractAt(
        "AquaCoin",
        aquaCoin.address,
        { client: { wallet: user1 } }
      );
      
      await expect(
        aquaCoinAsUser1.write.addAuthorizedMinter([ngo.account.address])
      ).to.be.rejectedWith("Ownable: caller is not the owner");
    });
  });

  describe("Event Completion Rewards", function () {
    it("Should reward user for event completion", async function () {
      const { aquaCoin, owner, user1 } = await deployAquaCoinFixture();
      
      // Add owner as authorized minter
      await aquaCoin.write.addAuthorizedMinter([owner.account.address]);
      
      const eventId = keccak256(toBytes("event123"));
      const hoursVolunteered = 180n; // 3 hours in minutes
      const wasteCollected = 5000n; // 5kg in grams
      
      const initialBalance = await aquaCoin.read.balanceOf([user1.account.address]);
      
      await aquaCoin.write.rewardEventCompletion([
        user1.account.address,
        eventId,
        hoursVolunteered,
        wasteCollected
      ]);
      
      const finalBalance = await aquaCoin.read.balanceOf([user1.account.address]);
      const expectedReward = parseEther("50") + (hoursVolunteered * parseEther("10")) + (wasteCollected * parseEther("0.001"));
      
      expect(BigInt(finalBalance as bigint) - BigInt(initialBalance as bigint)).to.equal(expectedReward);
    });

    it("Should update user impact correctly", async function () {
      const { aquaCoin, owner, user1 } = await deployAquaCoinFixture();
      
      await aquaCoin.write.addAuthorizedMinter([owner.account.address]);
      
      const eventId = keccak256(toBytes("event123"));
      const hoursVolunteered = 180n;
      const wasteCollected = 5000n;
      
      await aquaCoin.write.rewardEventCompletion([
        user1.account.address,
        eventId,
        hoursVolunteered,
        wasteCollected
      ]);
      
      const userImpact = await aquaCoin.read.getUserImpact([user1.account.address]) as {
        eventsCompleted: bigint;
        totalHoursVolunteered: bigint;
        totalWasteCollected: bigint;
        achievementsUnlocked?: bigint;
        totalCoinsSpent?: bigint;
      };
      
      expect(userImpact.eventsCompleted).to.equal(1n);
      expect(userImpact.totalHoursVolunteered).to.equal(hoursVolunteered);
      expect(userImpact.totalWasteCollected).to.equal(wasteCollected);
    });

    it("Should not allow duplicate event completion", async function () {
      const { aquaCoin, owner, user1 } = await deployAquaCoinFixture();
      
      await aquaCoin.write.addAuthorizedMinter([owner.account.address]);
      
      const eventId = keccak256(toBytes("event123"));
      
      await aquaCoin.write.rewardEventCompletion([
        user1.account.address,
        eventId,
        180n,
        5000n
      ]);
      
      await expect(
        aquaCoin.write.rewardEventCompletion([
          user1.account.address,
          eventId,
          180n,
          5000n
        ])
      ).to.be.rejectedWith("Event already completed");
    });
  });

  describe("Achievement Rewards", function () {
    it("Should award achievement automatically on first event", async function () {
      const { aquaCoin, owner, user1, publicClient } = await deployAquaCoinFixture();
      
      await aquaCoin.write.addAuthorizedMinter([owner.account.address]);
      
      const eventId = keccak256(toBytes("event123"));
      const firstCleanupId = keccak256(toBytes("FIRST_CLEANUP"));
      
      // Check user doesn't have achievement initially
      expect(await aquaCoin.read.hasAchievement([user1.account.address, firstCleanupId])).to.be.false;
      
      const hash = await aquaCoin.write.rewardEventCompletion([
        user1.account.address,
        eventId,
        180n,
        5000n
      ]);
      
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check user now has achievement
      expect(await aquaCoin.read.hasAchievement([user1.account.address, firstCleanupId])).to.be.true;
      
      const userImpact = await aquaCoin.read.getUserImpact([user1.account.address]) as {
        eventsCompleted: bigint;
        totalHoursVolunteered: bigint;
        totalWasteCollected: bigint;
        achievementsUnlocked?: bigint;
        totalCoinsSpent?: bigint;
      };
      expect(userImpact.achievementsUnlocked).to.equal(1n);
    });
  });

  describe("Store Purchases", function () {
    it("Should allow spending coins", async function () {
      const { aquaCoin, owner, user1 } = await deployAquaCoinFixture();
      
      await aquaCoin.write.addAuthorizedMinter([owner.account.address]);
      
      // First give user some coins
      const eventId = keccak256(toBytes("event123"));
      await aquaCoin.write.rewardEventCompletion([
        user1.account.address,
        eventId,
        180n,
        5000n
      ]);
      
      const balanceBeforeSpend = await aquaCoin.read.balanceOf([user1.account.address]);
      const spendAmount = parseEther("100");
      const itemId = keccak256(toBytes("item123"));
      
      await aquaCoin.write.spendCoins([
        user1.account.address,
        spendAmount,
        itemId,
        "T-shirt purchase"
      ]);
      
      const balanceAfterSpend = await aquaCoin.read.balanceOf([user1.account.address]);
      expect(BigInt(balanceBeforeSpend as bigint) - BigInt(balanceAfterSpend as bigint)).to.equal(spendAmount);
      
      const userImpact = await aquaCoin.read.getUserImpact([user1.account.address]) as {
        eventsCompleted: bigint;
        totalHoursVolunteered: bigint;
        totalWasteCollected: bigint;
        achievementsUnlocked?: bigint;
        totalCoinsSpent?: bigint;
      };
      expect(userImpact.totalCoinsSpent).to.equal(spendAmount);
    });

    it("Should not allow spending more than balance", async function () {
      const { aquaCoin, owner, user1 } = await deployAquaCoinFixture();
      
      await aquaCoin.write.addAuthorizedMinter([owner.account.address]);
      
      const spendAmount = parseEther("1000");
      const itemId = keccak256(toBytes("item123"));
      
      await expect(
        aquaCoin.write.spendCoins([
          user1.account.address,
          spendAmount,
          itemId,
          "Expensive item"
        ])
      ).to.be.rejectedWith("Insufficient balance");
    });
  });

  describe("Image Upload Rewards", function () {
    it("Should reward image upload", async function () {
      const { aquaCoin, owner, user1 } = await deployAquaCoinFixture();
      
      await aquaCoin.write.addAuthorizedMinter([owner.account.address]);
      
      const eventId = keccak256(toBytes("event123"));
      const initialBalance = await aquaCoin.read.balanceOf([user1.account.address]);
      
      await aquaCoin.write.rewardImageUpload([
        user1.account.address,
        eventId
      ]);
      
      const finalBalance = await aquaCoin.read.balanceOf([user1.account.address]);
      const expectedReward = parseEther("25"); // IMAGE_UPLOAD_REWARD
      
      expect(BigInt(finalBalance as bigint) - BigInt(initialBalance as bigint)).to.equal(expectedReward);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause contract", async function () {
      const { aquaCoin } = await deployAquaCoinFixture();
      
      await aquaCoin.write.pause();
      expect(await aquaCoin.read.paused()).to.be.true;
    });

    it("Should not allow transfers when paused", async function () {
      const { aquaCoin, owner, user1 } = await deployAquaCoinFixture();
      
      await aquaCoin.write.pause();
      
      await expect(
        aquaCoin.write.transfer([user1.account.address, parseEther("100")])
      ).to.be.rejectedWith("Pausable: paused");
    });
  });
});
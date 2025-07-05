import { ethers } from "hardhat";

async function main() {
  // Replace with your target address
  const recipient = "0x5d87672eADDe14672eaBC7Fe3a5C01D15BC06338";
  const amount = ethers.parseEther("100"); // 100 ETH

  // Get first signer (default Hardhat account)
  const [sender] = await ethers.getSigners();

  console.log(`Sending 100 ETH from ${sender.address} to ${recipient}...`);

  const tx = await sender.sendTransaction({
    to: recipient,
    value: amount,
  });

  await tx.wait();

  console.log("Transaction successful:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

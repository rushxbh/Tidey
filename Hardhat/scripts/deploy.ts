import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  const myAddress = "0x54ebbDDA8046b34D635a3B2B25297B01AcED554f";
  // 1. Deploy AquaCoin
  const AquaCoin = await hre.ethers.getContractFactory("AquaCoin");
  const aquaCoin = await AquaCoin.deploy(myAddress);
  await aquaCoin.waitForDeployment();
  const aquaCoinAddress = await aquaCoin.getAddress();
  console.log(`AquaCoin deployed to: ${aquaCoinAddress}`);

  // 2. Deploy Tidey, passing AquaCoin address and owner address
  const Tidey = await hre.ethers.getContractFactory("Tidey");
  // const tidey = await Tidey.deploy(aquaCoinAddress, deployer.address);
  const tidey = await Tidey.deploy(aquaCoinAddress, myAddress);

  await tidey.waitForDeployment();
  const tideyAddress = await tidey.getAddress();
  console.log(`Tidey deployed to: ${tideyAddress}`);

  // 3. Save addresses for frontend
  const contractsDir = path.join(
    __dirname,
    "..",
    "..",
    "client",
    "src",
    "contracts"
  );
  console.log("Saving config to:", contractsDir); // Add this line
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const contractConfig = `import { Address } from 'viem';

export const AQUACOIN_ADDRESS: Address = '${aquaCoinAddress}';
export const TIDEY_ADDRESS: Address = '${tideyAddress}';

export const NETWORK_CONFIG = {
  chainId: 31337,
  name: 'Hardhat Local',
  rpcUrl: 'http://127.0.0.1:8545'
};
`;

  fs.writeFileSync(path.join(contractsDir, "config.ts"), contractConfig);

  console.log("✅ Contract addresses saved to server/src/contracts/config.ts");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

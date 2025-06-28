import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
const config = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    }, 
  },
  typechain: {
    outDir: "../src/generated", // Output to React app
    target: "ethers-v5",
  },
} as HardhatUserConfig & { typechain?: any };

export default config;

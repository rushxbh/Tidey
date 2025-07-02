import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
const config = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100, // Lower runs = smaller code, higher runs = more gas efficient
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  typechain: {
    outDir: "../client/src/generated", // Output to React app
    target: "ethers-v5",
  },
} as HardhatUserConfig & { typechain?: any };

export default config;

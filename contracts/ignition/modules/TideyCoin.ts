import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TideyCoinModule = buildModule("TideyCoinModule", (m) => {
  // Deploy AquaCoin contract
  const aquaCoin = m.contract("AquaCoin");
  
  // Deploy TideyCertificates contract
  const certificates = m.contract("TideyCertificates");

  return { aquaCoin, certificates };
});

export default TideyCoinModule;
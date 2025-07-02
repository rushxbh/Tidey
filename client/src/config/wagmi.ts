import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

const localhost = {
  id: 31337,
  name: "Localhost",
  network: "localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["http://127.0.0.1:8545"] },
    default: { http: ["http://127.0.0.1:8545"] },
  },
} as const;

export const config = getDefaultConfig({
  appName: "Tidey - Beach Cleanup Platform",
  projectId:
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
    "b7e9e68437cb29efe5dab1b0e4034fe4",
  chains: [localhost, sepolia],
  ssr: false,
});

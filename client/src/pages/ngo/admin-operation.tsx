import React, { useState } from "react";
import { useWriteContract, useReadContract } from "wagmi";
import { TIDEY_ADDRESS } from "../../contracts/config";
import { TideyABI } from "../../generated/factories/contracts/Tidey__factory";
import { NFT_ADDRESS } from "../../contracts/config";
import { TideyNFTABI as NFT_ABI } from "../../generated/factories/contracts/NFT.sol/TideyNFT__factory";
import {
  UserPlus,
  UserMinus,
  ShieldCheck,
  Shield,
  Settings,
  DollarSign,
  Link,
  Wallet,
  Play,
  Pause,
  Plus,
  Edit3,
  User,
  Package,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("user-management");

  // User Management States
  const [address, setAddress] = useState("");
  const [checkAddress, setCheckAddress] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [checking, setChecking] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // NFT Management States
  const [nftTypeId, setNftTypeId] = useState("");
  const [supply, setSupply] = useState("");
  const [price, setPrice] = useState("");
  const [treasuryAddress, setTreasuryAddress] = useState("");
  const [baseURI, setBaseURI] = useState("");
  const [nftStatus, setNftStatus] = useState(true);
  const [nftStatusMsg, setNftStatusMsg] = useState("");
  const [nftStatusType, setNftStatusType] = useState<"success" | "error" | "">(
    ""
  );

  // Contract interaction states
  const { writeContractAsync, isPending } = useWriteContract();
  const [isPaused, setIsPaused] = useState(false);

  // checkadmin stats
  const { data: adminStatus } = useReadContract({
    address: TIDEY_ADDRESS,
    abi: TideyABI,
    functionName: "getAdminStatus",
    args:
      checkAddress && /^0x[a-fA-F0-9]{40}$/.test(checkAddress)
        ? [checkAddress as `0x${string}`]
        : undefined,
  });

  // User Management Functions
  const handleAddAdmin = async () => {
    setStatusMsg("");
    setStatusType("");
    try {
      await writeContractAsync({
        address: TIDEY_ADDRESS,
        abi: TideyABI,
        functionName: "setAdminStatus",
        args: [address as `0x${string}`, true],
      });
      setStatusMsg("Admin privileges granted successfully.");
      setStatusType("success");
    } catch (err: any) {
      setStatusMsg(err?.shortMessage || err?.message || "Failed to add admin.");
      setStatusType("error");
    }
  };

  const handleRemoveAdmin = async () => {
    setStatusMsg("");
    setStatusType("");
    try {
      await writeContractAsync({
        address: TIDEY_ADDRESS,
        abi: TideyABI,
        functionName: "setAdminStatus",
        args: [address as `0x${string}`, false],
      });
      setStatusMsg("Admin privileges revoked successfully.");
      setStatusType("success");
    } catch (err: any) {
      setStatusMsg(
        err?.shortMessage || err?.message || "Failed to remove admin."
      );
      setStatusType("error");
    }
  };

  const handleCheckAdmin = () => {
    setChecking(true);
    setIsAdmin(null);
    setTimeout(() => {
      setIsAdmin(Boolean(adminStatus));
      setChecking(false);
    }, 500);
  };

  // NFT Management Functions
  const handleLaunchNFTType = async () => {
    setNftStatusMsg("");
    setNftStatusType("");
    try {
      await writeContractAsync({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: "launchNFTType",
        args: [BigInt(supply), BigInt(price)],
      });
      setNftStatusMsg("NFT type launched successfully.");
      setNftStatusType("success");
    } catch (err: any) {
      setNftStatusMsg(err?.message || "Failed to launch NFT type.");
      setNftStatusType("error");
    }
  };

  const handleUpdateNFTType = async () => {
    setNftStatusMsg("");
    setNftStatusType("");
    try {
      await writeContractAsync({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: "updateNFTType",
        args: [BigInt(nftTypeId), BigInt(supply), BigInt(price), nftStatus],
      });
      setNftStatusMsg("NFT type updated successfully.");
      setNftStatusType("success");
    } catch (err: any) {
      setNftStatusMsg(err?.message || "Failed to update NFT type.");
      setNftStatusType("error");
    }
  };

  const handleSetTreasury = async () => {
    setNftStatusMsg("");
    setNftStatusType("");
    try {
      await writeContractAsync({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: "setTreasury",
        args: [treasuryAddress as `0x${string}`],
      });
      setNftStatusMsg("Treasury address updated successfully.");
      setNftStatusType("success");
    } catch (err: any) {
      setNftStatusMsg(err?.message || "Failed to set treasury.");
      setNftStatusType("error");
    }
  };

  const handleSetBaseURI = async () => {
    setNftStatusMsg("");
    setNftStatusType("");
    try {
      await writeContractAsync({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: "setBaseURI",
        args: [baseURI],
      });
      setNftStatusMsg("Base URI updated successfully.");
      setNftStatusType("success");
    } catch (err: any) {
      setNftStatusMsg(err?.message || "Failed to set base URI.");
      setNftStatusType("error");
    }
  };

  const handleWithdrawAqua = async () => {
    setNftStatusMsg("");
    setNftStatusType("");
    try {
      await writeContractAsync({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: "withdrawAqua",
        args: [BigInt(1)], // Using 1 as a default amount or create a state for this
      });
      setNftStatusMsg("AQUA tokens withdrawn successfully.");
      setNftStatusType("success");
    } catch (err: any) {
      setNftStatusMsg(err?.message || "Failed to withdraw AQUA.");
      setNftStatusType("error");
    }
  };

  const handlePauseToggle = async () => {
    setNftStatusMsg("");
    setNftStatusType("");
    try {
      const functionName = isPaused ? "unpause" : "pause";
      await writeContractAsync({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName,
        args: [],
      });
      setIsPaused(!isPaused); // Update local state
      setNftStatusMsg(
        `Contract ${isPaused ? "unpaused" : "paused"} successfully.`
      );
      setNftStatusType("success");
    } catch (err: any) {
      setNftStatusMsg(err?.message || "Failed to toggle pause state.");
      setNftStatusType("error");
    }
  };

  const tabs = [
    { id: "user-management", label: "User Management", icon: User },
    { id: "nft-management", label: "NFT Management", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Contract Status:{" "}
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "user-management" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Admin Management Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Admin Management
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddAdmin}
                    disabled={isPending || !address}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Grant Admin
                  </button>
                  <button
                    onClick={handleRemoveAdmin}
                    disabled={isPending || !address}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Revoke Admin
                  </button>
                </div>
                {statusMsg && (
                  <div
                    className={`p-3 rounded-md text-sm ${
                      statusType === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {statusMsg}
                  </div>
                )}
              </div>
            </div>

            {/* Admin Status Check Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />
                Admin Status Check
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address to Check
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0x..."
                    value={checkAddress}
                    onChange={(e) => setCheckAddress(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleCheckAdmin}
                  disabled={!checkAddress}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Check Status
                </button>
                {checking && (
                  <div className="text-blue-600 text-sm">Checking...</div>
                )}
                {isAdmin !== null && !checking && (
                  <div
                    className={`p-3 rounded-md text-sm flex items-center ${
                      isAdmin
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {isAdmin ? (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        This address is an Admin
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        This address is NOT an Admin
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "nft-management" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NFT Type Management */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                Launch NFT Type
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supply
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1000"
                    value={supply}
                    onChange={(e) => setSupply(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (wei)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1000000000000000000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleLaunchNFTType}
                  disabled={isPending || !supply || !price}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Launch NFT Type
                </button>
              </div>
            </div>

            {/* Update NFT Type */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Edit3 className="h-5 w-5 mr-2 text-blue-600" />
                Update NFT Type
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NFT Type ID
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1"
                    value={nftTypeId}
                    onChange={(e) => setNftTypeId(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supply
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1000"
                      value={supply}
                      onChange={(e) => setSupply(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (wei)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1000000000000000000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={nftStatus}
                      onChange={(e) => setNftStatus(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Active Status
                    </span>
                  </label>
                </div>
                <button
                  onClick={handleUpdateNFTType}
                  disabled={isPending || !nftTypeId || !supply || !price}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Update NFT Type
                </button>
              </div>
            </div>

            {/* Treasury Management */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                Treasury Management
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treasury Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0x..."
                    value={treasuryAddress}
                    onChange={(e) => setTreasuryAddress(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleSetTreasury}
                  disabled={isPending || !treasuryAddress}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Set Treasury
                </button>
                <div className="pt-4 border-t">
                  <button
                    onClick={handleWithdrawAqua}
                    disabled={isPending}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Withdraw AQUA
                  </button>
                </div>
              </div>
            </div>

            {/* Contract Settings */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Contract Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URI
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://api.example.com/metadata/"
                    value={baseURI}
                    onChange={(e) => setBaseURI(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleSetBaseURI}
                  disabled={isPending || !baseURI}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Set Base URI
                </button>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Contract Status
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isPaused ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {isPaused ? "Paused" : "Active"}
                    </span>
                  </div>
                  <button
                    onClick={handlePauseToggle}
                    disabled={isPending}
                    className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                      isPaused
                        ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    }`}
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Unpause Contract
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Contract
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Status Messages for NFT Operations */}
            {nftStatusMsg && (
              <div className="lg:col-span-2">
                <div
                  className={`p-4 rounded-md text-sm ${
                    nftStatusType === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {nftStatusMsg}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

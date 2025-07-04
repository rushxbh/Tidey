import React, { useState } from "react";
import { UserPlus, UserMinus, ShieldCheck, Shield } from "lucide-react";
import { useWriteContract, useReadContract } from "wagmi";
import { TIDEY_ADDRESS } from "../../contracts/config";
import { TideyABI } from "../../generated/factories/contracts/Tidey__factory";

const AdminOperation: React.FC = () => {
  const [address, setAddress] = useState("");
  const [checkAddress, setCheckAddress] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [checking, setChecking] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const { writeContractAsync, isPending } = useWriteContract();
  const { data: adminStatus } = useReadContract({
    address: TIDEY_ADDRESS,
    abi: TideyABI,
    functionName: "getAdminStatus",
    args:
      checkAddress && /^0x[a-fA-F0-9]{40}$/.test(checkAddress)
        ? [checkAddress as `0x${string}`]
        : undefined,
  });

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShieldCheck className="text-primary-600" /> Admin Operations
        </h2>
        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">
            Admin Address
          </label>
          <input
            type="text"
            className="input-field w-full mb-3"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={handleAddAdmin}
              disabled={isPending || !address}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" /> Grant Admin
            </button>
            <button
              onClick={handleRemoveAdmin}
              disabled={isPending || !address}
              className="btn-secondary flex items-center gap-2"
            >
              <UserMinus className="h-4 w-4" /> Revoke Admin
            </button>
          </div>
          {statusMsg && (
            <div
              className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
                statusType === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {statusMsg}
            </div>
          )}
        </div>
        <div className="border-t pt-6 mt-6">
          <label className="block text-gray-700 font-medium mb-2">
            Check Admin Status
          </label>
          <input
            type="text"
            className="input-field w-full mb-3"
            placeholder="0x..."
            value={checkAddress}
            onChange={(e) => setCheckAddress(e.target.value)}
          />
          <button
            onClick={handleCheckAdmin}
            disabled={!checkAddress}
            className="btn-primary flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" /> Check Status
          </button>
          {checking && <div className="mt-3 text-blue-600">Checking...</div>}
          {isAdmin !== null && !checking && (
            <div
              className={`mt-4 flex items-center gap-2 font-medium ${
                isAdmin ? "text-green-700" : "text-red-700"
              }`}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="h-5 w-5" /> This address is an Admin.
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" /> This address is NOT an Admin.
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOperation;

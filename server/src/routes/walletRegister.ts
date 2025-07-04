import express from "express";
import User from "../models/User";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Debug/test route to verify router is loaded
router.get("/test", (req, res) => {
  res.json({ success: true, message: "walletRegister router is working" });
});

// Check if wallet is registered
router.get(
  "/check-wallet/:walletAddress",
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const { walletAddress } = req.params;

    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Wallet address not registered",
      });
    }

    res.json({
      success: true,
      message: "Wallet address is registered",
      user,
    });
  })
);

// Register wallet
router.post(
  "/register-wallet", // VERIFY THIS ROUTE
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const { walletAddress } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { walletAddress },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Wallet registered successfully",
      user,
    });
  })
);
router.get(
  "/is-wallet-empty/:userId",
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const { userId } = req.params;
    console.log(`[is-wallet-empty] Checking wallet for userId: ${userId}`);

    const user = await User.findById(userId);

    if (!user) {
      console.log(`[is-wallet-empty] User not found for userId: ${userId}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(`[is-wallet-empty] Found user:`, {
      userId: user._id,
      walletAddress: user.walletAddress,
    });

    const isEmpty = !user.walletAddress?.trim();
    console.log(`[is-wallet-empty] isEmpty: ${isEmpty}`);

    res.json({
      success: true,
      isEmpty,
      userId,
    });
  })
);
export default router;

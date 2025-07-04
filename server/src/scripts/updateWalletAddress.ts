import mongoose from "mongoose";
import User from "../models/User"; // Adjust the path if necessary

async function updateWalletAddressField() {
  try {
    await mongoose.connect("your_mongo_connection_string"); // Replace with your connection string

    // Update all documents to include walletAddress with default value
    await User.updateMany({}, { $set: { walletAddress: "" } });

    console.log("WalletAddress field updated for all documents.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error updating walletAddress field:", error);
  }
}

updateWalletAddressField();

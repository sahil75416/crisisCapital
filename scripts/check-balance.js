const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Checking wallet balance on Base Sepolia...");
  
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found in .env file");
    console.log("📝 Please add your private key to .env file:");
    console.log("PRIVATE_KEY=your_private_key_here");
    process.exit(1);
  }

  try {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const connectedWallet = wallet.connect(provider);
    
    const address = await connectedWallet.getAddress();
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log("👤 Wallet address:", address);
    console.log("💰 Balance:", balanceInEth, "ETH");
    
    if (balanceInEth === "0.0") {
      console.log("");
      console.log("❌ No ETH found! You need testnet ETH to deploy the contract.");
      console.log("");
      console.log("🔗 Get free testnet ETH from:");
      console.log("1. https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
      console.log("2. https://sepoliafaucet.com/");
      console.log("3. https://faucet.sepolia.dev/");
      console.log("");
      console.log("📋 Steps:");
      console.log("1. Copy your address:", address);
      console.log("2. Paste it in one of the faucets above");
      console.log("3. Request testnet ETH (usually 0.01-0.1 ETH)");
      console.log("4. Wait a few minutes for the transaction to confirm");
      console.log("5. Run this script again to check your balance");
    } else {
      console.log("");
      console.log("✅ You have ETH! Ready to deploy the contract.");
      console.log("🚀 Run: npx hardhat run scripts/deploy.js --network baseSepolia");
    }
    
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


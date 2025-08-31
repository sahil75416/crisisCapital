const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CrisisDEX...");
  
  // Check if private key is configured
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found in .env file");
    console.log("📝 Please add your private key to .env file:");
    console.log("PRIVATE_KEY=your_private_key_here");
    console.log("");
    console.log("🔑 To get your private key:");
    console.log("1. Open Coinbase Wallet");
    console.log("2. Go to Settings (gear icon)");
    console.log("3. Click 'Show Private Key'");
    console.log("4. Enter your password");
    console.log("5. Copy the private key (starts with 0x...)");
    process.exit(1);
  }

  // Check if RPC URL is configured
  if (!process.env.BASE_SEPOLIA_RPC) {
    console.error("❌ BASE_SEPOLIA_RPC not found in .env file");
    console.log("📝 Please add to .env file:");
    console.log("BASE_SEPOLIA_RPC=https://sepolia.base.org");
    process.exit(1);
  }

  try {
    console.log("📋 Using RPC:", process.env.BASE_SEPOLIA_RPC);
    console.log("👤 Deploying from address:", process.env.PRIVATE_KEY ? 
      new ethers.Wallet(process.env.PRIVATE_KEY).address : "Not configured");
    
    const CrisisDEX = await ethers.getContractFactory("CrisisDEX");
    const dex = await CrisisDEX.deploy();
    
    console.log("⏳ Waiting for deployment...");
    await dex.waitForDeployment();
    const address = await dex.getAddress();
    
    console.log("✅ CrisisDEX deployed to:", address);
    console.log("🌐 View on Base Sepolia Explorer:");
    console.log(`https://sepolia.basescan.org/address/${address}`);
    
    // Save the address to a file for easy access
    const fs = require('fs');
    const deploymentInfo = {
      contract: "CrisisDEX",
      address: address,
      network: "Base Sepolia",
      deployer: new ethers.Wallet(process.env.PRIVATE_KEY).address,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved to deployment.json");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("");
      console.log("💰 You need Base Sepolia testnet ETH");
      console.log("🔗 Get free testnet ETH from:");
      console.log("https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    }
    
    if (error.message.includes("nonce")) {
      console.log("");
      console.log("🔄 Try again in a few seconds");
    }
    
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
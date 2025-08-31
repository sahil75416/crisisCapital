const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🚀 Deploying Snap_Stake to Base Sepolia...");
  
  // Check environment
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found in .env file");
    process.exit(1);
  }

  try {
    // Get deployer info
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying from:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther('0.001')) {
      console.log("⚠️  Low balance! Get testnet ETH from:");
      console.log("🔗 https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    }
    
    // Deploy SnapStake contract
    console.log("📦 Deploying SnapStake contract...");
    const SnapStake = await ethers.getContractFactory("SnapStake");
    const snapStake = await SnapStake.deploy();
    
    console.log("⏳ Waiting for deployment confirmation...");
    await snapStake.waitForDeployment();
    
    const contractAddress = await snapStake.getAddress();
    console.log("✅ SnapStake deployed to:", contractAddress);
    console.log("🌐 View on Base Sepolia:", `https://sepolia.basescan.org/address/${contractAddress}`);
    
    // Test contract functions
    console.log("🧪 Testing contract...");
    const name = await snapStake.name();
    const symbol = await snapStake.symbol();
    const totalSupply = await snapStake.totalSupply();
    const marketCount = await snapStake.marketCount();
    
    console.log(`📊 Contract Info:`);
    console.log(`   Token: ${name} (${symbol})`);
    console.log(`   Supply: ${ethers.formatEther(totalSupply)} SNAP`);
    console.log(`   Markets: ${marketCount}`);
    
    // Create a test market
    console.log("🎯 Creating test market...");
    const tx = await snapStake.createMarket(
      "Test Delivery Delay - Downtown SF",
      0, // DELIVERY type
      "mock-api",
      75 // 75% confidence
    );
    await tx.wait();
    console.log("✅ Test market created");
    
    // Save deployment info
    const deploymentInfo = {
      network: "Base Sepolia",
      chainId: 84532,
      contractAddress: contractAddress,
      deployedAt: new Date().toISOString(),
      deployer: deployer.address,
      txHash: snapStake.deploymentTransaction()?.hash,
      contractInfo: {
        name: name,
        symbol: symbol,
        totalSupply: ethers.formatEther(totalSupply),
        marketCount: (await snapStake.marketCount()).toString()
      }
    };
    
    fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved to deployment.json");
    
    // Update frontend contract address
    const hookPath = './frontend/src/hooks/useCrisisDEX.ts';
    if (fs.existsSync(hookPath)) {
      let hookContent = fs.readFileSync(hookPath, 'utf8');
      hookContent = hookContent.replace(
        /const CONTRACT_ADDRESS = "[^"]*"/,
        `const CONTRACT_ADDRESS = "${contractAddress}"`
      );
      fs.writeFileSync(hookPath, hookContent);
      console.log("🔄 Updated frontend contract address");
    }
    
    // Update mobile app config
    const mobileConfigPath = './mobile/src/config/contracts.ts';
    const mobileConfig = `export const CONTRACTS = {
  SNAPSTAKE: {
    address: "${contractAddress}",
    network: "Base Sepolia",
    chainId: 84532
  }
};

export const API_BASE_URL = "http://localhost:8000";
export const PAYMENT_ADDRESS = "${process.env.PAYMENT_ADDRESS}";
`;
    
    fs.mkdirSync('./mobile/src/config', { recursive: true });
    fs.writeFileSync(mobileConfigPath, mobileConfig);
    console.log("📱 Updated mobile app config");
    
    return contractAddress;
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("💰 Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    }
    
    throw error;
  }
}

main()
  .then((address) => {
    console.log(`\n🎉 Snap_Stake Deployment Complete!`);
    console.log(`📍 Contract: ${address}`);
    console.log(`\n📝 Next Steps:`);
    console.log(`1. cd backend && python -m uvicorn main:app --reload`);
    console.log(`2. cd mobile && expo start`);
    console.log(`3. Connect wallet and test micro-risk markets!`);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

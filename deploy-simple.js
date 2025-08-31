const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CrisisDEX to Base Sepolia...");
  
  // Get the contract factory
  const CrisisDEX = await ethers.getContractFactory("CrisisDEX");
  
  // Deploy the contract
  console.log("📦 Deploying contract...");
  const dex = await CrisisDEX.deploy();
  
  // Wait for deployment
  console.log("⏳ Waiting for deployment confirmation...");
  await dex.waitForDeployment();
  
  const address = await dex.getAddress();
  console.log("✅ CrisisDEX deployed to:", address);
  console.log("🌐 View on Base Sepolia Explorer:");
  console.log(`https://sepolia.basescan.org/address/${address}`);
  
  // Test the contract
  console.log("🧪 Testing contract...");
  const name = await dex.name();
  const symbol = await dex.symbol();
  const totalSupply = await dex.totalSupply();
  
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Total Supply: ${ethers.formatEther(totalSupply)} CRISYS`);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: address,
    network: "Base Sepolia",
    chainId: 84532,
    deployedAt: new Date().toISOString(),
    contractName: "CrisisDEX",
    tokenName: name,
    tokenSymbol: symbol,
    totalSupply: ethers.formatEther(totalSupply)
  };
  
  require('fs').writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to deployment.json");
  
  return address;
}

main()
  .then((address) => {
    console.log(`\n🎉 Deployment successful!`);
    console.log(`Contract Address: ${address}`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Update frontend/src/hooks/useCrisisDEX.ts with the contract address`);
    console.log(`2. Start the frontend: cd frontend && npm run dev`);
    console.log(`3. Connect your wallet and start hedging!`);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  });

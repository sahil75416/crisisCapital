require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// Contract ABI and bytecode from the compiled artifacts
const contractArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/CrisisDEX.sol/CrisisDEX.json', 'utf8'));

async function deployContract() {
    try {
        console.log('🚀 Starting deployment to Base Sepolia...');
        
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log('📡 Connected to Base Sepolia');
        console.log('👤 Deploying from:', wallet.address);
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
        
        if (balance < ethers.parseEther('0.001')) {
            console.log('⚠️  Low balance! Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
        }
        
        // Create contract factory
        const contractFactory = new ethers.ContractFactory(
            contractArtifact.abi,
            contractArtifact.bytecode,
            wallet
        );
        
        // Deploy contract
        console.log('📦 Deploying CrisisDEX contract...');
        const contract = await contractFactory.deploy();
        
        console.log('⏳ Waiting for deployment confirmation...');
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        console.log('✅ Contract deployed successfully!');
        console.log('📍 Contract Address:', contractAddress);
        console.log('🌐 View on Base Sepolia:', `https://sepolia.basescan.org/address/${contractAddress}`);
        
        // Test contract
        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        
        console.log('🧪 Contract verification:');
        console.log('   Name:', name);
        console.log('   Symbol:', symbol);
        console.log('   Total Supply:', ethers.formatEther(totalSupply), 'CRISYS');
        
        // Save deployment info
        const deploymentInfo = {
            contractAddress: contractAddress,
            network: 'Base Sepolia',
            chainId: 84532,
            deployedAt: new Date().toISOString(),
            deployer: wallet.address,
            txHash: contract.deploymentTransaction()?.hash,
            gasUsed: contract.deploymentTransaction()?.gasLimit?.toString()
        };
        
        fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('📄 Deployment info saved to deployment.json');
        
        // Update frontend contract address
        const hookPath = './frontend/src/hooks/useCrisisDEX.ts';
        let hookContent = fs.readFileSync(hookPath, 'utf8');
        hookContent = hookContent.replace(
            /const CONTRACT_ADDRESS = "[^"]*"/,
            `const CONTRACT_ADDRESS = "${contractAddress}"`
        );
        fs.writeFileSync(hookPath, hookContent);
        console.log('🔄 Updated frontend contract address');
        
        return contractAddress;
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        
        if (error.message.includes('insufficient funds')) {
            console.log('💰 Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
        }
        
        throw error;
    }
}

// Run deployment
deployContract()
    .then((address) => {
        console.log('\n🎉 Deployment Complete!');
        console.log('📍 Contract Address:', address);
        console.log('\n📝 Next Steps:');
        console.log('1. cd frontend');
        console.log('2. npm run dev');
        console.log('3. Connect your Coinbase Wallet');
        console.log('4. Switch to Base Sepolia network');
        console.log('5. Start hedging!');
    })
    .catch((error) => {
        console.error('Deployment failed:', error);
        process.exit(1);
    });

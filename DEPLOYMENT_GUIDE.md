# 🚀 CrisisCapital Deployment Guide

Complete guide to deploy your CrisisCapital platform on Base Sepolia testnet.

## 📋 Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask or Coinbase Wallet
- Base Sepolia testnet ETH (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))

## 🔧 Environment Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd crisiscapital

# Install dependencies
npm install
cd frontend && npm install && cd ..
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Required Environment Variables:**

```env
# Network Configuration
NETWORK=baseSepolia
RPC_URL=https://sepolia.base.org
CHAIN_ID=84532

# Wallet Configuration
PRIVATE_KEY=your_private_key_here
PAYMENT_ADDRESS=your_payment_address_here

# API Configuration
PORT=3001
CORS_ORIGIN=http://localhost:3000

# AI Services (optional)
OPENAI_API_KEY=your_openai_key_here
WEATHER_API_KEY=your_weather_key_here
```

## 🏗️ Smart Contract Deployment

### 1. Compile Contracts

```bash
# Compile all contracts
npm run compile

# Verify compilation
npx hardhat verify --help
```

### 2. Deploy to Base Sepolia

```bash
# Deploy contracts
npm run deploy:base

# Save the deployed contract addresses
# CrisisDEX: 0x...
# Update frontend/src/hooks/useCrisisDEX.ts with the new address
```

### 3. Verify Contracts

```bash
# Verify on Base Sepolia explorer
npm run verify --network baseSepolia

# Example verification command
npx hardhat verify --network baseSepolia 0xYOUR_CONTRACT_ADDRESS
```

## 🎨 Frontend Deployment

### 1. Update Contract Address

```typescript
// frontend/src/hooks/useCrisisDEX.ts
const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 2. Build for Production

```bash
cd frontend

# Build the app
npm run build

# Test the build locally
npx serve -s build
```

### 3. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set build command: npm run build
# - Set output directory: build
# - Set environment variables
```

### 4. Alternative: Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

## 🔌 Backend API Deployment

### 1. Local Development

```bash
# Start API server
npm run api:dev

# Test endpoints
curl http://localhost:3001/health
```

### 2. Production Deployment

#### Option A: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option B: Render

```bash
# Create render.yaml
services:
  - type: web
    name: crisiscapital-api
    env: node
    buildCommand: npm install
    startCommand: npm run api
    envVars:
      - key: NODE_ENV
        value: production
```

#### Option C: Heroku

```bash
# Install Heroku CLI
# Create Procfile
echo "web: npm run api" > Procfile

# Deploy
heroku create
git push heroku main
```

## 🌐 Domain and SSL

### 1. Custom Domain

```bash
# Add custom domain in your hosting platform
# Example: app.crisiscapital.com

# Update CORS settings in backend
CORS_ORIGIN=https://app.crisiscapital.com
```

### 2. SSL Certificate

- **Vercel/Netlify**: Automatic SSL
- **Custom hosting**: Use Let's Encrypt
- **Load balancer**: Configure SSL termination

## 🔐 Security Configuration

### 1. Environment Variables

```bash
# Never commit .env files
echo ".env" >> .gitignore
echo "*.env.local" >> .gitignore
```

### 2. API Security

```typescript
// api/server.ts
app.use(helmet()); // Security headers
app.use(rateLimit()); // Rate limiting
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

### 3. Smart Contract Security

```solidity
// CrisisDEX.sol
// Access control
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
}

// Emergency functions
function emergencyPause() external onlyOwner {
    _pause();
}
```

## 📊 Monitoring and Analytics

### 1. Health Checks

```typescript
// api/server.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

### 2. Logging

```typescript
// api/server.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 3. Performance Monitoring

```bash
# Install monitoring tools
npm install --save-dev @types/express-rate-limit
npm install --save-dev compression

# Enable compression
app.use(compression());
```

## 🧪 Testing Deployment

### 1. Contract Testing

```bash
# Run all tests
npm test

# Test specific contract
npx hardhat test test/CrisisDEX.test.js

# Gas optimization
npx hardhat test --gas-report
```

### 2. Frontend Testing

```bash
cd frontend

# Run tests
npm test

# E2E testing (if configured)
npm run test:e2e
```

### 3. Integration Testing

```bash
# Test API endpoints
npm run test:integration

# Test wallet connection
npm run test:wallet
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Contract Deployment Fails

```bash
# Check network configuration
npx hardhat console --network baseSepolia

# Verify RPC URL
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://sepolia.base.org
```

#### 2. Frontend Build Fails

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit
```

#### 3. API Connection Issues

```bash
# Check CORS settings
# Verify environment variables
# Check network connectivity
```

### Debug Commands

```bash
# Hardhat debugging
npx hardhat console --network baseSepolia

# Contract interaction
const contract = await ethers.getContract("CrisisDEX");
await contract.marketCount();

# Network info
const provider = ethers.provider;
await provider.getNetwork();
```

## 📈 Performance Optimization

### 1. Frontend

```bash
# Bundle analysis
npm run build --analyze

# Code splitting
# Lazy load components
# Optimize images
```

### 2. Smart Contracts

```solidity
// Gas optimization
// Use events instead of storage
// Batch operations
// Optimize loops
```

### 3. API

```typescript
// Caching
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Rate limiting
import rateLimit from 'express-rate-limit';
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy CrisisCapital

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - run: npm run deploy:base
```

## 📚 Additional Resources

- [Base Documentation](https://docs.base.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 🎯 Next Steps

1. **Deploy contracts** to Base Sepolia
2. **Update frontend** with contract addresses
3. **Deploy frontend** to Vercel/Netlify
4. **Deploy API** to Railway/Render
5. **Test thoroughly** on testnet
6. **Prepare for mainnet** deployment

---

**Need help?** Join our [Discord](https://discord.gg/crisiscapital) or open an issue on GitHub.

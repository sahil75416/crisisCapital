# 🚀 Quick Start Guide - Snap_Stake

## Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- Git
- MetaMask or Coinbase Wallet

## 1. Environment Setup

Create `.env` file:
```bash
copy .env.example .env
```

Add your private key to `.env`:
```
PRIVATE_KEY=your_wallet_private_key_here
BASE_SEPOLIA_RPC=https://sepolia.base.org
PAYMENT_ADDRESS=your_wallet_address_here
```

## 2. Install Dependencies

### Root Project
```bash
npm install
```

### Backend
```bash
cd backend
pip install fastapi uvicorn python-dotenv web3 httpx pydantic
```

### Mobile App
```bash
cd mobile
npm install
npx expo install
```

## 3. Start Services

### Terminal 1 - Backend API
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### Terminal 2 - Mobile App
```bash
cd mobile
npx expo start
```

### Terminal 3 - Deploy Contract (Optional)
```bash
npx hardhat run scripts/deploy-snapstake.js --network baseSepolia
```

## 4. Test the Platform

1. **Backend API**: Visit http://localhost:8000/docs
2. **Mobile App**: Scan QR code with Expo Go app
3. **Widget**: Open `widgets/checkout-widget.html` in browser

## 5. Demo Flow

1. Connect wallet in mobile app
2. View live disruption alerts on Home screen
3. Navigate to Markets to see all active markets
4. Use Trade screen to place predictions
5. Check Profile for positions and history

## Troubleshooting

### Python Issues
```bash
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Node.js Issues
```bash
npm cache clean --force
npm install
```

### Expo Issues
```bash
npm install -g @expo/cli
npx expo doctor
```

## API Endpoints

- **Predictions**: http://localhost:8000/api/v1/predictions
- **Markets**: http://localhost:8000/api/v1/markets
- **Trades**: http://localhost:8000/api/v1/trades

## Contract Addresses

- **Test Address**: 0x742d35Cc6634C0532925a3b8d49D1dFA1aCdE9fE
- **Network**: Base Sepolia (Chain ID: 84532)

Ready to start trading micro-risk markets! 🎯

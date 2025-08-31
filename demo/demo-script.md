# 🎯 Snap_Stake Demo Script

## Demo Flow (5 minutes)

### 1. Platform Overview (30 seconds)
- **Problem**: Everyday disruptions waste time and money
- **Solution**: Tradeable micro-risk markets with 10-30 min resolution
- **Value**: Hedge against delays, earn from predictions, shared intelligence

### 2. Live Scenario Demo (2 minutes)

**Scenario**: DoorDash delivery in downtown SF during rush hour

```
🍕 Order placed: 6:30 PM
📍 Location: Downtown SF (high traffic)
⏰ Estimated delivery: 7:00 PM
🎯 Risk probability: 78% chance of 15+ min delay
```

**Show live market**:
- YES (delay): $0.78 per share
- NO (on-time): $0.22 per share
- 47 participants, $1,250 volume
- Real-time price updates

### 3. Wallet Integration (1 minute)
- Connect Coinbase Wallet
- Show balance and network (Base Sepolia)
- Demonstrate x402 micropayment headers (1¢ per API call)

### 4. Trading Demo (1 minute)
- Select "YES" prediction (delay will occur)
- Enter 0.05 ETH stake
- Execute trade through smart contract
- Show position in portfolio

### 5. Resolution & Payout (30 seconds)
- Oracle confirms: Delivery delayed by 18 minutes
- Market resolves: YES wins
- Automatic payout: 0.05 ETH → 0.21 ETH (4.2x return)

## Key Talking Points

### Technical Innovation
- **Zero-counterparty insurance** via AMM liquidity pools
- **Real-time oracles** with 10-30 min resolution times
- **Cross-platform data fusion** (DoorDash, GTFS, FlightAware, NOAA)
- **Embedded widgets** for consumer protection

### Business Model
- **Platform fees**: 2% on winning trades
- **Oracle rewards**: 1% for data providers
- **Micropayments**: 1¢ per API call via x402 headers
- **B2B widgets**: Embedded checkout protection

### Market Opportunity
- **$50B+ annual disruption costs** in delivery/transit alone
- **Growing gig economy** needs better risk management
- **Insurance market** ready for Web3 innovation

## Demo Commands

### Start Backend
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### Start Mobile App
```bash
cd mobile
expo start
```

### Deploy Contract (if needed)
```bash
npx hardhat run scripts/deploy-snapstake.js --network baseSepolia
```

### Test Widget
```bash
# Open widgets/checkout-widget.html in browser
# Connect wallet and test hedge functionality
```

## Demo Data

### Live Market Updates
- Price movements every 30 seconds
- New trades from simulated users
- Risk probability adjustments based on real-time data

### Example Outcomes
1. **Delivery Delay**: 78% → Resolved YES (18 min delay)
2. **Subway Delay**: 82% → Resolved YES (12 min delay)  
3. **Flight Delay**: 65% → Resolved NO (on-time departure)

## Backup Scenarios

If live demo fails:
1. **Screenshots**: Pre-captured mobile app flows
2. **Video**: 2-minute walkthrough recording
3. **Static demo**: HTML widget with mock interactions

## Q&A Prep

**Q: How do you ensure oracle accuracy?**
A: Multi-source data validation, reputation scoring, and economic incentives

**Q: What prevents market manipulation?**
A: Short resolution times, real-world outcomes, and AMM price discovery

**Q: How does this scale globally?**
A: Modular oracle system, standardized disruption types, and local data partners

**Q: What's the regulatory approach?**
A: Prediction markets framework, not insurance products, with geographic compliance

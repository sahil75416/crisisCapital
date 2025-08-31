# Coinbase Wallet Integration Setup

This guide explains how to set up and use Coinbase Wallet with the CrisisCapital application.

## Overview

CrisisCapital has been updated to use Coinbase Wallet instead of MetaMask. The application now:
- Automatically detects Coinbase Wallet when installed
- Falls back to other injected wallets (like MetaMask) if Coinbase Wallet is not available
- Provides a user-friendly installation guide for users without any wallet

## Features

### 🎯 Priority Wallet Detection
- **Coinbase Wallet** (Primary) - Detected via `window.coinbaseWalletExtension`
- **MetaMask/Other** (Fallback) - Detected via `window.ethereum`
- **No Wallet** - Shows installation guide

### 🔗 Smart Connection
- Automatically connects to the best available wallet
- Handles account changes and chain switching
- Provides clear feedback on connection status

### 📱 User Experience
- Clear wallet type identification
- Installation guide for new users
- Responsive design for all devices

## Installation

### For Users

1. **Install Coinbase Wallet Extension**
   - [Chrome Web Store](https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad)
   - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/coinbase-wallet/)

2. **Set Up Your Wallet**
   - Create a new wallet or import existing one
   - Ensure you have some ETH for gas fees

3. **Connect to CrisisCapital**
   - Visit the application
   - Click "Connect Coinbase Wallet"
   - Approve the connection in your wallet

### For Developers

The integration is built using:

```typescript
// Wallet detection and management
import { useWallet } from "./hooks/useWallet";

// Wallet connection component
import WalletConnect from "./components/WalletConnect";

// Installation guide for new users
import WalletInstallGuide from "./components/WalletInstallGuide";
```

## Technical Implementation

### Wallet Detection Logic

```typescript
// Priority order for wallet detection
if (window.coinbaseWalletExtension) {
  // Use Coinbase Wallet
} else if (window.ethereum) {
  // Use injected wallet (MetaMask, etc.)
} else {
  // Show installation guide
}
```

### Provider Management

- Uses `ethers.BrowserProvider` for consistent interface
- Handles both Coinbase Wallet and MetaMask providers
- Maintains compatibility with existing contract interactions

### Event Handling

- Listens for account changes
- Handles chain switching
- Provides proper cleanup on component unmount

## Benefits of Coinbase Wallet

### ✅ Security
- Hardware wallet support
- Multi-signature capabilities
- Secure key management

### ✅ User Experience
- Intuitive interface
- Mobile app integration
- Built-in DEX support

### ✅ Integration
- Seamless with Coinbase exchange
- Multi-chain support
- Developer-friendly APIs

## Troubleshooting

### Common Issues

1. **Wallet Not Detected**
   - Ensure Coinbase Wallet extension is installed
   - Refresh the page after installation
   - Check browser console for errors

2. **Connection Failed**
   - Verify wallet is unlocked
   - Check if you're on the correct network
   - Try disconnecting and reconnecting

3. **Transaction Errors**
   - Ensure sufficient ETH for gas fees
   - Check network compatibility
   - Verify contract addresses

### Debug Information

Enable console logging to see wallet detection:
```typescript
// Add to useWallet hook for debugging
console.log("Wallet detection:", {
  coinbase: !!window.coinbaseWalletExtension,
  ethereum: !!window.ethereum,
  provider: provider?.constructor.name
});
```

## Migration from MetaMask

If you're migrating from MetaMask:

1. **Install Coinbase Wallet** (see installation steps above)
2. **Import your existing wallet** using seed phrase or private key
3. **Connect to CrisisCapital** using Coinbase Wallet
4. **Verify your assets** are visible in the new wallet

## Support

For technical issues or questions:
- Check the browser console for error messages
- Verify wallet extension is up to date
- Ensure you're using a supported browser (Chrome, Firefox, Edge)

---

**Note**: This integration maintains backward compatibility with MetaMask and other injected wallets while prioritizing Coinbase Wallet for the best user experience.

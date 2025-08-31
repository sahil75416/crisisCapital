import React, { useState } from "react";
import { ethers } from "ethers";

interface WalletConnectProps {
  provider: ethers.BrowserProvider | null;
  account: string | null;
  onAccountChange: () => void;
  walletType?: string;
  disconnect?: () => Promise<void>; // Updated to async function
}

const WalletConnect: React.FC<WalletConnectProps> = ({ 
  provider, 
  account, 
  onAccountChange, 
  walletType = "Wallet",
  disconnect: disconnectProp
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Debug wallet availability on component mount
  React.useEffect(() => {
    console.log("🔍 WalletConnect Debug - Component mounted");
    console.log("Available wallet objects:", {
      ethereum: !!(window as any).ethereum,
      coinbaseWalletExtension: !!(window as any).coinbaseWalletExtension,
      isCoinbaseWallet: !!(window as any).ethereum?.isCoinbaseWallet,
      isMetaMask: !!(window as any).ethereum?.isMetaMask,
      providers: (window as any).ethereum?.providers?.length || 0
    });
  }, []);

  const connect = async () => {
    if (!provider) {
      console.error("No provider available");
      return;
    }
    
    try {
      setIsConnecting(true);
      console.log("🔌 WalletConnect: Attempting connection...");
      
      // Enhanced wallet provider detection - same logic as useWallet hook
      let walletProvider = null;
      
      console.log("🔍 WalletConnect: Debugging wallet detection:");
      console.log("provider:", provider);
      console.log("provider.provider:", (provider as any).provider);
      console.log("window.coinbaseWalletExtension:", (window as any).coinbaseWalletExtension);
      console.log("window.ethereum:", (window as any).ethereum);
      console.log("window.ethereum?.isCoinbaseWallet:", (window as any).ethereum?.isCoinbaseWallet);
      console.log("window.ethereum?.providers:", (window as any).ethereum?.providers);
      
      // Method 1: Check provider.provider first
      if ((provider as any).provider && (provider as any).provider.request) {
        console.log("✅ Method 1: Using provider.provider");
        walletProvider = (provider as any).provider;
      }
      // Method 2: Check for Coinbase Wallet Extension
      else if ((window as any).coinbaseWalletExtension) {
        console.log("✅ Method 2: Using window.coinbaseWalletExtension");
        walletProvider = (window as any).coinbaseWalletExtension;
      }
      // Method 3: Check for Coinbase Wallet via ethereum.isCoinbaseWallet
      else if ((window as any).ethereum?.isCoinbaseWallet) {
        console.log("✅ Method 3: Using window.ethereum (Coinbase)");
        walletProvider = (window as any).ethereum;
      }
      // Method 4: Check for Coinbase in providers array
      else if ((window as any).ethereum?.providers) {
        const providers = (window as any).ethereum.providers;
        const coinbaseProvider = providers.find((p: any) => p.isCoinbaseWallet);
        if (coinbaseProvider) {
          console.log("✅ Method 4: Found Coinbase in providers array");
          walletProvider = coinbaseProvider;
        }
      }
      // Method 5: Fallback to any ethereum provider
      else if ((window as any).ethereum) {
        console.log("✅ Method 5: Using generic window.ethereum");
        walletProvider = (window as any).ethereum;
      }
      
      // If still no provider found, try direct window access as last resort
      if (!walletProvider) {
        console.log("🔄 No provider found through normal methods, trying direct access...");
        
        // Wait a bit and try again in case wallet is still loading
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if ((window as any).ethereum) {
          console.log("✅ Found ethereum provider after delay");
          walletProvider = (window as any).ethereum;
        } else {
          console.error("❌ No wallet provider found at all");
          console.error("Available window objects:", Object.keys(window));
          alert("No wallet detected. Please install Coinbase Wallet or MetaMask, refresh the page, and try again.");
          return;
        }
      }
      
      if (!walletProvider.request) {
        console.error("❌ Wallet provider has no request method");
        console.error("Provider object:", walletProvider);
        alert("Wallet provider is invalid. Please try refreshing the page or reinstalling your wallet.");
        return;
      }
      
      console.log("📱 Requesting accounts from wallet...");
      const accounts = await walletProvider.request({
        method: "eth_requestAccounts",
      }) as string[];
      
      console.log("📱 Received accounts:", accounts);
      
      if (accounts.length > 0) {
        console.log("✅ Connection successful, triggering account change");
        onAccountChange();
      } else {
        console.error("❌ No accounts returned");
        alert("No accounts found. Please ensure your wallet is unlocked and has at least one account.");
      }
    } catch (error: any) {
      console.error("❌ Failed to connect wallet:", error);
      
      if (error.code === 4001) {
        alert("Connection rejected by user");
      } else if (error.code === -32002) {
        alert("Connection request already pending. Please check your wallet.");
      } else {
        alert(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      if (disconnectProp) {
        await disconnectProp();
      } else {
        onAccountChange();
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  if (account) {
    return (
      <div className="wallet-connect">
        <div className="wallet-info">
          <span>✅ Connected to {walletType}</span>
          <span className="wallet-address">
            {account.slice(0, 6)}…{account.slice(-4)}
          </span>
        </div>
        <button className="btn btn-secondary" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  // Manual wallet test function
  const testWalletAccess = () => {
    console.log("🧪 Manual wallet test:");
    console.log("window.ethereum:", (window as any).ethereum);
    console.log("window.coinbaseWalletExtension:", (window as any).coinbaseWalletExtension);
    
    if ((window as any).ethereum) {
      console.log("✅ Ethereum provider available");
      console.log("Has request method:", typeof (window as any).ethereum.request === 'function');
      console.log("Is Coinbase:", (window as any).ethereum.isCoinbaseWallet);
      console.log("Is MetaMask:", (window as any).ethereum.isMetaMask);
    } else {
      console.log("❌ No ethereum provider");
    }
  };

  return (
    <div className="wallet-connect">
      <button 
        className="btn" 
        onClick={connect}
        disabled={isConnecting || !provider}
      >
        {isConnecting ? "Connecting..." : `Connect ${walletType}`}
      </button>
      
      {/* Debug button - remove in production */}
      <button 
        className="btn btn-secondary" 
        onClick={testWalletAccess}
        style={{ marginLeft: '10px', fontSize: '12px' }}
      >
        🧪 Test Wallet
      </button>
    </div>
  );
};

export default WalletConnect;
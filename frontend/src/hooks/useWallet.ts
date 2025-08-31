import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";

// Blockchain network configurations
export interface NetworkConfig {
  chainId: string;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  icon?: string;
  description?: string;
}

// Expanded supported networks configuration
export const SUPPORTED_NETWORKS: { [key: string]: NetworkConfig } = {
  // Base Sepolia (Testnet) - Recommended for testing
  "0x14a33": {
    chainId: "0x14a33",
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    currency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    },
    isTestnet: true,
    icon: "",
    description: "Coinbase's L2 testnet"
  },
  
  // Base Mainnet
  "0x2105": {
    chainId: "0x2105",
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    isTestnet: false,
    icon: "",
    description: "Coinbase's L2 mainnet"
  },
  
  // Ethereum Mainnet
  "0x1": {
    chainId: "0x1",
    name: "Ethereum",
    rpcUrl: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    blockExplorer: "https://etherscan.io",
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    isTestnet: false,
    icon: "",
    description: "The main Ethereum network"
  },
  
  // Ethereum Sepolia (Testnet)
  "0xaa36a7": {
    chainId: "0xaa36a7",
    name: "Ethereum Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    blockExplorer: "https://sepolia.etherscan.io",
    currency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    },
    isTestnet: true,
    icon: "",
    description: "Ethereum testnet"
  },
  
  // Polygon Mainnet
  "0x89": {
    chainId: "0x89",
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    currency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    isTestnet: false,
    icon: "",
    description: "Ethereum scaling solution"
  },
  
  // Polygon Mumbai (Testnet)
  "0x13881": {
    chainId: "0x13881",
    name: "Polygon Mumbai",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    blockExplorer: "https://mumbai.polygonscan.com",
    currency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    isTestnet: true,
    icon: "",
    description: "Polygon testnet"
  },
  
  // Arbitrum One
  "0xa4b1": {
    chainId: "0xa4b1",
    name: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    isTestnet: false,
    icon: "",
    description: "Ethereum L2 scaling"
  },
  
  // Arbitrum Sepolia (Testnet)
  "0x66eee": {
    chainId: "0x66eee",
    name: "Arbitrum Sepolia",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    blockExplorer: "https://sepolia.arbiscan.io",
    currency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    },
    isTestnet: true,
    icon: "",
    description: "Arbitrum testnet"
  },
  
  // Optimism
  "0xa": {
    chainId: "0xa",
    name: "Optimism",
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io",
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    isTestnet: false,
    icon: "",
    description: "Ethereum L2 optimistic rollup"
  },
  
  // Optimism Sepolia (Testnet)
  "0xaa37dc": {
    chainId: "0xaa37dc",
    name: "Optimism Sepolia",
    rpcUrl: "https://sepolia.optimism.io",
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    currency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    },
    isTestnet: true,
    icon: "",
    description: "Optimism testnet"
  },
  
  // BSC (Binance Smart Chain)
  "0x38": {
    chainId: "0x38",
    name: "BSC",
    rpcUrl: "https://bsc-dataseed.binance.org",
    blockExplorer: "https://bscscan.com",
    currency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18
    },
    isTestnet: false,
    icon: "",
    description: "Binance Smart Chain"
  },
  
  // BSC Testnet
  "0x61": {
    chainId: "0x61",
    name: "BSC Testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    blockExplorer: "https://testnet.bscscan.com",
    currency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18
    },
    isTestnet: true,
    icon: "",
    description: "BSC testnet"
  },
  
  // Avalanche C-Chain
  "0xa86a": {
    chainId: "0xa86a",
    name: "Avalanche",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorer: "https://snowtrace.io",
    currency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18
    },
    isTestnet: false,
    icon: "❄️",
    description: "Avalanche C-Chain"
  },
  
  // Avalanche Fuji (Testnet)
  "0xa869": {
    chainId: "0xa869",
    name: "Avalanche Fuji",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorer: "https://testnet.snowtrace.io",
    currency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18
    },
    isTestnet: true,
    icon: "",
    description: "Avalanche testnet"
  },
  
  // Fantom Opera
  "0xfa": {
    chainId: "0xfa",
    name: "Fantom",
    rpcUrl: "https://rpc.ftm.tools",
    blockExplorer: "https://ftmscan.com",
    currency: {
      name: "FTM",
      symbol: "FTM",
      decimals: 18
    },
    isTestnet: false,
    icon: "",
    description: "Fantom Opera mainnet"
  },
  
  // Fantom Testnet
  "0xfa2": {
    chainId: "0xfa2",
    name: "Fantom Testnet",
    rpcUrl: "https://rpc.testnet.fantom.network",
    blockExplorer: "https://testnet.ftmscan.com",
    currency: {
      name: "FTM",
      symbol: "FTM",
      decimals: 18
    },
    isTestnet: true,
    icon: "",
    description: "Fantom testnet"
  },
  
  // Cronos
  "0x19": {
    chainId: "0x19",
    name: "Cronos",
    rpcUrl: "https://evm.cronos.org",
    blockExplorer: "https://cronoscan.com",
    currency: {
      name: "CRO",
      symbol: "CRO",
      decimals: 18
    },
    isTestnet: false,
    icon: "",
    description: "Crypto.com's EVM chain"
  },
  
  // Cronos Testnet
  "0x152": {
    chainId: "0x152",
    name: "Cronos Testnet",
    rpcUrl: "https://cronos-testnet.crypto.org:8545",
    blockExplorer: "https://testnet.cronoscan.com",
    currency: {
      name: "CRO",
      symbol: "CRO",
      decimals: 18
    },
    isTestnet: true,
    icon: "",
    description: "Cronos testnet"
  }
};

export function useWallet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManuallyDisconnected, setIsManuallyDisconnected] = useState(false);

  // Check if Coinbase Wallet is installed
  const isCoinbaseWalletInstalled = useCallback(() => {
    // Method 1: Direct extension
    if ((window as any).coinbaseWalletExtension) return true;
    
    // Method 2: Via ethereum.isCoinbaseWallet
    if ((window as any).ethereum?.isCoinbaseWallet) return true;
    
    // Method 3: In providers array
    if ((window as any).ethereum?.providers) {
      const providers = (window as any).ethereum.providers;
      return providers.some((p: any) => p.isCoinbaseWallet);
    }
    
    return false;
  }, []);

  // Check if any wallet is installed
  const isWalletInstalled = useCallback(() => {
    return isCoinbaseWalletInstalled() || !!(window as any).ethereum;
  }, [isCoinbaseWalletInstalled]);

  // Get current network
  const getCurrentNetwork = useCallback(async () => {
    if (!provider) return null;
    
    try {
      const network = await provider.getNetwork();
      const chainId = `0x${network.chainId.toString(16)}`;
      console.log(`🌐 Current network detected: ${chainId} (${network.name})`);
      
      const supportedNetwork = SUPPORTED_NETWORKS[chainId];
      if (supportedNetwork) {
        console.log(`✅ Network supported: ${supportedNetwork.name}`);
        return supportedNetwork;
      } else {
        console.log(`⚠️ Network not in supported list: ${chainId}`);
        return {
          chainId,
          name: network.name || `Chain ${chainId}`,
          rpcUrl: '',
          blockExplorer: '',
          currency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          isTestnet: false,
          description: 'Unknown network'
        };
      }
    } catch (err) {
      console.error("Failed to get network:", err);
      return null;
    }
  }, [provider]);

  // Switch network - Enhanced version
  const switchNetwork = useCallback(async (targetChainId: string) => {
    console.log(`🔄 Attempting to switch to network: ${targetChainId}`);
    
    // Clear any previous errors
    setError(null);
    
    const targetNetwork = SUPPORTED_NETWORKS[targetChainId];
    if (!targetNetwork) {
      setError("Unsupported network");
      return false;
    }

    try {
      console.log(`🔄 Switching to ${targetNetwork.name} (${targetChainId})`);

      // Get the underlying wallet provider - try different access patterns
      let walletProvider = null;
      
      // Try to access the provider directly from the ethers provider
      if ((provider as any)?.provider) {
        console.log("✅ Using provider.provider for network switch");
        walletProvider = (provider as any).provider;
      } else if ((window as any).coinbaseWalletExtension) {
        console.log("✅ Using window.coinbaseWalletExtension for network switch");
        walletProvider = (window as any).coinbaseWalletExtension;
      } else if ((window as any).ethereum) {
        console.log("✅ Using window.ethereum for network switch");
        walletProvider = (window as any).ethereum;
      }

      if (!walletProvider || !walletProvider.request) {
        console.error("❌ No valid wallet provider found for network switching");
        console.error("Provider available:", !!provider);
        console.error("Provider.provider:", !!(provider as any)?.provider);
        console.error("Window.ethereum:", !!(window as any).ethereum);
        console.error("Coinbase extension:", !!(window as any).coinbaseWalletExtension);
        
        // If no provider but we have an account, wallet might be connected differently
        if (account) {
          setError("Wallet connected but network switching not available. Try refreshing the page.");
        } else {
          setError("Please connect your wallet first to switch networks");
        }
        return false;
      }

      // Request network switch
      await walletProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }]
      });

      console.log(`✅ Successfully switched to ${targetNetwork.name}`);
      
      // Update current network
      setCurrentNetwork(targetNetwork);
      return true;
    } catch (err: any) {
      console.error("Network switch error:", err);
      
      // If network doesn't exist, add it
      if (err.code === 4902) {
        console.log(`📝 Adding ${targetNetwork.name} to wallet...`);
        try {
          // Get the underlying wallet provider again for adding network
          let walletProvider = null;
          if ((provider as any).provider) {
            walletProvider = (provider as any).provider;
          } else if ((window as any).coinbaseWalletExtension) {
            walletProvider = (window as any).coinbaseWalletExtension;
          } else if ((window as any).ethereum) {
            walletProvider = (window as any).ethereum;
          }

          await walletProvider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: targetChainId,
              chainName: targetNetwork.name,
              nativeCurrency: targetNetwork.currency,
              rpcUrls: [targetNetwork.rpcUrl],
              blockExplorerUrls: [targetNetwork.blockExplorer]
            }]
          });
          
          console.log(`✅ Successfully added ${targetNetwork.name}`);
          setCurrentNetwork(targetNetwork);
          return true;
        } catch (addErr) {
          console.error("Failed to add network:", addErr);
          setError(`Failed to add ${targetNetwork.name} to wallet`);
          return false;
        }
      }
      
      // Handle other errors
      if (err.code === 4001) {
        setError("User rejected network switch");
      } else {
        setError(`Failed to switch network: ${err.message || 'Unknown error'}`);
      }
      return false;
    }
  }, [provider]);

  // Manual network addition function
  const addNetwork = useCallback(async (chainId: string) => {
    if (!provider) {
      setError("No wallet provider available");
      return false;
    }

    const network = SUPPORTED_NETWORKS[chainId];
    if (!network) {
      setError("Unsupported network");
      return false;
    }

    try {
      console.log(`📝 Adding ${network.name} to wallet...`);
      
      // Get the underlying wallet provider - try different access patterns
      let walletProvider = null;
      
      // Try to access the provider directly from the ethers provider
      if ((provider as any).provider) {
        walletProvider = (provider as any).provider;
      } else if ((window as any).coinbaseWalletExtension) {
        walletProvider = (window as any).coinbaseWalletExtension;
      } else if ((window as any).ethereum) {
        walletProvider = (window as any).ethereum;
      }

      if (!walletProvider || !walletProvider.request) {
        setError("Wallet provider not available for network addition");
        return false;
      }
      
      await walletProvider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: chainId,
          chainName: network.name,
          nativeCurrency: network.currency,
          rpcUrls: [network.rpcUrl],
          blockExplorerUrls: [network.blockExplorer]
        }]
      });
      
      console.log(`✅ Successfully added ${network.name}`);
      setCurrentNetwork(network);
      return true;
    } catch (err: any) {
      console.error("Failed to add network:", err);
      if (err.code === 4001) {
        setError("User rejected adding network");
      } else {
        setError(`Failed to add ${network.name}: ${err.message || 'Unknown error'}`);
      }
      return false;
    }
  }, [provider]);

  // Detect and initialize wallet provider
  useEffect(() => {
    const initializeProvider = async () => {
      try {
        console.log("🔍 Initializing wallet provider...");
        
        // Wait a bit longer for wallet providers to load
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Debug all available wallet objects
        console.log("🔍 Debugging wallet detection:");
        console.log("window.ethereum:", (window as any).ethereum);
        console.log("window.coinbaseWalletExtension:", (window as any).coinbaseWalletExtension);
        console.log("window.ethereum?.isCoinbaseWallet:", (window as any).ethereum?.isCoinbaseWallet);
        console.log("window.ethereum?.isMetaMask:", (window as any).ethereum?.isMetaMask);
        console.log("window.ethereum?.providers:", (window as any).ethereum?.providers);
        
        let detectedProvider = null;
        
        // Method 1: Check for Coinbase Wallet Extension
        if ((window as any).coinbaseWalletExtension) {
          console.log("✅ Method 1: Coinbase Wallet Extension detected");
          detectedProvider = (window as any).coinbaseWalletExtension;
        }
        // Method 2: Check for Coinbase Wallet via ethereum.isCoinbaseWallet
        else if ((window as any).ethereum?.isCoinbaseWallet) {
          console.log("✅ Method 2: Coinbase Wallet (via ethereum.isCoinbaseWallet) detected");
          detectedProvider = (window as any).ethereum;
        }
        // Method 3: Check for Coinbase in multiple providers array
        else if ((window as any).ethereum?.providers) {
          const providers = (window as any).ethereum.providers;
          const coinbaseProvider = providers.find((p: any) => p.isCoinbaseWallet);
          if (coinbaseProvider) {
            console.log("✅ Method 3: Coinbase Wallet found in providers array");
            detectedProvider = coinbaseProvider;
          }
        }
        // Method 4: Check for any ethereum provider
        else if ((window as any).ethereum) {
          console.log("✅ Method 4: Generic ethereum provider detected");
          detectedProvider = (window as any).ethereum;
        }
        
        if (detectedProvider) {
          console.log("🔗 Creating ethers BrowserProvider...");
          const ethersProvider = new ethers.BrowserProvider(detectedProvider);
          setProvider(ethersProvider);
          console.log("✅ Provider initialized successfully");
        } else {
          console.log("❌ No wallet provider found");
          setProvider(null);
          setError("No wallet detected. Please install Coinbase Wallet or MetaMask.");
        }
        
      } catch (err) {
        console.error("❌ Failed to initialize wallet provider:", err);
        setError(`Failed to initialize wallet: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setProvider(null);
      }
    };

    // Initialize immediately and also retry after a delay
    initializeProvider();
    
    // Also listen for wallet installation events
    const handleEthereumConnect = () => {
      console.log("🔄 Ethereum provider connected, reinitializing...");
      setTimeout(initializeProvider, 100);
    };
    
    if ((window as any).ethereum) {
      (window as any).ethereum.on?.('connect', handleEthereumConnect);
    }
    
    return () => {
      if ((window as any).ethereum) {
        (window as any).ethereum.removeListener?.('connect', handleEthereumConnect);
      }
    };
  }, []);

  // Get network info when provider changes
  useEffect(() => {
    if (!provider) return;
    
    const getNetworkInfo = async () => {
      try {
        const network = await getCurrentNetwork();
        setCurrentNetwork(network);
        console.log("🌐 Network set:", network?.name);
      } catch (err) {
        console.error("Failed to get network info:", err);
      }
    };
    
    getNetworkInfo();
  }, [provider, getCurrentNetwork]);

  // Listen for account and chain changes - Fixed for ethers v6
  useEffect(() => {
    if (!provider) return;

    let walletProvider: any = null;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("👤 Accounts changed:", accounts);
      
      // If user manually disconnected, don't auto-reconnect
      if (isManuallyDisconnected) {
        console.log("🔒 Manual disconnect active - ignoring account change");
        return;
      }
      
      setAccount(accounts[0] || null);
    };

    const handleChainChanged = async () => {
      console.log("🌐 Chain changed");
      // Get updated network info
      try {
        const network = await getCurrentNetwork();
        setCurrentNetwork(network);
      } catch (err) {
        console.error("Failed to handle chain change:", err);
      }
    };

    // Get the underlying wallet provider - NEVER use ethers BrowserProvider for events
    if ((provider as any).provider) {
      walletProvider = (provider as any).provider;
      console.log("📡 Using provider.provider for events");
    } else if ((window as any).coinbaseWalletExtension) {
      walletProvider = (window as any).coinbaseWalletExtension;
      console.log("📡 Using coinbaseWalletExtension for events");
    } else if ((window as any).ethereum) {
      walletProvider = (window as any).ethereum;
      console.log("📡 Using window.ethereum for events");
    }
    
    if (walletProvider && typeof walletProvider.on === 'function') {
      try {
        console.log("📡 Adding wallet event listeners...");
        walletProvider.on("accountsChanged", handleAccountsChanged);
        walletProvider.on("chainChanged", handleChainChanged);
        console.log("✅ Event listeners added successfully");
      } catch (err) {
        console.log("⚠️ Error adding wallet event listeners:", err);
      }
    } else {
      console.log("⚠️ Wallet provider doesn't support event listeners");
    }

    // Get initial account
    const getInitialAccount = async () => {
      try {
        // If user manually disconnected, don't auto-connect
        if (isManuallyDisconnected) {
          console.log("🔒 Manual disconnect active - skipping initial account check");
          return;
        }
        
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          console.log("👤 Initial account:", accounts[0].address);
          setAccount(accounts[0].address);
        }
      } catch (err) {
        console.error("Failed to get initial account:", err);
      }
    };

    getInitialAccount();

    // Cleanup function - NEVER use ethers BrowserProvider for event cleanup
    return () => {
      // Only clean up if we have the raw wallet provider (not ethers provider)
      if (walletProvider && walletProvider !== provider) {
        try {
          console.log("🧹 Cleaning up wallet event listeners...");
          
          if (typeof walletProvider.removeListener === 'function') {
            walletProvider.removeListener("accountsChanged", handleAccountsChanged);
            walletProvider.removeListener("chainChanged", handleChainChanged);
            console.log("✅ Event listeners removed with removeListener");
          } else if (typeof walletProvider.off === 'function') {
            walletProvider.off("accountsChanged", handleAccountsChanged);
            walletProvider.off("chainChanged", handleChainChanged);
            console.log("✅ Event listeners removed with off");
          } else {
            console.log("⚠️ Wallet provider has no removeListener or off method");
          }
        } catch (err) {
          console.log("⚠️ Error removing wallet event listeners (non-critical):", err);
        }
      } else {
        console.log("🧹 No wallet provider cleanup needed");
      }
    };
  }, [provider, isManuallyDisconnected, getCurrentNetwork]);

  // Connect wallet - Simplified and more reliable
  const connect = useCallback(async () => {
    console.log("🔌 Attempting to connect wallet...");
    
    if (!provider) {
      const errorMsg = "No wallet provider available. Please install Coinbase Wallet.";
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      setIsManuallyDisconnected(false); // Reset manual disconnect state
      
      console.log("📱 Requesting accounts...");
      
      // Try multiple provider access patterns for better compatibility
      let walletProvider = null;
      
      if ((provider as any).provider) {
        console.log("✅ Using provider.provider");
        walletProvider = (provider as any).provider;
      } else if ((window as any).coinbaseWalletExtension) {
        console.log("✅ Using window.coinbaseWalletExtension");
        walletProvider = (window as any).coinbaseWalletExtension;
      } else if ((window as any).ethereum) {
        console.log("✅ Using window.ethereum");
        walletProvider = (window as any).ethereum;
      }
      
      if (!walletProvider || !walletProvider.request) {
        setError("Wallet provider not available for connection");
        return;
      }
      
      const accounts = await walletProvider.request({
        method: "eth_requestAccounts",
      }) as string[];
      
      console.log("📱 Received accounts:", accounts);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        console.log("✅ Wallet connected successfully:", accounts[0]);
        
        // Get current network after connection
        const network = await getCurrentNetwork();
        setCurrentNetwork(network);
        console.log("🌐 Current network:", network?.name);
      } else {
        setError("No accounts found");
      }
    } catch (err: any) {
      console.error("Failed to connect wallet:", err);
      
      if (err.code === 4001) {
        setError("User rejected connection request");
      } else if (err.code === -32002) {
        setError("Wallet connection already pending. Please check your wallet.");
      } else {
        setError(`Failed to connect wallet: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [provider, getCurrentNetwork]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    console.log("🔌 Disconnecting wallet");
    console.log("🔍 Before disconnect - Account:", account, "Manual disconnect:", isManuallyDisconnected);
    
    try {
      // Try to disconnect from the wallet provider if possible
      const walletProvider = (provider as any)?.provider || (window as any).ethereum || (window as any).coinbaseWalletExtension;
      
      if (walletProvider && typeof walletProvider.disconnect === 'function') {
        await walletProvider.disconnect();
      } else if (walletProvider && typeof walletProvider.close === 'function') {
        await walletProvider.close();
      }
    } catch (err) {
      console.log("⚠️ Wallet provider disconnect not available or failed:", err);
    }
    
    // Clear local state
    setAccount(null);
    setError(null);
    setCurrentNetwork(null);
    setIsConnecting(false);
    setIsManuallyDisconnected(true);
    console.log("✅ Disconnect state set - Manual disconnect:", true);
  }, [account, isManuallyDisconnected, provider]);

  // Get wallet type
  const getWalletType = useCallback(() => {
    if ((window as any).coinbaseWalletExtension) {
      return "Coinbase Wallet";
    }
    if ((window as any).ethereum && (window as any).ethereum.isCoinbaseWallet) {
      return "Coinbase Wallet";
    }
    if ((window as any).ethereum) {
      return "Injected Wallet";
    }
    return "No Wallet";
  }, []);

  return {
    provider,
    account,
    currentNetwork,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
    addNetwork, // Add this line
    getWalletType,
    isCoinbaseWalletInstalled,
    isWalletInstalled,
    supportedNetworks: SUPPORTED_NETWORKS,
  };
}
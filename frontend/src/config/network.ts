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
  }
  
  // Supported networks configuration
  export const SUPPORTED_NETWORKS: { [key: string]: NetworkConfig } = {
    // Base Mainnet (Coinbase's L2)
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
      isTestnet: false
    },
    // Base Sepolia (Testnet)
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
      isTestnet: true
    },
    // Ethereum Mainnet
    "0x1": {
      chainId: "0x1",
      name: "Ethereum",
      rpcUrl: "https://mainnet.infura.io/v3/your-project-id",
      blockExplorer: "https://etherscan.io",
      currency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18
      },
      isTestnet: false
    },
    // Polygon
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
      isTestnet: false
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
      isTestnet: false
    }
  };
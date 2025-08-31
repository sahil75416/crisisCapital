import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  connect: () => void;
  disconnect: () => void;
  provider: ethers.BrowserProvider | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [balance, setBalance] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      // Initialize provider
      if (window.ethereum) {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);
        
        // Get balance
        ethersProvider.getBalance(address).then((bal) => {
          setBalance(ethers.formatEther(bal));
        });
      }
    } else {
      setBalance(null);
      setProvider(null);
    }
  }, [isConnected, address]);

  const handleConnect = () => {
    const coinbaseConnector = connectors.find(c => c.name === 'Coinbase Wallet');
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector });
    } else {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address: address || null,
        balance,
        connect: handleConnect,
        disconnect,
        provider,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

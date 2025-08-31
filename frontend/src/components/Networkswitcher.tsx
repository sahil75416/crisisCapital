import React, { useState, useMemo } from "react";
import { useWallet } from "../hooks/useWallet";

export const NetworkSwitcher: React.FC = () => {
  const { currentNetwork, switchNetwork, supportedNetworks, error, account, provider } = useWallet();
  const [showAllNetworks, setShowAllNetworks] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mainnet' | 'testnet'>('all');
  const [switchingNetwork, setSwitchingNetwork] = useState<string | null>(null);

  const handleNetworkSwitch = async (chainId: string) => {
    // Check if wallet is connected before attempting switch
    if (!account || !provider) {
      console.log("❌ Wallet not connected - cannot switch networks");
      return;
    }
    
    console.log(`🔄 Attempting to switch to network: ${chainId}`);
    setSwitchingNetwork(chainId);
    
    try {
      const success = await switchNetwork(chainId);
      if (success) {
        console.log(`✅ Successfully switched to network: ${chainId}`);
      } else {
        console.log(`❌ Failed to switch to network: ${chainId}`);
      }
    } catch (error) {
      console.error(`❌ Error switching to network ${chainId}:`, error);
    } finally {
      setSwitchingNetwork(null);
    }
  };

  // Memoize network filtering to prevent infinite re-renders
  const { mainnetNetworks, testnetNetworks, filteredNetworks } = useMemo(() => {
    const mainnet = Object.entries(supportedNetworks).filter(([_, network]) => !network.isTestnet);
    const testnet = Object.entries(supportedNetworks).filter(([_, network]) => network.isTestnet);
    
    let filtered;
    switch (selectedCategory) {
      case 'mainnet':
        filtered = mainnet;
        break;
      case 'testnet':
        filtered = testnet;
        break;
      default:
        filtered = Object.entries(supportedNetworks);
    }
    
    return {
      mainnetNetworks: mainnet,
      testnetNetworks: testnet,
      filteredNetworks: filtered
    };
  }, [supportedNetworks, selectedCategory]);

  const getNetworkIcon = (network: any) => {
    return network.icon || '🌐';
  };

  return (
    <div className="network-switcher">
      <div className="network-header">
        <h4>Select Network</h4>
        <div className="network-controls">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="category-select"
          >
            <option value="all">All Networks</option>
            <option value="mainnet">Mainnets Only</option>
            <option value="testnet">Testnets Only</option>
          </select>
          <button 
            onClick={() => setShowAllNetworks(!showAllNetworks)}
            className="toggle-networks-btn"
          >
            {showAllNetworks ? 'Show Less' : 'Show All'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="network-error">
          <p>⚠️ {error}</p>
        </div>
      )}
      
      {/* Wallet Connection Status */}
      {!account && (
        <div className="wallet-connection-warning">
          <p>⚠️ Please connect your wallet first to switch networks</p>
        </div>
      )}

      <div className="network-options">
        {filteredNetworks
          .slice(0, showAllNetworks ? undefined : 6)
          .map(([chainId, network]) => (
            <button
              key={chainId}
              className={`network-option ${currentNetwork?.chainId === chainId ? 'active' : ''} ${switchingNetwork === chainId ? 'switching' : ''}`}
              onClick={() => handleNetworkSwitch(chainId)}
              disabled={switchingNetwork === chainId || !account}
            >
              <div className="network-icon">
                {switchingNetwork === chainId ? '⏳' : getNetworkIcon(network)}
              </div>
              <div className="network-info">
                <span className="network-name">{network.name}</span>
                <span className="network-currency">{network.currency.symbol}</span>
                {network.description && (
                  <span className="network-description">{network.description}</span>
                )}
              </div>
              {network.isTestnet && <span className="testnet-badge">TEST</span>}
              {switchingNetwork === chainId && (
                <span className="switching-indicator">Switching...</span>
              )}
            </button>
          ))}
      </div>

      {!showAllNetworks && filteredNetworks.length > 6 && (
        <div className="show-more-prompt">
          <button 
            onClick={() => setShowAllNetworks(true)}
            className="show-more-btn"
          >
            {filteredNetworks.length === 0 ? 'More Networks' : `Show ${filteredNetworks.length - 6} More Networks`}
          </button>
        </div>
      )}

      {/* Current Network Display */}
      {currentNetwork && (
        <div className="current-network-display">
          <h5>Current Network</h5>
          <div className="current-network-info">
            <span className="network-icon">{getNetworkIcon(currentNetwork)}</span>
            <div className="network-details">
              <span className="network-name">{currentNetwork.name}</span>
              <span className="network-chain-id">Chain ID: {currentNetwork.chainId}</span>
              <span className="network-currency">{currentNetwork.currency.symbol}</span>
            </div>
            {currentNetwork.isTestnet && <span className="testnet-badge">TEST</span>}
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="debug-info">
        <p>Available networks: {Object.keys(supportedNetworks).length}</p>
        <p>Current network: {currentNetwork?.name || 'None'}</p>
        <p>Wallet connected: {account ? 'Yes' : 'No'}</p>
        <p>Base Sepolia chain ID: 0x14a33</p>
      </div>
    </div>
  );
};
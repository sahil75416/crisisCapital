import React, { useState } from "react";
import { useWallet } from "../hooks/useWallet";

export const NetworkSwitcher: React.FC = () => {
  const { currentNetwork, switchNetwork, addNetwork, supportedNetworks } = useWallet();
  const [showAllNetworks, setShowAllNetworks] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mainnet' | 'testnet'>('all');
  const [switchingNetwork, setSwitchingNetwork] = useState<string | null>(null);

  const handleNetworkSwitch = async (chainId: string) => {
    setSwitchingNetwork(chainId);
    try {
      const success = await switchNetwork(chainId);
      if (!success) {
        // If switch failed, try to add the network
        console.log("Switch failed, trying to add network...");
        await addNetwork(chainId);
      }
    } catch (error) {
      console.error("Network switch/add failed:", error);
    } finally {
      setSwitchingNetwork(null);
    }
  };

  // Group networks by category
  const mainnetNetworks = Object.entries(supportedNetworks).filter(([_, network]) => !network.isTestnet);
  const testnetNetworks = Object.entries(supportedNetworks).filter(([_, network]) => network.isTestnet);

  const getFilteredNetworks = () => {
    switch (selectedCategory) {
      case 'mainnet':
        return mainnetNetworks;
      case 'testnet':
        return testnetNetworks;
      default:
        return Object.entries(supportedNetworks);
    }
  };

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

      <div className="network-options">
        {getFilteredNetworks()
          .slice(0, showAllNetworks ? undefined : 6)
          .map(([chainId, network]) => (
            <button
              key={chainId}
              className={`network-option ${currentNetwork?.chainId === chainId ? 'active' : ''} ${switchingNetwork === chainId ? 'switching' : ''}`}
              onClick={() => handleNetworkSwitch(chainId)}
              disabled={switchingNetwork === chainId}
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

      {!showAllNetworks && getFilteredNetworks().length > 6 && (
        <div className="show-more-prompt">
          <button 
            onClick={() => setShowAllNetworks(true)}
            className="show-more-btn"
          >
            Show {getFilteredNetworks().length - 6} More Networks
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

      {/* Manual Network Addition */}
      <div className="manual-network-addition">
        <h5>Add Network Manually</h5>
        <p>If automatic switching fails, try adding Base Sepolia manually:</p>
        <button 
          onClick={() => addNetwork("0x14a33")}
          className="add-network-btn"
        >
          Add Base Sepolia to Wallet
        </button>
      </div>
    </div>
  );
};
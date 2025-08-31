import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import WalletConnect from "./components/WalletConnect";
import WalletInstallGuide from "./components/WalletInstallGuide";
import { NetworkSwitcher } from "./components/Networkswitcher";
import MarketList from "./components/MarketList";
import CreateMarket from "./components/CreateMarket";
import RiskTokenMarketplace from "./components/RiskTokenMarketplace";
import HedgingWidget from "./components/HedgingWidget";
import Dashboard from "./components/Dashboard";
import { startAutoMarkets } from "./connectors/autoMarkets";
import { useWallet } from "./hooks/useWallet";
import "./App.css";

function App() {
  const { 
    provider, 
    account, 
    currentNetwork,
    connect, 
    disconnect, 
    switchNetwork,
    getWalletType, 
    isWalletInstalled,
    supportedNetworks
  } = useWallet();
  
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Start AI / connector loop safely
  useEffect(() => {
    if (!provider) return;
    startAutoMarkets(provider).catch(console.error);
  }, [provider]);

  // Auto-switch to Base Sepolia if wallet is connected but on wrong network
  useEffect(() => {
    const autoSwitchToBaseSepolia = async () => {
      if (account && currentNetwork && currentNetwork.chainId !== "0x14a33") {
        console.log(`🔄 Auto-switching from ${currentNetwork.name} to Base Sepolia...`);
        try {
          await switchNetwork("0x14a33");
          console.log("✅ Successfully switched to Base Sepolia");
        } catch (err) {
          console.log("⚠️ Auto-switch to Base Sepolia failed:", err);
        }
      }
    };

    // Small delay to ensure wallet connection is stable
    const timer = setTimeout(autoSwitchToBaseSepolia, 1000);
    return () => clearTimeout(timer);
  }, [account, currentNetwork, switchNetwork]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard provider={provider} account={account} />;
      case "markets":
        return <MarketList provider={provider} />;
      case "create":
        return <CreateMarket provider={provider} />;
      case "tokens":
        return <RiskTokenMarketplace provider={provider} />;
      case "hedge":
        return <HedgingWidget provider={provider} />;
      default:
        return <Dashboard provider={provider} account={account} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="app-title">🎯 CrisisCapital</h1>
            <p className="app-subtitle">Turn Disruption into Value</p>
            {/* Display current network information */}
            {currentNetwork && (
              <div className="current-network">
                🌐 {currentNetwork.name} • {currentNetwork.currency.symbol}
                {currentNetwork.isTestnet && <span className="testnet-badge">TEST</span>}
              </div>
            )}
          </div>
          <WalletConnect 
            provider={provider} 
            account={account} 
            onAccountChange={account ? disconnect : connect}
            walletType={getWalletType()}
            disconnect={disconnect}
          />
        </div>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard
        </button>
        <button 
          className={`nav-tab ${activeTab === "markets" ? "active" : ""}`}
          onClick={() => setActiveTab("markets")}
        >
          �� Markets
        </button>
        <button 
          className={`nav-tab ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          ➕ Create Market
        </button>
        <button 
          className={`nav-tab ${activeTab === "tokens" ? "active" : ""}`}
          onClick={() => setActiveTab("tokens")}
        >
          🪙 Risk Tokens
        </button>
        <button 
          className={`nav-tab ${activeTab === "hedge" ? "active" : ""}`}
          onClick={() => setActiveTab("hedge")}
        >
          🛡️ Hedge
        </button>
      </nav>

      <main className="app-main">
        {provider ? (
          <>
            {/* Network Switcher - only show when wallet is connected */}
            <div className="network-section">
              <NetworkSwitcher />
            </div>
            
            {/* Main tab content */}
            {renderTabContent()}
          </>
        ) : isWalletInstalled() ? (
          <div className="connect-prompt">
            <h2>Welcome to CrisisCapital</h2>
            <p>Connect your wallet to start trading micro-crises and earning rewards!</p>
            <div className="features-grid">
              <div className="feature-card">
                <h3>🎯 Real-Time Markets</h3>
                <p>Stake on delivery delays, flight cancellations, and transit issues</p>
              </div>
              <div className="feature-card">
                <h3>🪙 Risk Tokens</h3>
                <p>Trade fractionalized risk tokens for any crisis market</p>
              </div>
              <div className="feature-card">
                <h3>��️ One-Tap Hedging</h3>
                <p>Protect yourself against everyday disruptions</p>
              </div>
              <div className="feature-card">
                <h3>🤖 AI-Powered</h3>
                <p>Get predictions and insights for better decision making</p>
              </div>
            </div>
          </div>
        ) : (
          <WalletInstallGuide />
        )}
      </main>

      <footer className="app-footer">
        <p>Built on {currentNetwork?.name || 'Base'} • Powered by Coinbase Wallet</p>
        {currentNetwork && (
          <div className="footer-network-info">
            <span>Network: {currentNetwork.name}</span>
            <span>Currency: {currentNetwork.currency.symbol}</span>
            {currentNetwork.isTestnet && <span className="testnet-indicator">Testnet</span>}
          </div>
        )}
      </footer>
    </div>
  );
}

export default App;
import React, { useEffect, useState } from "react";

const WalletInstallGuide: React.FC = () => {
  const [walletStatus, setWalletStatus] = useState({
    coinbase: false,
    metamask: false,
    ethereum: false
  });

  useEffect(() => {
    const checkWallets = () => {
      setWalletStatus({
        coinbase: !!(window as any).coinbaseWalletExtension || 
                 !!(window as any).ethereum?.isCoinbaseWallet ||
                 ((window as any).ethereum?.providers?.some((p: any) => p.isCoinbaseWallet)),
        metamask: !!(window as any).ethereum?.isMetaMask,
        ethereum: !!(window as any).ethereum
      });
    };

    checkWallets();
    
    // Check again after a delay in case wallets load slowly
    const timer = setTimeout(checkWallets, 1000);
    return () => clearTimeout(timer);
  }, []);

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="wallet-install-guide">
      <h2>🔗 Wallet Required</h2>
      <p>To use CrisisCapital, you need a Web3 wallet. We recommend Coinbase Wallet for the best experience.</p>
      
      {/* Wallet Detection Status */}
      <div className="wallet-detection">
        <h3>🔍 Wallet Detection</h3>
        <div className="detection-status">
          <div className={`status-item ${walletStatus.coinbase ? 'detected' : 'not-detected'}`}>
            {walletStatus.coinbase ? '✅' : '❌'} Coinbase Wallet: {walletStatus.coinbase ? 'Detected' : 'Not Found'}
          </div>
          <div className={`status-item ${walletStatus.metamask ? 'detected' : 'not-detected'}`}>
            {walletStatus.metamask ? '✅' : '❌'} MetaMask: {walletStatus.metamask ? 'Detected' : 'Not Found'}
          </div>
          <div className={`status-item ${walletStatus.ethereum ? 'detected' : 'not-detected'}`}>
            {walletStatus.ethereum ? '✅' : '❌'} Ethereum Provider: {walletStatus.ethereum ? 'Available' : 'Not Found'}
          </div>
        </div>
        
        {(walletStatus.coinbase || walletStatus.metamask || walletStatus.ethereum) && (
          <div className="refresh-prompt">
            <p>✅ Wallet detected! If the connection button isn't working, try refreshing the page.</p>
            <button onClick={refreshPage} className="btn btn-primary">
              🔄 Refresh Page
            </button>
          </div>
        )}
      </div>
      
      <div className="install-options">
        <div className="install-option">
          <h3>📱 Coinbase Wallet (Recommended)</h3>
          <p>The easiest way to get started with Web3</p>
          <a 
            href="https://wallet.coinbase.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Install Coinbase Wallet
          </a>
        </div>
        
        <div className="install-option">
          <h3>🦊 MetaMask</h3>
          <p>Popular Web3 wallet with wide compatibility</p>
          <a 
            href="https://metamask.io/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Install MetaMask
          </a>
        </div>
      </div>
      
      <div className="setup-steps">
        <h3>📋 Setup Steps</h3>
        <ol>
          <li>Install your preferred wallet extension</li>
          <li>Create a new wallet or import existing one</li>
          <li>Add Base Sepolia testnet (we'll help you with this)</li>
          <li>Get some test ETH from the Base faucet</li>
          <li>Return here and connect your wallet</li>
        </ol>
      </div>

      <div className="troubleshooting">
        <h3>🔧 Troubleshooting</h3>
        <ul>
          <li>Make sure your wallet extension is enabled</li>
          <li>Try refreshing the page after installing a wallet</li>
          <li>Check that you're not in incognito/private browsing mode</li>
          <li>Disable other wallet extensions temporarily</li>
        </ul>
      </div>
    </div>
  );
};

export default WalletInstallGuide;

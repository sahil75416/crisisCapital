// src/components/MarketList.tsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useCrisisDEX } from "../hooks/useCrisisDEX";

interface MarketListProps {
  provider: ethers.BrowserProvider | null;
}

interface Market {
  id: number;
  description: string;
  resolutionTime: string;
  totalStaked: string;
  yesShares: string;
  noShares: string;
  resolved: boolean;
  outcome: boolean;
  creator: string;
  creationTime: string;
  totalVolume: string;
  liquidityPool: string;
}

const MarketList: React.FC<MarketListProps> = ({ provider }) => {
  const { contract } = useCrisisDEX(provider);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakePrediction, setStakePrediction] = useState<boolean | null>(null);
  const [isStaking, setIsStaking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!contract) return;
    
    const loadMarkets = async () => {
      try {
        setLoading(true);
        
        const marketCount = await contract.marketCount();
        const marketData: Market[] = [];
        
        for (let i = 1; i <= marketCount; i++) {
          try {
            const market = await contract.getMarketInfo(i);
            marketData.push({
              id: i,
              description: market.description,
              resolutionTime: new Date(Number(market.resolutionTime) * 1000).toLocaleString(),
              totalStaked: ethers.formatEther(market.totalStaked),
              yesShares: ethers.formatEther(market.yesShares),
              noShares: ethers.formatEther(market.noShares),
              resolved: market.resolved,
              outcome: market.outcome,
              creator: market.creator,
              creationTime: new Date(Number(market.creationTime) * 1000).toLocaleString(),
              totalVolume: ethers.formatEther(market.totalVolume),
              liquidityPool: ethers.formatEther(market.liquidityPool)
            });
          } catch (error) {
            console.error(`Failed to load market ${i}:`, error);
          }
        }
        
        setMarkets(marketData);
      } catch (error) {
        console.error("Failed to load markets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMarkets();
  }, [contract]);

  const handleStake = async () => {
    if (!contract || !selectedMarket || !stakeAmount || stakePrediction === null) return;
    
    try {
      setIsStaking(true);
      setMessage(null);
      
      const amount = ethers.parseEther(stakeAmount);
      const tx = await contract.stake(selectedMarket.id, stakePrediction, amount);
      await tx.wait();
      
      setMessage({
        type: 'success',
        text: `Successfully staked ${stakeAmount} CRISYS on ${stakePrediction ? 'YES' : 'NO'}!`
      });
      
      // Reset form
      setStakeAmount("");
      setStakePrediction(null);
      setSelectedMarket(null);
      
      // Reload markets
      window.location.reload();
      
    } catch (error: any) {
      console.error("Staking failed:", error);
      setMessage({
        type: 'error',
        text: error.message || "Failed to stake"
      });
    } finally {
      setIsStaking(false);
    }
  };

  const getTimeRemaining = (resolutionTime: string) => {
    const now = new Date();
    const resolution = new Date(resolutionTime);
    const diff = resolution.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getMarketStatus = (market: Market) => {
    if (market.resolved) {
      return {
        text: market.outcome ? 'YES Won' : 'NO Won',
        color: market.outcome ? '#4ecdc4' : '#ff6b6b'
      };
    }
    
    const timeRemaining = getTimeRemaining(market.resolutionTime);
    if (timeRemaining === 'Expired') {
      return {
        text: 'Pending Resolution',
        color: '#ffa726'
      };
    }
    
    return {
      text: `Active (${timeRemaining})`,
      color: '#4ecdc4'
    };
  };

  if (loading) {
    return <div className="loading">Loading markets...</div>;
  }

  return (
    <div>
      <div className="component-container">
        <h2 className="component-title">🎲 Crisis Markets</h2>
        
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          Browse and participate in crisis markets. Stake your CRISYS tokens on real-world disruptions 
          and earn rewards when you predict correctly.
        </p>

        {markets.length === 0 ? (
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
            No markets found. Create the first one!
          </p>
        ) : (
          <div className="market-list">
            {markets.map((market) => {
              const status = getMarketStatus(market);
              return (
                <div key={market.id} className="market-item">
                  <div className="card-header">
                    <h3 className="card-title">{market.description}</h3>
                    <span 
                      className="card-status" 
                      style={{ 
                        backgroundColor: `${status.color}20`,
                        color: status.color,
                        borderColor: `${status.color}30`
                      }}
                    >
                      {status.text}
                    </span>
                  </div>
                  
                  <div className="market-stats">
                    <div className="market-stat">
                      <div className="market-stat-value">{market.totalStaked}</div>
                      <div className="market-stat-label">Total Staked</div>
                    </div>
                    <div className="market-stat">
                      <div className="market-stat-value">{market.yesShares}</div>
                      <div className="market-stat-label">YES Shares</div>
                    </div>
                    <div className="market-stat">
                      <div className="market-stat-value">{market.noShares}</div>
                      <div className="market-stat-label">NO Shares</div>
                    </div>
                    <div className="market-stat">
                      <div className="market-stat-value">{market.totalVolume}</div>
                      <div className="market-stat-label">Total Volume</div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '1rem', 
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <strong style={{ color: '#4ecdc4' }}>Created:</strong>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {market.creationTime}
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: '#4ecdc4' }}>Resolves:</strong>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {market.resolutionTime}
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: '#4ecdc4' }}>Creator:</strong>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {market.creator.slice(0, 6)}…{market.creator.slice(-4)}
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: '#4ecdc4' }}>Liquidity:</strong>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {market.liquidityPool} CRISYS
                      </div>
                    </div>
                  </div>

                  {!market.resolved && getTimeRemaining(market.resolutionTime) !== 'Expired' && (
                    <div className="market-actions">
                      <button 
                        className="btn" 
                        onClick={() => setSelectedMarket(market)}
                      >
                        Stake Now
                      </button>
                      <button className="btn btn-secondary">
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Staking Modal */}
      {selectedMarket && (
        <div className="component-container">
          <h2 className="component-title">💰 Stake on {selectedMarket.description}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card">
              <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>Current YES Shares</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                {selectedMarket.yesShares}
              </div>
            </div>
            
            <div className="card">
              <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>Current NO Shares</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                {selectedMarket.noShares}
              </div>
            </div>
            
            <div className="card">
              <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>Total Pool</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                {selectedMarket.totalStaked}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <button 
              className={`hedge-option ${stakePrediction === true ? 'selected' : ''}`}
              onClick={() => setStakePrediction(true)}
            >
              🟢 Stake YES
            </button>
            <button 
              className={`hedge-option ${stakePrediction === false ? 'selected' : ''}`}
              onClick={() => setStakePrediction(false)}
            >
              🔴 Stake NO
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Amount to Stake (CRISYS)</label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="form-input"
              placeholder="100"
              min="1"
              step="0.01"
            />
            <small style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem', display: 'block' }}>
              Minimum stake: 1 CRISYS. You'll pay a 2.5% liquidity fee.
            </small>
          </div>

          {message && (
            <div className={`message message-${message.type}`}>
              {message.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className="btn" 
              onClick={handleStake}
              disabled={!stakeAmount || stakePrediction === null || isStaking}
            >
              {isStaking ? "Staking..." : `Stake ${stakeAmount || '0'} CRISYS`}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setSelectedMarket(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="component-container">
        <h2 className="component-title">📊 Market Statistics</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{markets.length}</div>
            <div className="stat-label">Total Markets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {markets.filter(m => !m.resolved && getTimeRemaining(m.resolutionTime) !== 'Expired').length}
            </div>
            <div className="stat-label">Active Markets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {markets.filter(m => m.resolved).length}
            </div>
            <div className="stat-label">Resolved Markets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {markets.reduce((total, m) => total + parseFloat(m.totalVolume), 0).toFixed(0)}
            </div>
            <div className="stat-label">Total Volume (CRISYS)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketList;
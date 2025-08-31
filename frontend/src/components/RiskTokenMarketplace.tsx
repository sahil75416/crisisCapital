import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useCrisisDEX } from "../hooks/useCrisisDEX";

interface RiskTokenMarketplaceProps {
  provider: ethers.BrowserProvider | null;
}

interface RiskToken {
  marketId: number;
  symbol: string;
  totalSupply: string;
  price: string;
  active: boolean;
}

interface MarketInfo {
  description: string;
  totalStaked: string;
  yesShares: string;
  noShares: string;
  resolved: boolean;
  outcome: boolean;
}

const RiskTokenMarketplace: React.FC<RiskTokenMarketplaceProps> = ({ provider }) => {
  const { contract } = useCrisisDEX(provider);
  const [riskTokens, setRiskTokens] = useState<RiskToken[]>([]);
  const [marketInfo, setMarketInfo] = useState<Map<number, MarketInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<RiskToken | null>(null);
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

  useEffect(() => {
    if (!contract) return;
    
    const loadRiskTokens = async () => {
      try {
        setLoading(true);
        
        const marketCount = await contract.marketCount();
        const tokens: RiskToken[] = [];
        const markets = new Map<number, MarketInfo>();
        
        for (let i = 1; i <= marketCount; i++) {
          try {
            const [token, market] = await Promise.all([
              contract.getRiskToken(i),
              contract.getMarketInfo(i)
            ]);
            
            tokens.push({
              marketId: i,
              symbol: token.symbol,
              totalSupply: ethers.formatEther(token.totalSupply),
              price: ethers.formatEther(token.price),
              active: token.active
            });
            
            markets.set(i, {
              description: market.description,
              totalStaked: ethers.formatEther(market.totalStaked),
              yesShares: ethers.formatEther(market.yesShares),
              noShares: ethers.formatEther(market.noShares),
              resolved: market.resolved,
              outcome: market.outcome
            });
          } catch (error) {
            console.error(`Failed to load market ${i}:`, error);
          }
        }
        
        setRiskTokens(tokens);
        setMarketInfo(markets);
      } catch (error) {
        console.error("Failed to load risk tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRiskTokens();
  }, [contract]);

  const handleTrade = async () => {
    if (!contract || !selectedToken || !tradeAmount) return;
    
    try {
      const amount = ethers.parseEther(tradeAmount);
      
      if (tradeType === "buy") {
        // Buy risk tokens
        const tx = await contract.stake(selectedToken.marketId, true, amount);
        await tx.wait();
        alert(`Successfully bought ${tradeAmount} CRISYS worth of ${selectedToken.symbol} tokens!`);
      } else {
        // Sell risk tokens (this would require additional contract logic)
        alert("Selling functionality coming soon!");
      }
      
      // Reset form
      setTradeAmount("");
      setSelectedToken(null);
      
    } catch (error: any) {
      console.error("Trade failed:", error);
      alert(`Trade failed: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading risk tokens...</div>;
  }

  return (
    <div>
      <div className="component-container">
        <h2 className="component-title">🪙 Risk Token Marketplace</h2>
        
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          Trade fractionalized risk tokens for any crisis market. Each token represents a share of the market's outcome.
        </p>

        {riskTokens.length === 0 ? (
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
            No risk tokens available. Create some markets first!
          </p>
        ) : (
          <div className="token-grid">
            {riskTokens.map((token) => {
              const market = marketInfo.get(token.marketId);
              return (
                <div key={token.marketId} className="token-card">
                  <div className="token-symbol">{token.symbol}</div>
                  <div className="token-price">{token.price} CRISYS</div>
                  
                  {market && (
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {market.description}
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ color: '#4ecdc4', fontWeight: '600' }}>{market.totalStaked}</div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>Total Staked</div>
                        </div>
                        <div>
                          <div style={{ color: '#4ecdc4', fontWeight: '600' }}>{token.totalSupply}</div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>Token Supply</div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ color: '#4ecdc4', fontWeight: '600' }}>{market.yesShares}</div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>YES Shares</div>
                        </div>
                        <div>
                          <div style={{ color: '#4ecdc4', fontWeight: '600' }}>{market.noShares}</div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>NO Shares</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn" 
                      onClick={() => setSelectedToken(token)}
                      disabled={!token.active || market?.resolved}
                    >
                      {market?.resolved ? 'Resolved' : 'Trade'}
                    </button>
                    <button className="btn btn-secondary">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trading Modal */}
      {selectedToken && (
        <div className="component-container">
          <h2 className="component-title">💱 Trade {selectedToken.symbol}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card">
              <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>Current Price</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                {selectedToken.price} CRISYS
              </div>
            </div>
            
            <div className="card">
              <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>Total Supply</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                {selectedToken.totalSupply}
              </div>
            </div>
            
            <div className="card">
              <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>Market Status</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: selectedToken.active ? '#4ecdc4' : '#ff6b6b' }}>
                {selectedToken.active ? 'Active' : 'Paused'}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <button 
              className={`hedge-option ${tradeType === 'buy' ? 'selected' : ''}`}
              onClick={() => setTradeType('buy')}
            >
              🟢 Buy Tokens
            </button>
            <button 
              className={`hedge-option ${tradeType === 'sell' ? 'selected' : ''}`}
              onClick={() => setTradeType('sell')}
            >
              🔴 Sell Tokens
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Amount ({tradeType === 'buy' ? 'CRISYS to spend' : 'Tokens to sell'})</label>
            <input
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              className="form-input"
              placeholder={tradeType === 'buy' ? "100" : "10"}
              min="0"
              step="0.01"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className="btn" 
              onClick={handleTrade}
              disabled={!tradeAmount}
            >
              {tradeType === 'buy' ? 'Buy Tokens' : 'Sell Tokens'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setSelectedToken(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="component-container">
        <h2 className="component-title">📚 How Risk Tokens Work</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>🎯 Fractional Ownership</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Each risk token represents a fractional share of a crisis market's outcome. 
              You can own as little as 0.01 of any market.
            </p>
          </div>
          
          <div className="card">
            <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>💰 Dynamic Pricing</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Token prices fluctuate based on market sentiment and the probability of 
              the crisis occurring. Higher risk = higher potential returns.
            </p>
          </div>
          
          <div className="card">
            <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>🔄 Liquidity Pools</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Each market has a liquidity pool that ensures you can always buy or sell 
              tokens at fair market prices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskTokenMarketplace;

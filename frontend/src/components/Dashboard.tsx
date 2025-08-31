import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useCrisisDEX } from "../hooks/useCrisisDEX";

interface DashboardProps {
  provider: ethers.BrowserProvider | null;
  account: string | null;
}

interface UserStats {
  totalStaked: string;
  totalWinnings: string;
  activeMarkets: number;
  marketsCreated: number;
}

const Dashboard: React.FC<DashboardProps> = ({ provider, account }) => {
  const { contract } = useCrisisDEX(provider);
  const [userStats, setUserStats] = useState<UserStats>({
    totalStaked: "0",
    totalWinnings: "0",
    activeMarkets: 0,
    marketsCreated: 0
  });
  const [recentMarkets, setRecentMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contract || !account) return;
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get user stats
        const [totalStaked, totalWinnings, userMarkets] = await Promise.all([
          contract.userTotalStaked(account),
          contract.userTotalWinnings(account),
          contract.getUserMarkets(account)
        ]);

        // Get recent markets (last 5)
        const marketCount = await contract.marketCount();
        const recentMarketIds = [];
        for (let i = Math.max(1, marketCount - 4); i <= marketCount; i++) {
          recentMarketIds.push(i);
        }
        
        const marketData = await Promise.all(
          recentMarketIds.map(id => contract.getMarketInfo(id))
        );

        setUserStats({
          totalStaked: ethers.formatEther(totalStaked),
          totalWinnings: ethers.formatEther(totalWinnings),
          activeMarkets: userMarkets.length,
          marketsCreated: userMarkets.length
        });
        
        setRecentMarkets(marketData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [contract, account]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="component-container">
        <h2 className="component-title">📊 Dashboard</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{userStats.totalStaked}</div>
            <div className="stat-label">Total Staked (CRISYS)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userStats.totalWinnings}</div>
            <div className="stat-label">Total Winnings (CRISYS)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userStats.activeMarkets}</div>
            <div className="stat-label">Active Markets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userStats.marketsCreated}</div>
            <div className="stat-label">Markets Created</div>
          </div>
        </div>
      </div>

      <div className="component-container">
        <h2 className="component-title">🎯 Recent Markets</h2>
        
        {recentMarkets.length === 0 ? (
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
            No markets found. Create the first one!
          </p>
        ) : (
          <div className="market-list">
            {recentMarkets.map((market, index) => (
              <div key={index} className="market-item">
                <div className="card-header">
                  <h3 className="card-title">{market.description}</h3>
                  <span className={`card-status ${market.resolved ? 'status-resolved' : 'status-active'}`}>
                    {market.resolved ? 'Resolved' : 'Active'}
                  </span>
                </div>
                
                <div className="market-stats">
                  <div className="market-stat">
                    <div className="market-stat-value">{ethers.formatEther(market.totalStaked)}</div>
                    <div className="market-stat-label">Total Staked</div>
                  </div>
                  <div className="market-stat">
                    <div className="market-stat-value">{ethers.formatEther(market.yesShares)}</div>
                    <div className="market-stat-label">YES Shares</div>
                  </div>
                  <div className="market-stat">
                    <div className="market-stat-value">{ethers.formatEther(market.noShares)}</div>
                    <div className="market-stat-label">NO Shares</div>
                  </div>
                  <div className="market-stat">
                    <div className="market-stat-value">
                      {new Date(Number(market.resolutionTime) * 1000).toLocaleDateString()}
                    </div>
                    <div className="market-stat-label">Resolution Date</div>
                  </div>
                </div>

                {!market.resolved && (
                  <div className="market-actions">
                    <button className="btn">View Details</button>
                    <button className="btn btn-secondary">Stake</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="component-container">
        <h2 className="component-title">🚀 Quick Actions</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button className="btn" style={{ padding: '1rem' }}>
            ➕ Create New Market
          </button>
          <button className="btn btn-secondary" style={{ padding: '1rem' }}>
            🪙 Browse Risk Tokens
          </button>
          <button className="btn btn-secondary" style={{ padding: '1rem' }}>
            🛡️ Setup Hedging
          </button>
          <button className="btn btn-secondary" style={{ padding: '1rem' }}>
            📊 View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useCrisisDEX } from "../hooks/useCrisisDEX";
import { useWallet } from "../hooks/useWallet"; // Add this import

interface HedgingWidgetProps {
  provider: ethers.BrowserProvider | null;
}

// AI Prediction Interface
interface RiskPrediction {
  crisisType: string;
  riskScore: number;
  confidence: number;
  predictedDelay: number;
  factors: RiskFactor[];
  recommendation: 'HEDGE' | 'MONITOR' | 'SAFE';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedLoss: number;
  timeToResolution: number;
}

interface RiskFactor {
  name: string;
  impact: number;
  description: string;
  trend: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
}

// AI Prediction Service (inline for simplicity)
class AIPredictionService {
  static async batchRiskAssessment(): Promise<RiskPrediction[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        crisisType: 'delivery_delay',
        riskScore: 75,
        confidence: 0.85,
        predictedDelay: 90,
        factors: [
          { name: 'Peak Hours', impact: 0.8, description: 'Rush hour congestion', trend: 'DETERIORATING' },
          { name: 'Weather', impact: 0.6, description: 'Adverse conditions', trend: 'STABLE' }
        ],
        recommendation: 'HEDGE',
        urgency: 'HIGH',
        estimatedLoss: 450,
        timeToResolution: 6
      },
      {
        crisisType: 'flight_delay',
        riskScore: 60,
        confidence: 0.78,
        predictedDelay: 45,
        factors: [
          { name: 'Airline Performance', impact: 0.7, description: 'Historical delays', trend: 'STABLE' },
          { name: 'Weather', impact: 0.5, description: 'Storm system', trend: 'DETERIORATING' }
        ],
        recommendation: 'MONITOR',
        urgency: 'MEDIUM',
        estimatedLoss: 300,
        timeToResolution: 4
      },
      {
        crisisType: 'transit_delay',
        riskScore: 85,
        confidence: 0.92,
        predictedDelay: 120,
        factors: [
          { name: 'System Maintenance', impact: 0.9, description: 'Scheduled work', trend: 'DETERIORATING' },
          { name: 'High Demand', impact: 0.8, description: 'Peak usage', trend: 'STABLE' }
        ],
        recommendation: 'HEDGE',
        urgency: 'CRITICAL',
        estimatedLoss: 600,
        timeToResolution: 8
      }
    ];
  }

  static getHedgingRecommendation(prediction: RiskPrediction) {
    const { riskScore, urgency, estimatedLoss } = prediction;
    
    let shouldHedge = false;
    let hedgeAmount = 0;
    let strategy = '';
    let reasoning = '';
    
    if (riskScore >= 80 && urgency === 'CRITICAL') {
      shouldHedge = true;
      hedgeAmount = estimatedLoss * 0.8;
      strategy = 'AGGRESSIVE_HEDGING';
      reasoning = 'Critical risk with high confidence - immediate hedging recommended';
    } else if (riskScore >= 65 && urgency === 'HIGH') {
      shouldHedge = true;
      hedgeAmount = estimatedLoss * 0.6;
      strategy = 'MODERATE_HEDGING';
      reasoning = 'High risk scenario - strategic hedging advised';
    } else if (riskScore >= 50 && urgency === 'MEDIUM') {
      shouldHedge = true;
      hedgeAmount = estimatedLoss * 0.4;
      strategy = 'CONSERVATIVE_HEDGING';
      reasoning = 'Moderate risk - limited hedging for protection';
    } else {
      shouldHedge = false;
      strategy = 'MONITOR_ONLY';
      reasoning = 'Risk below threshold - continue monitoring';
    }
    
    return { shouldHedge, hedgeAmount, strategy, reasoning };
  }
}

const HedgingWidget: React.FC<HedgingWidgetProps> = ({ provider }) => {
  const { contract, error: contractError } = useCrisisDEX(provider);
  const { account, currentNetwork, switchNetwork } = useWallet();
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [hedgeAmount, setHedgeAmount] = useState("");
  const [hedgeRecommendations, setHedgeRecommendations] = useState<any[]>([]);
  const [hedgingStatus, setHedgingStatus] = useState<string>("");
  const [selectedMarket, setSelectedMarket] = useState<number>(1);

  // Load AI predictions
  const loadPredictions = async () => {
    setLoading(true);
    try {
      const predictions = await AIPredictionService.batchRiskAssessment();
      setPredictions(predictions);
      
      const recommendations = predictions.map(pred => ({
        ...pred,
        hedging: AIPredictionService.getHedgingRecommendation(pred)
      }));
      setHedgeRecommendations(recommendations);
      
    } catch (error) {
      console.error('Failed to load AI predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  // Updated hedging function with better connection detection
  const handleHedge = async (prediction: RiskPrediction, marketId: number) => {
    // Check for wallet connection using the useWallet hook
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!provider) {
      alert('Wallet provider not available');
      return;
    }

    if (!contract) {
      alert('Smart contract not available. Please ensure you are connected to Base Sepolia testnet.');
      return;
    }

    // Check if on correct network (Base Sepolia)
    if (currentNetwork?.chainId !== "0x14a33") {
      alert('Please switch to Base Sepolia testnet to use hedging features');
      return;
    }

    if (!hedgeAmount || parseFloat(hedgeAmount) <= 0) {
      alert('Please enter a valid hedge amount');
      return;
    }

    try {
      setHedgingStatus('Processing hedge...');
      console.log('Starting hedge with:', { account, hedgeAmount, marketId });
      
      const signer = await provider.getSigner();
      const amount = ethers.parseEther(hedgeAmount);
      
      console.log('Creating hedge position...');
      
      // Create a hedge position by staking against the crisis
      // This creates a "NO" position (betting the crisis won't happen)
      const tx = await contract.stake(marketId, false, amount);
      
      setHedgingStatus('Confirming transaction...');
      console.log('Transaction sent:', tx.hash);
      
      await tx.wait();
      
      setHedgingStatus('Hedge successful! 🛡️');
      console.log('Transaction confirmed!');
      
      // Show success details
      const recommendation = AIPredictionService.getHedgingRecommendation(prediction);
      alert(`✅ Hedge Successful!\n\nAmount: ${hedgeAmount} ETH\nMarket: ${marketId}\nStrategy: ${recommendation.strategy}\n\nYour position is now protected against this risk!`);
      
      // Reset form
      setHedgeAmount("");
      setHedgingStatus("");
      
      // Refresh predictions
      loadPredictions();
      
    } catch (error) {
      console.error('Hedging failed:', error);
      setHedgingStatus('Hedging failed ❌');
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`Hedging failed: ${errorMessage}`);
    }
  };

  // Updated quick hedge function
  const handleQuickHedge = async (prediction: RiskPrediction, marketId: number) => {
    // Check for wallet connection
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    // Check if on correct network (Base Sepolia)
    if (currentNetwork?.chainId !== "0x14a33") {
      alert('Please switch to Base Sepolia testnet to use hedging features');
      return;
    }

    const recommendation = AIPredictionService.getHedgingRecommendation(prediction);
    
    if (!recommendation.shouldHedge) {
      alert('AI recommendation: No hedging needed at this risk level');
      return;
    }
    
    // Convert USD amount to ETH (simplified conversion)
    const ethAmount = (recommendation.hedgeAmount / 2000).toFixed(4); // Rough ETH conversion
    setHedgeAmount(ethAmount);
    
    // Auto-execute the hedge
    await handleHedge(prediction, marketId);
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return '#ef4444';
    if (riskScore >= 65) return '#f59e0b';
    if (riskScore >= 50) return '#eab308';
    if (riskScore >= 30) return '#22c55e';
    return '#10b981';
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return '';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '⚡';
      case 'LOW': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  if (loading) {
    return (
      <div className="component-container">
        <h2 className="component-title">🛡️ AI-Powered Hedging</h2>
        <div className="loading">Loading AI predictions...</div>
      </div>
    );
  }

  return (
    <div className="component-container">
      <h2 className="component-title">🛡️ AI-Powered Hedging</h2>
      <p className="component-description">
        Get AI-powered risk assessments and execute smart hedging strategies
      </p>

      {/* Wallet Status - Updated to use useWallet hook */}
      <div className="wallet-status">
        <div className={`status-indicator ${account ? 'connected' : 'disconnected'}`}>
          {account ? '🟢' : '🔴'} Wallet: {account ? 'Connected' : 'Not Connected'}
        </div>
        {account && (
          <div className="account-info">
            <span>Account: {account.slice(0, 6)}...{account.slice(-4)}</span>
            {currentNetwork && (
              <span>Network: {currentNetwork.name}</span>
            )}
          </div>
        )}
        
        {/* Contract Status */}
        <div className={`status-indicator ${contract ? 'connected' : 'disconnected'}`}>
          {contract ? '🟢' : '🔴'} Contract: {contract ? 'Connected' : 'Not Available'}
        </div>
        {contractError && (
          <div className="contract-error">
            <p>⚠️ Contract Error: {contractError}</p>
          </div>
        )}
        
        {!account && (
          <div className="wallet-install-prompt">
            <p>⚠️ Please connect your wallet to use hedging features</p>
            <p>Install <a href="https://wallet.coinbase.com/" target="_blank" rel="noopener noreferrer">Coinbase Wallet</a> if you haven't already</p>
          </div>
        )}
      </div>

      {/* Hedging Controls - Only show if wallet connected and on correct network */}
      {account && currentNetwork?.chainId === "0x14a33" ? (
        <div className="hedging-controls">
          <div className="control-group">
            <label>Select Market ID:</label>
            <select 
              value={selectedMarket} 
              onChange={(e) => setSelectedMarket(Number(e.target.value))}
              className="market-select"
            >
              <option value={1}>Market 1 - Delivery Crisis</option>
              <option value={2}>Market 2 - Flight Crisis</option>
              <option value={3}>Market 3 - Transit Crisis</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Hedge Amount (ETH):</label>
            <input
              type="number"
              step="0.001"
              placeholder="0.1"
              value={hedgeAmount}
              onChange={(e) => setHedgeAmount(e.target.value)}
              className="hedge-input"
            />
          </div>
          
          {hedgingStatus && (
            <div className="hedging-status">
              {hedgingStatus}
            </div>
          )}
        </div>
      ) : account && currentNetwork?.chainId !== "0x14a33" ? (
        <div className="network-required">
          <div className="network-warning">
            <p>⚠️ Please switch to Base Sepolia testnet to use hedging features</p>
            <p>Current network: {currentNetwork?.name || 'Unknown'}</p>
            <button 
              className="btn btn-primary"
              onClick={async () => {
                try {
                  console.log("🔄 Manually switching to Base Sepolia...");
                  const success = await switchNetwork("0x14a33");
                  if (success) {
                    console.log("✅ Successfully switched to Base Sepolia");
                  } else {
                    console.log("❌ Failed to switch to Base Sepolia");
                  }
                } catch (err) {
                  console.error("Network switch error:", err);
                }
              }}
              style={{ marginTop: '10px' }}
            >
              🌐 Switch to Base Sepolia
            </button>
          </div>
        </div>
      ) : (
        <div className="wallet-required">
          <h3>🔗 Wallet Required</h3>
          <p>Connect your wallet to start hedging against risks</p>
        </div>
      )}

      {/* AI Predictions Grid */}
      <div className="ai-predictions-grid">
        {hedgeRecommendations.map((rec, index) => (
          <div key={index} className="prediction-card">
            <div className="prediction-header">
              <h3>{rec.crisisType.replace('_', ' ').toUpperCase()}</h3>
              <div className="urgency-badge">
                {getUrgencyIcon(rec.urgency)} {rec.urgency}
              </div>
            </div>
            
            <div className="risk-score" style={{ backgroundColor: getRiskColor(rec.riskScore) }}>
              Risk Score: {rec.riskScore}/100
            </div>
            
            <div className="prediction-details">
              <div className="detail-item">
                <label>Confidence:</label>
                <span>{Math.round(rec.confidence * 100)}%</span>
              </div>
              
              <div className="detail-item">
                <label>Predicted Delay:</label>
                <span>{rec.predictedDelay} min</span>
              </div>
              
              <div className="detail-item">
                <label>Estimated Loss:</label>
                <span>${rec.estimatedLoss}</span>
              </div>
              
              <div className="detail-item">
                <label>Time to Resolution:</label>
                <span>{rec.timeToResolution} hours</span>
              </div>
            </div>
            
            <div className="hedging-recommendation">
              <h4>AI Recommendation: {rec.hedging.strategy}</h4>
              <p>{rec.hedging.reasoning}</p>
              
              {rec.hedging.shouldHedge ? (
                <div className="hedge-actions">
                  <button
                    onClick={() => handleQuickHedge(rec, selectedMarket)}
                    className="quick-hedge-button"
                    disabled={!account}
                  >
                    Quick Hedge (${rec.hedging.hedgeAmount.toFixed(0)})
                  </button>
                  
                  <div className="custom-hedge">
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Custom amount (ETH)"
                      value={hedgeAmount}
                      onChange={(e) => setHedgeAmount(e.target.value)}
                      className="custom-hedge-input"
                    />
                    <button
                      onClick={() => handleHedge(rec, selectedMarket)}
                      className="custom-hedge-button"
                      disabled={!account || !hedgeAmount}
                    >
                      🛡️ Custom Hedge
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-hedge">
                  <span className="safe-badge">✅ No Hedging Needed</span>
                  <p>Continue monitoring - risk is below threshold</p>
                </div>
              )}
            </div>
            
            <div className="risk-factors">
              <h4>Risk Factors:</h4>
              {rec.factors.map((factor, fIndex) => (
                <div key={fIndex} className="risk-factor">
                  <span className="factor-name">{factor.name}</span>
                  <span className="factor-impact">Impact: {Math.round(factor.impact * 100)}%</span>
                  <span className={`factor-trend ${factor.trend.toLowerCase()}`}>
                    {factor.trend}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* How Hedging Works */}
      <div className="hedging-explanation">
        <h3>💡 How Hedging Works</h3>
        <div className="explanation-grid">
          <div className="explanation-card">
            <h4>1. Risk Assessment</h4>
            <p>AI analyzes multiple factors to calculate risk scores</p>
          </div>
          <div className="explanation-card">
            <h4>2. Smart Recommendation</h4>
            <p>AI only suggests hedging when risk justifies the cost</p>
          </div>
          <div className="explanation-card">
            <h4>3. Execute Hedge</h4>
            <p>Create a position that profits if the crisis doesn't happen</p>
          </div>
          <div className="explanation-card">
            <h4>4. Risk Protection</h4>
            <p>Your hedge offsets potential losses from the crisis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HedgingWidget;
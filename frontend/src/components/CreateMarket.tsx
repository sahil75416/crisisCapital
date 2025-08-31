import React, { useState } from "react";
import { ethers } from "ethers";
import { useCrisisDEX } from "../hooks/useCrisisDEX";

interface CreateMarketProps {
  provider: ethers.BrowserProvider | null;
}

const CreateMarket: React.FC<CreateMarketProps> = ({ provider }) => {
  const { contract } = useCrisisDEX(provider);
  const [formData, setFormData] = useState({
    description: "",
    resolutionTime: "",
    initialLiquidity: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;

    try {
      setIsCreating(true);
      setMessage(null);

      // Calculate resolution time (current time + hours)
      const hours = parseInt(formData.resolutionTime);
      const resolutionTime = Math.floor(Date.now() / 1000) + (hours * 60 * 60);

      // Create market
      const tx = await contract.createMarket(formData.description, resolutionTime);
      await tx.wait();

      setMessage({
        type: 'success',
        text: `Market created successfully! Transaction: ${tx.hash}`
      });

      // Reset form
      setFormData({
        description: "",
        resolutionTime: "",
        initialLiquidity: ""
      });

    } catch (error: any) {
      console.error("Failed to create market:", error);
      setMessage({
        type: 'error',
        text: error.message || "Failed to create market"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const marketTemplates = [
    {
      title: "🚚 Delivery Delay",
      description: "Amazon Prime delivery will be delayed by more than 2 hours",
      hours: 8
    },
    {
      title: "✈️ Flight Delay",
      description: "Flight AA123 will be delayed by more than 30 minutes",
      hours: 12
    },
    {
      title: "🚇 Transit Issue",
      description: "NYC Subway Line 4 will have delays longer than 15 minutes",
      hours: 4
    },
    {
      title: "⚡ Power Outage",
      description: "Downtown area will experience power outage longer than 1 hour",
      hours: 6
    }
  ];

  const useTemplate = (template: typeof marketTemplates[0]) => {
    setFormData({
      description: template.description,
      resolutionTime: template.hours.toString(),
      initialLiquidity: "100"
    });
  };

  return (
    <div>
      <div className="component-container">
        <h2 className="component-title">➕ Create New Crisis Market</h2>
        
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          Create a new market to let users stake on real-world disruptions. 
          You'll need 100 CRISYS tokens to create a market.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Market Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Describe the crisis or disruption..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Resolution Time (hours from now)</label>
            <input
              type="number"
              name="resolutionTime"
              value={formData.resolutionTime}
              onChange={handleInputChange}
              className="form-input"
              placeholder="24"
              min="1"
              max="168"
              required
            />
            <small style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem', display: 'block' }}>
              Markets can resolve between 1 hour and 1 week from creation
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Liquidity (optional)</label>
            <input
              type="number"
              name="initialLiquidity"
              value={formData.initialLiquidity}
              onChange={handleInputChange}
              className="form-input"
              placeholder="100"
              min="0"
            />
            <small style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem', display: 'block' }}>
              Add initial liquidity to bootstrap trading (in CRISYS tokens)
            </small>
          </div>

          {message && (
            <div className={`message message-${message.type}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            className="btn" 
            disabled={isCreating || !contract}
            style={{ marginTop: '1rem' }}
          >
            {isCreating ? "Creating Market..." : "Create Market"}
          </button>
        </form>
      </div>

      <div className="component-container">
        <h2 className="component-title">📋 Market Templates</h2>
        
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1.5rem' }}>
          Use these templates to quickly create common crisis markets:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {marketTemplates.map((template, index) => (
            <div key={index} className="card" style={{ cursor: 'pointer' }} onClick={() => useTemplate(template)}>
              <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>{template.title}</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {template.description}
              </p>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                Resolves in {template.hours} hours
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="component-container">
        <h2 className="component-title">💡 Market Creation Tips</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>🎯 Be Specific</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Clear, measurable criteria make markets easier to resolve and more attractive to traders.
            </p>
          </div>
          
          <div className="card">
            <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>⏰ Choose Resolution Time Wisely</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Balance between giving enough time for resolution and maintaining trader interest.
            </p>
          </div>
          
          <div className="card">
            <h3 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>💰 Add Initial Liquidity</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Bootstrap your market with initial liquidity to attract more traders and increase volume.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMarket;

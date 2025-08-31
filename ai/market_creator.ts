import { ethers } from 'ethers';
import CrisisDEXArtifact from '../artifacts/contracts/CrisisDEX.sol/CrisisDEX.json';

interface MarketCreationParams {
  description: string;
  resolutionTime: number;
  initialLiquidity?: number;
  crisisData: any;
}

export class MarketCreationService {
  private contract: ethers.Contract;
  private signer: ethers.Signer;
  
  constructor(contractAddress: string, signer: ethers.Signer) {
    this.signer = signer;
    this.contract = new ethers.Contract(contractAddress, CrisisDEXArtifact.abi, signer);
  }

  /**
   * Create a crisis market from AI prediction
   */
  async createCrisisMarket(params: MarketCreationParams): Promise<string> {
    try {
      console.log(`🎯 Creating market: ${params.description}`);
      
      // Create market on blockchain
      const tx = await this.contract.createMarket(
        params.description,
        params.resolutionTime
      );
      
      await tx.wait();
      console.log(`✅ Market created! TX: ${tx.hash}`);
      
      // Get the market ID from events
      const marketId = await this.getLatestMarketId();
      
      // Add initial liquidity if specified
      if (params.initialLiquidity && params.initialLiquidity > 0) {
        await this.addInitialLiquidity(marketId, params.initialLiquidity, params.crisisData.probability);
      }
      
      return marketId;
    } catch (error) {
      console.error('Failed to create market:', error);
      throw error;
    }
  }

  /**
   * Create market from delivery crisis
   */
  async createDeliveryMarket(deliveryData: any): Promise<string> {
    const description = `${deliveryData.carrier.toUpperCase()} package ${deliveryData.tracking_number} delayed >${deliveryData.predicted_delay}min`;
    const resolutionTime = Math.floor(Date.now() / 1000) + (8 * 60 * 60); // Resolve in 8 hours
    
    return await this.createCrisisMarket({
      description,
      resolutionTime,
      initialLiquidity: 1000, // 1000 CRISYS tokens
      crisisData: deliveryData
    });
  }

  /**
   * Create market from flight crisis
   */
  async createFlightMarket(flightData: any): Promise<string> {
    const description = `Flight delay >${flightData.predicted_delay}min - Confidence ${Math.round(flightData.confidence * 100)}%`;
    const resolutionTime = Math.floor(Date.now() / 1000) + (12 * 60 * 60); // Resolve in 12 hours
    
    return await this.createCrisisMarket({
      description,
      resolutionTime,
      initialLiquidity: 1500, // 1500 CRISYS tokens
      crisisData: flightData
    });
  }

  /**
   * Create market from transit crisis
   */
  async createTransitMarket(transitData: any): Promise<string> {
    const description = `${transitData.system.toUpperCase()} ${transitData.line} delayed >${transitData.predicted_delay}min`;
    const resolutionTime = Math.floor(Date.now() / 1000) + (4 * 60 * 60); // Resolve in 4 hours
    
    return await this.createCrisisMarket({
      description,
      resolutionTime,
      initialLiquidity: 800, // 800 CRISYS tokens
      crisisData: transitData
    });
  }

  /**
   * Add initial liquidity to bootstrap trading
   */
  private async addInitialLiquidity(marketId: string, amount: number, probability: number): Promise<void> {
    try {
      const yesAmount = Math.floor(amount * probability);
      const noAmount = amount - yesAmount;
      
      // Approve tokens
      await this.contract.approve(await this.contract.getAddress(), ethers.parseEther(amount.toString()));
      
      // Stake on YES side
      if (yesAmount > 0) {
        await this.contract.stake(marketId, true, ethers.parseEther(yesAmount.toString()));
      }
      
      // Stake on NO side
      if (noAmount > 0) {
        await this.contract.stake(marketId, false, ethers.parseEther(noAmount.toString()));
      }
      
      console.log(`💰 Added liquidity: ${yesAmount} YES, ${noAmount} NO`);
    } catch (error) {
      console.error('Failed to add liquidity:', error);
    }
  }

  /**
   * Get the latest market ID
   */
  private async getLatestMarketId(): Promise<string> {
    const marketCount = await this.contract.marketCount();
    return marketCount.toString();
  }

  /**
   * Resolve a market based on real-world outcome
   */
  async resolveMarket(marketId: string, outcome: boolean, reason?: string): Promise<void> {
    try {
      console.log(`🏁 Resolving market ${marketId} with outcome: ${outcome ? 'YES' : 'NO'}`);
      if (reason) console.log(`📝 Reason: ${reason}`);
      
      const tx = await this.contract.resolveMarket(marketId, outcome);
      await tx.wait();
      
      console.log(`✅ Market ${marketId} resolved! TX: ${tx.hash}`);
    } catch (error) {
      console.error('Failed to resolve market:', error);
      throw error;
    }
  }

  /**
   * Auto-resolve markets based on real-world data
   */
  async autoResolveMarkets(): Promise<void> {
    // This would check real APIs to verify outcomes
    // For demo, we'll simulate resolution
    console.log('🤖 Auto-resolving markets based on real data...');
    
    // Implementation would:
    // 1. Get all active markets
    // 2. Check resolution time
    // 3. Verify actual outcomes from APIs
    // 4. Resolve markets accordingly
  }
}
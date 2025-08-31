// Simplified market creation service for the API

export class MarketCreationService {
  private marketCount = 0;
  
  constructor() {
    console.log('🎯 Market Creation Service initialized');
  }

  /**
   * Create a crisis market from AI prediction
   */
  async createCrisisMarket(params: any): Promise<string> {
    try {
      console.log(`🎯 Creating market: ${params.description}`);
      
      // Simulate market creation
      const marketId = (++this.marketCount).toString();
      
      console.log(`✅ Market created! ID: ${marketId}`);
      
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
    
    return await this.createCrisisMarket({
      description,
      resolutionTime: Math.floor(Date.now() / 1000) + (8 * 60 * 60),
      initialLiquidity: 1000,
      crisisData: deliveryData
    });
  }

  /**
   * Create market from flight crisis
   */
  async createFlightMarket(flightData: any): Promise<string> {
    const description = `Flight delay >${flightData.predicted_delay}min - Confidence ${Math.round(flightData.confidence * 100)}%`;
    
    return await this.createCrisisMarket({
      description,
      resolutionTime: Math.floor(Date.now() / 1000) + (12 * 60 * 60),
      initialLiquidity: 1500,
      crisisData: flightData
    });
  }

  /**
   * Create market from transit crisis
   */
  async createTransitMarket(transitData: any): Promise<string> {
    const description = `${transitData.system.toUpperCase()} ${transitData.line} delayed >${transitData.predicted_delay}min`;
    
    return await this.createCrisisMarket({
      description,
      resolutionTime: Math.floor(Date.now() / 1000) + (4 * 60 * 60),
      initialLiquidity: 800,
      crisisData: transitData
    });
  }

  /**
   * Get market count
   */
  getMarketCount(): number {
    return this.marketCount;
  }
}

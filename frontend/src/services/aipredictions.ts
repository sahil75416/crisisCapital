export interface RiskPrediction {
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
  
  export interface RiskFactor {
    name: string;
    impact: number;
    description: string;
    trend: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
  }
  
  export class AIPredictionService {
    // Simulate AI predictions (replace with real API calls later)
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
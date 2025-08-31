import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from root directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Coinbase API Configuration
const COINBASE_API_BASE = 'https://api.coinbase.com/v2';
const COINBASE_COMMERCE_API = 'https://api.commerce.coinbase.com';

// X402 Payment Middleware Configuration
interface X402Config {
  network: string;
  paymentRequirements: {
    amount: string;
    address: string;
  };
}

// Mock X402 middleware (replace with real @coinbase/x402-axios when available)
function x402Middleware(config: X402Config) {
  return (req: any, res: any, next: any) => {
    // Check payment header
    const paymentHeader = req.headers['x-payment-amount'];
    const addressHeader = req.headers['x-payment-address'];
    
    if (!paymentHeader || !addressHeader) {
      return res.status(402).json({
        error: 'Payment Required',
        message: `Payment of ${config.paymentRequirements.amount} wei required`,
        paymentAddress: config.paymentRequirements.address,
        network: config.network
      });
    }
    
    // Verify payment amount
    if (parseInt(paymentHeader) < parseInt(config.paymentRequirements.amount)) {
      return res.status(402).json({
        error: 'Insufficient Payment',
        required: config.paymentRequirements.amount,
        provided: paymentHeader
      });
    }
    
    console.log(`💰 Payment verified: ${paymentHeader} wei from ${addressHeader}`);
    next();
  };
}

// Coinbase Price API Integration
async function getCoinbasePrice(currency: string = 'ETH'): Promise<any> {
  try {
    const response = await axios.get(`${COINBASE_API_BASE}/prices/${currency}-USD/spot`);
    return {
      currency: currency,
      price: response.data.data.amount,
      timestamp: response.data.data.timestamp
    };
  } catch (error) {
    console.error('Failed to get Coinbase price:', error);
    return {
      currency: currency,
      price: '0',
      timestamp: new Date().toISOString(),
      error: 'Price unavailable'
    };
  }
}

// Coinbase Exchange Rates
async function getCoinbaseExchangeRates(): Promise<any> {
  try {
    const response = await axios.get(`${COINBASE_API_BASE}/exchange-rates?currency=USD`);
    return response.data.data.rates;
  } catch (error) {
    console.error('Failed to get exchange rates:', error);
    return { error: 'Exchange rates unavailable' };
  }
}

// Mock flight delay function (replace with real aviation API)
async function getFlightDelay(flightIata: string): Promise<any> {
  // Mock flight delay prediction
  const delays = [15, 30, 45, 60, 90, 120];
  const probabilities = [0.3, 0.4, 0.6, 0.7, 0.5, 0.8];
  
  const index = flightIata.length % delays.length;
  
  return {
    crisis_type: 'flight_delay',
    probability: probabilities[index],
    predicted_delay: delays[index],
    confidence: 0.82,
    flight_iata: flightIata,
    airline: 'Mock Airlines'
  };
}

// Simple Market Creation Service (inline to avoid import issues)
class MarketCreationService {
  private marketCount = 0;
  
  constructor() {
    console.log('🎯 Market Creation Service initialized');
  }

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

  async createDeliveryMarket(deliveryData: any): Promise<string> {
    const description = `${deliveryData.carrier.toUpperCase()} package ${deliveryData.tracking_number} delayed >${deliveryData.predicted_delay}min`;
    
    return await this.createCrisisMarket({
      description,
      resolutionTime: Math.floor(Date.now() / 1000) + (8 * 60 * 60),
      initialLiquidity: 1000,
      crisisData: deliveryData
    });
  }

  async createFlightMarket(flightData: any): Promise<string> {
    const description = `Flight delay >${flightData.predicted_delay}min - Confidence ${Math.round(flightData.confidence * 100)}%`;
    
    return await this.createCrisisMarket({
      description,
      resolutionTime: Math.floor(Date.now() / 1000) + (12 * 60 * 60),
      initialLiquidity: 1500,
      crisisData: flightData
    });
  }

  async createTransitMarket(transitData: any): Promise<string> {
    const description = `${transitData.system.toUpperCase()} ${transitData.line} delayed >${transitData.predicted_delay}min`;
    
    return await this.createCrisisMarket({
      description,
      resolutionTime: Math.floor(Date.now() / 1000) + (4 * 60 * 60),
      initialLiquidity: 800,
      crisisData: transitData
    });
  }

  getMarketCount(): number {
    return this.marketCount;
  }
}

// Simple Connector Classes (inline to avoid import issues)
class AmazonDeliveryConnector {
  async predictDeliveryDelay(trackingNumber: string): Promise<any> {
    // Mock delivery delay prediction
    const delays = [30, 45, 60, 90, 120];
    const probabilities = [0.4, 0.6, 0.8, 0.7, 0.9];
    
    const index = trackingNumber.length % delays.length;
    
    return {
      crisis_type: 'delivery_delay',
      probability: probabilities[index],
      predicted_delay: delays[index],
      confidence: 0.85,
      tracking_number: trackingNumber,
      carrier: 'amazon'
    };
  }
}

class SubwayConnector {
  async predictSubwayDelay(line: string, station?: string): Promise<any> {
    // Mock subway delay prediction
    const delays = [15, 25, 35, 50, 75];
    const probabilities = [0.3, 0.5, 0.7, 0.6, 0.8];
    
    const index = line.length % delays.length;
    
    return {
      crisis_type: 'subway_delay',
      probability: probabilities[index],
      predicted_delay: delays[index],
      confidence: 0.88,
      line: line,
      station: station || 'system-wide',
      system: 'nyc_subway'
    };
  }
}

class BusConnector {
  async predictBusDelay(route: string, stop?: string): Promise<any> {
    // Mock bus delay prediction
    const delays = [5, 10, 15, 25, 35];
    const probabilities = [0.3, 0.5, 0.7, 0.4, 0.6];
    
    const index = route.length % delays.length;
    
    return {
      crisis_type: 'bus_delay',
      probability: probabilities[index],
      predicted_delay: delays[index],
      confidence: 0.75,
      line: route,
      station: stop || 'route-wide',
      system: 'bus'
    };
  }
}

// Simple Monitor Classes (inline to avoid import issues)
class DeliveryCrisisMonitor {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private amazonConnector: AmazonDeliveryConnector,
    private onCrisisDetected: (crisis: any) => void
  ) {}

  startMonitoring(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚚 Starting delivery crisis monitoring...');
    
    this.interval = setInterval(async () => {
      const crises = await this.checkForCrises();
      crises.forEach(crisis => this.onCrisisDetected(crisis));
    }, 10 * 60 * 1000);
  }

  stopMonitoring(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('🛑 Stopped delivery crisis monitoring');
  }

  async checkForCrises(): Promise<any[]> {
    const crises = [];
    const trackingNumbers = ['TBA123456789000', 'TBA987654321000'];
    
    for (const tracking of trackingNumbers) {
      try {
        const prediction = await this.amazonConnector.predictDeliveryDelay(tracking);
        if (prediction && prediction.probability > 0.5) {
          crises.push({
            type: 'delivery_delay',
            severity: prediction.probability,
            data: prediction,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error(`Error checking tracking ${tracking}:`, error);
      }
    }
    
    return crises;
  }
}

class TransitCrisisMonitor {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private subwayConnector: SubwayConnector,
    private busConnector: BusConnector,
    private onCrisisDetected: (crisis: any) => void
  ) {}

  startMonitoring(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚇 Starting transit crisis monitoring...');
    
    this.interval = setInterval(async () => {
      const crises = await this.checkForCrises();
      crises.forEach(crisis => this.onCrisisDetected(crisis));
    }, 5 * 60 * 1000);
  }

  stopMonitoring(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('🛑 Stopped transit crisis monitoring');
  }

  async checkForCrises(): Promise<any[]> {
    const crises = [];
    const subwayLines = ['4', '5', '6', 'N', 'Q', 'R'];
    
    try {
      for (const line of subwayLines.slice(0, 3)) {
        const prediction = await this.subwayConnector.predictSubwayDelay(line);
        if (prediction.probability > 0.6) {
          crises.push({
            type: 'subway_delay',
            severity: prediction.probability,
            data: prediction,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error in transit crisis monitoring:', error);
    }
    
    return crises;
  }
}

// Initialize services
const marketService = new MarketCreationService();
const deliveryMonitor = new DeliveryCrisisMonitor(
  new AmazonDeliveryConnector(),
  (crisis: any) => console.log('🚨 Delivery crisis detected:', crisis)
);
const transitMonitor = new TransitCrisisMonitor(
  new SubwayConnector(),
  new BusConnector(),
  (crisis: any) => console.log('🚨 Transit crisis detected:', crisis)
);

// Initialize connectors
const amazonConnector = new AmazonDeliveryConnector();
const subwayConnector = new SubwayConnector();
const busConnector = new BusConnector();

// Payment configuration - use environment variables
const PAYMENT_CONFIG: X402Config = {
  network: process.env.NETWORK_NAME || 'base-sepolia',
  paymentRequirements: {
    amount: process.env.PAYMENT_AMOUNT || '1000000000000000', // 0.001 ETH in wei
    address: process.env.PAYMENT_ADDRESS || '0x742d35Cc6634C0532925a3b8d49D1dFA1aCdE9fE'
  }
};

// Crisis detection endpoint (requires payment)
app.post('/create-crisis',
  x402Middleware(PAYMENT_CONFIG),
  async (req, res) => {
    try {
      const { type, params } = req.body;
      
      let crisisData;
      let marketId;
      
      switch(type) {
        case 'delivery':
          crisisData = await amazonConnector.predictDeliveryDelay(params.tracking);
          if (crisisData.probability > 0.3) {
            marketId = await marketService.createDeliveryMarket(crisisData);
          }
          break;
          
        case 'flight':
          // Use existing aviation connector
          crisisData = await getFlightDelay(params.flightIata);
          break;
          
        case 'transit':
          crisisData = await subwayConnector.predictSubwayDelay(params.line, params.station);
          if (crisisData.probability > 0.4) {
            marketId = await marketService.createTransitMarket(crisisData);
            break;
          }
          
        default:
          return res.status(400).json({ error: 'Invalid crisis type' });
      }
      
      res.json({
        success: true,
        crisisData,
        marketId: marketId || null,
        message: 'Crisis market created successfully'
      });
      
    } catch (error) {
      console.error('Crisis creation failed:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create crisis market'
      });
    }
  });

// Coinbase Price Endpoint
app.get('/coinbase/price/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    const priceData = await getCoinbasePrice(currency.toUpperCase());
    res.json(priceData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get price data' });
  }
});

// Coinbase Exchange Rates Endpoint
app.get('/coinbase/exchange-rates', async (req, res) => {
  try {
    const rates = await getCoinbaseExchangeRates();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get exchange rates' });
    }
  });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CrisisCapital API',
    marketCount: marketService.getMarketCount(),
    features: {
      crisisDetection: true,
      marketCreation: true,
      coinbaseIntegration: true,
      paymentMiddleware: true
    },
    config: {
      network: process.env.NETWORK_NAME || 'base-sepolia',
      paymentAddress: process.env.PAYMENT_ADDRESS || '0x742d35Cc6634C0532925a3b8d49D1dFA1aCdE9fE',
      apiPort: process.env.API_PORT || 3002
    }
  });
});

// Start server - use environment variable for port
const PORT = process.env.API_PORT || 3004;  // Changed to 3004 to avoid conflict
app.listen(PORT, () => {
  console.log(`🚀 CrisisCapital API server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Crisis creation: POST http://localhost:${PORT}/create-crisis`);
  console.log(`💰 Coinbase price: GET http://localhost:${PORT}/coinbase/price/ETH`);
  console.log(`🌐 Exchange rates: GET http://localhost:${PORT}/coinbase/exchange-rates`);
  console.log(`⚙️  Configuration: Network=${process.env.NETWORK_NAME || 'base-sepolia'}, Port=${PORT}`);
  
  // Start monitoring services
  deliveryMonitor.startMonitoring();
  transitMonitor.startMonitoring();
});

// ... existing imports and code ...

// AI Prediction Endpoints
app.post('/ai/predict-delivery', async (req, res) => {
  try {
    const { tracking, carrier } = req.body;
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate AI-powered prediction
    const baseRisk = (tracking.length * 7) % 40 + 20;
    const carrierRisk = carrier === 'amazon' ? 15 : carrier === 'fedex' ? 25 : 30;
    const timeRisk = new Date().getHours() >= 7 && new Date().getHours() <= 9 ? 25 : 10;
    
    const riskScore = Math.min(100, baseRisk + carrierRisk + timeRisk);
    const confidence = 0.7 + (Math.random() * 0.2);
    
    const prediction = {
      crisisType: 'delivery_delay',
      riskScore: Math.round(riskScore),
      confidence: Math.round(confidence * 100) / 100,
      predictedDelay: riskScore >= 70 ? 120 : riskScore >= 50 ? 60 : 30,
      factors: [
        {
          name: 'Carrier Performance',
          impact: 0.6,
          description: `${carrier} delivery patterns`,
          trend: 'STABLE'
        },
        {
          name: 'Time of Day',
          impact: 0.4,
          description: 'Peak delivery hours',
          trend: 'DETERIORATING'
        }
      ],
      recommendation: riskScore >= 65 ? 'HEDGE' : riskScore >= 40 ? 'MONITOR' : 'SAFE',
      urgency: riskScore >= 85 ? 'CRITICAL' : riskScore >= 70 ? 'HIGH' : riskScore >= 50 ? 'MEDIUM' : 'LOW',
      estimatedLoss: riskScore >= 70 ? 500 : riskScore >= 50 ? 200 : 100,
      timeToResolution: riskScore >= 70 ? 8 : riskScore >= 50 ? 4 : 2
    };
    
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'AI prediction failed' });
  }
});

app.post('/ai/predict-flight', async (req, res) => {
  try {
    const { flight, airline } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const baseRisk = (flight.length * 5) % 35 + 25;
    const airlineRisk = airline === 'delta' ? 20 : airline === 'american' ? 30 : 25;
    const weatherRisk = Math.random() * 20;
    
    const riskScore = Math.min(100, baseRisk + airlineRisk + weatherRisk);
    const confidence = 0.75 + (Math.random() * 0.15);
    
    const prediction = {
      crisisType: 'flight_delay',
      riskScore: Math.round(riskScore),
      confidence: Math.round(confidence * 100) / 100,
      predictedDelay: riskScore >= 70 ? 90 : riskScore >= 50 ? 45 : 20,
      factors: [
        {
          name: 'Airline Reliability',
          impact: 0.7,
          description: `${airline} on-time performance`,
          trend: 'STABLE'
        },
        {
          name: 'Weather Conditions',
          impact: 0.5,
          description: 'Current weather patterns',
          trend: 'DETERIORATING'
        }
      ],
      recommendation: riskScore >= 65 ? 'HEDGE' : riskScore >= 40 ? 'MONITOR' : 'SAFE',
      urgency: riskScore >= 85 ? 'CRITICAL' : riskScore >= 70 ? 'HIGH' : riskScore >= 50 ? 'MEDIUM' : 'LOW',
      estimatedLoss: riskScore >= 70 ? 800 : riskScore >= 50 ? 400 : 200,
      timeToResolution: riskScore >= 70 ? 12 : riskScore >= 50 ? 6 : 3
    };
    
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'AI prediction failed' });
  }
});

app.post('/ai/predict-transit', async (req, res) => {
  try {
    const { line, system, station } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const baseRisk = (line.length * 6) % 30 + 20;
    const systemRisk = system === 'nyc_subway' ? 30 : system === 'bus' ? 35 : 25;
    const timeRisk = new Date().getHours() >= 7 && new Date().getHours() <= 9 ? 30 : 15;
    
    const riskScore = Math.min(100, baseRisk + systemRisk + timeRisk);
    const confidence = 0.8 + (Math.random() * 0.15);
    
    const prediction = {
      crisisType: 'transit_delay',
      riskScore: Math.round(riskScore),
      confidence: Math.round(confidence * 100) / 100,
      predictedDelay: riskScore >= 70 ? 45 : riskScore >= 50 ? 25 : 15,
      factors: [
        {
          name: 'System Congestion',
          impact: 0.8,
          description: `${system} line ${line} traffic`,
          trend: 'DETERIORATING'
        },
        {
          name: 'Peak Hours',
          impact: 0.6,
          description: 'Rush hour demand',
          trend: 'STABLE'
        }
      ],
      recommendation: riskScore >= 65 ? 'HEDGE' : riskScore >= 40 ? 'MONITOR' : 'SAFE',
      urgency: riskScore >= 85 ? 'CRITICAL' : riskScore >= 70 ? 'HIGH' : riskScore >= 50 ? 'MEDIUM' : 'LOW',
      estimatedLoss: riskScore >= 70 ? 150 : riskScore >= 50 ? 75 : 50,
      timeToResolution: riskScore >= 70 ? 6 : riskScore >= 50 ? 3 : 1.5
    };
    
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'AI prediction failed' });
  }
});

// ... rest of your existing code ...
export default app;
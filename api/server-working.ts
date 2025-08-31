import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mock crisis data for testing
const mockCrisisData = {
  delivery: {
    crisis_type: 'delivery_delay',
    probability: 0.75,
    predicted_delay: 45,
    confidence: 0.85,
    tracking_number: 'TEST123',
    carrier: 'amazon'
  },
  transit: {
    crisis_type: 'subway_delay',
    probability: 0.6,
    predicted_delay: 30,
    confidence: 0.88,
    line: 'A',
    station: 'Times Square',
    system: 'nyc_subway'
  }
};

// Crisis detection endpoint (mock version)
app.post('/create-crisis', async (req, res) => {
  try {
    const { type, params } = req.body;
    
    let crisisData;
    
    switch(type) {
      case 'delivery':
        crisisData = mockCrisisData.delivery;
        break;
        
      case 'transit':
        crisisData = mockCrisisData.transit;
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid crisis type' });
    }
    
    res.json({
      success: true,
      crisisData,
      marketId: `mock-${Date.now()}`,
      message: 'Mock crisis market created successfully'
    });
    
  } catch (error) {
    console.error('Crisis creation failed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create crisis market'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CrisisCapital API (Mock Mode)'
  });
});

// Test crisis creation
app.get('/test-crisis', (req, res) => {
  res.json({
    message: 'Test crisis creation endpoints',
    endpoints: {
      'POST /create-crisis': 'Create a crisis market',
      'GET /health': 'Health check',
      'GET /test-crisis': 'This help message'
    },
    examples: {
      delivery: {
        type: 'delivery',
        params: { tracking: 'TEST123' }
      },
      transit: {
        type: 'transit',
        params: { line: 'A', station: 'Times Square' }
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 CrisisCapital API server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test crisis: http://localhost:${PORT}/test-crisis`);
  console.log(`🔗 Crisis creation: POST http://localhost:${PORT}/create-crisis`);
  console.log(`📝 Mode: Mock (no blockchain integration yet)`);
});

export default app;
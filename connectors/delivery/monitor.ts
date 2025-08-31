import axios from 'axios';

interface DeliveryMonitor {
  startMonitoring(): void;
  stopMonitoring(): void;
  checkForCrises(): Promise<any[]>;
}

export class DeliveryCrisisMonitor implements DeliveryMonitor {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private amazonConnector: any,
    private upsConnector: any,
    private fedexConnector: any,
    private onCrisisDetected: (crisis: any) => void
  ) {}

  startMonitoring(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚚 Starting delivery crisis monitoring...');
    
    // Check every 10 minutes for delivery crises
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
    
    // Sample tracking numbers for demo
    const trackingNumbers = [
      '1Z999AA1234567890',  // UPS
      '1234567890123456',   // FedEx  
      'TBA123456789000',    // Amazon
      '9400109699939901234567890' // USPS
    ];

    for (const tracking of trackingNumbers) {
      try {
        // Determine carrier and check for delays
        let prediction;
        if (tracking.startsWith('1Z')) {
          prediction = await this.upsConnector.predictDeliveryDelay(tracking);
        } else if (tracking.length === 12) {
          prediction = await this.fedexConnector.predictDeliveryDelay(tracking);
        } else if (tracking.startsWith('TBA')) {
          prediction = await this.amazonConnector.predictDeliveryDelay(tracking);
        }

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
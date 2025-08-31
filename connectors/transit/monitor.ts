interface TransitMonitor {
  startMonitoring(): void;
  stopMonitoring(): void;
  checkForCrises(): Promise<any[]>;
}

export class TransitCrisisMonitor implements TransitMonitor {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private subwayConnector: any,
    private busConnector: any,
    private trainConnector: any,
    private onCrisisDetected: (crisis: any) => void
  ) {}

  startMonitoring(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚇 Starting transit crisis monitoring...');
    
    // Check every 5 minutes for transit crises
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
    
    // Monitor major NYC subway lines
    const subwayLines = ['4', '5', '6', 'N', 'Q', 'R', 'W', 'A', 'C', 'E', 'L'];
    const busRoutes = ['M15', 'M34', 'B46', 'Bx12'];
    const railLines = ['LIRR-Main', 'NJT-Northeast'];

    try {
      // Check subway lines
      for (const line of subwayLines.slice(0, 3)) { // Check first 3 for demo
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

      // Check bus routes
      for (const route of busRoutes.slice(0, 2)) { // Check first 2 for demo
        const prediction = await this.busConnector.predictBusDelay(route);
        if (prediction.probability > 0.5) {
          crises.push({
            type: 'bus_delay',
            severity: prediction.probability,
            data: prediction,
            timestamp: new Date()
          });
        }
      }

      // Check rail lines
      for (const line of railLines) {
        const prediction = await this.trainConnector.predictTrainDelay(line);
        if (prediction.probability > 0.5) {
          crises.push({
            type: 'train_delay',
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
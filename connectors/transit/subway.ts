import axios from 'axios';

interface TransitPrediction {
  crisis_type: string;
  probability: number;
  predicted_delay: number;
  confidence: number;
  line: string;
  station: string;
  system: string;
}

export class SubwayConnector {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.MTA_API_KEY || '';
  }

  /**
   * Predict NYC Subway delays
   */
  async predictSubwayDelay(line: string, station?: string): Promise<TransitPrediction> {
    try {
      // Mock MTA API call (replace with real GTFS-RT feed)
      const mockData = this.generateMockSubwayData(line, station);
      
      const delayMinutes = this.calculateTransitDelay(mockData);
      const probability = this.calculateDelayProbability(mockData);
      
      return {
        crisis_type: 'subway_delay',
        probability: probability,
        predicted_delay: delayMinutes,
        confidence: 0.88,
        line: line,
        station: station || 'system-wide',
        system: 'nyc_subway'
      };
    } catch (error) {
      console.error('Subway prediction failed:', error);
      return {
        crisis_type: 'subway_delay',
        probability: 0,
        predicted_delay: 0,
        confidence: 0,
        line: line,
        station: station || 'unknown',
        system: 'nyc_subway'
      };
    }
  }

  /**
   * Monitor multiple subway lines
   */
  async monitorLines(lines: string[]): Promise<TransitPrediction[]> {
    const predictions = await Promise.all(
      lines.map(line => this.predictSubwayDelay(line))
    );
    
    // Filter significant delays
    return predictions.filter(pred => pred.probability > 0.4);
  }

  private generateMockSubwayData(line: string, station?: string) {
    const issues = [
      { type: 'signal_problems', severity: 'major', affected_stations: 12 },
      { type: 'train_traffic', severity: 'minor', affected_stations: 3 },
      { type: 'sick_passenger', severity: 'moderate', affected_stations: 8 },
      { type: 'police_activity', severity: 'major', affected_stations: 15 },
      { type: 'mechanical_problems', severity: 'severe', affected_stations: 20 }
    ];
    
    // Pseudo-random issue based on line
    const index = line.charCodeAt(0) % issues.length;
    const issue = issues[index];
    
    return {
      line: line,
      station: station,
      current_issue: issue,
      weather: ['clear', 'rainy', 'snowy'][Math.floor(Math.random() * 3)],
      time_of_day: this.getTimeOfDay(),
      ridership: this.getRidershipLevel()
    };
  }

  private calculateTransitDelay(data: any): number {
    let delayMinutes = 0;
    
    // Issue severity impact
    switch (data.current_issue.severity) {
      case 'minor': delayMinutes += 5; break;
      case 'moderate': delayMinutes += 15; break;
      case 'major': delayMinutes += 30; break;
      case 'severe': delayMinutes += 60; break;
    }
    
    // Weather impact
    if (data.weather === 'snowy') delayMinutes += 20;
    if (data.weather === 'rainy') delayMinutes += 10;
    
    // Rush hour impact
    if (data.time_of_day === 'rush_hour') delayMinutes += 15;
    
    // High ridership impact
    if (data.ridership === 'very_high') delayMinutes += 10;
    
    return Math.min(delayMinutes, 120); // Cap at 2 hours
  }

  private calculateDelayProbability(data: any): number {
    let probability = 0.15; // Base 15%
    
    // Issue type probability
    switch (data.current_issue.type) {
      case 'signal_problems': probability += 0.6; break;
      case 'police_activity': probability += 0.5; break;
      case 'mechanical_problems': probability += 0.7; break;
      case 'sick_passenger': probability += 0.3; break;
      case 'train_traffic': probability += 0.4; break;
    }
    
    // Rush hour increases probability
    if (data.time_of_day === 'rush_hour') probability += 0.2;
    
    return Math.min(probability, 0.95);
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return 'rush_hour';
    }
    return 'normal';
  }

  private getRidershipLevel(): string {
    const levels = ['low', 'normal', 'high', 'very_high'];
    return levels[Math.floor(Math.random() * levels.length)];
  }
}

export class BusConnector {
  async predictBusDelay(route: string, stop?: string): Promise<TransitPrediction> {
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

export class TrainConnector {
  async predictTrainDelay(line: string, station?: string): Promise<TransitPrediction> {
    // Mock train delay for regional rail
    return {
      crisis_type: 'train_delay',
      probability: 0.4,
      predicted_delay: 20,
      confidence: 0.8,
      line: line,
      station: station || 'line-wide',
      system: 'regional_rail'
    };
  }
}
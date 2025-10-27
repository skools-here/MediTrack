export interface HealthReading {
  id: string;
  deviceId: string;
  timestamp: Date;
  heartRate: number;
  spo2: number;
  signalQuality?: number;
  perfusionIndex?: number;
}

export type HealthStatus = 'healthy' | 'caution' | 'critical';

export interface HealthEvaluation {
  overall: HealthStatus;
  heartRateStatus: HealthStatus;
  spo2Status: HealthStatus;
  message: string;
  recommendations: string[];
}

export interface Device {
  id: string;
  name: string;
  lastSeen: Date;
  isOnline: boolean;
  metadata?: Record<string, any>;
}

export interface HealthThresholds {
  spo2: {
    normal: number;
    caution: number;
  };
  heartRate: {
    min: number;
    max: number;
  };
}

import { useState, useEffect } from 'react';
import { Activity, Heart, Droplet } from 'lucide-react';
import { VitalCard } from '@/components/health/VitalCard';
import { HealthStatusCard } from '@/components/health/HealthStatusCard';
import { LiveChart } from '@/components/health/LiveChart';
import { DeviceList } from '@/components/health/DeviceList';
import { evaluateHealth } from '@/lib/healthEvaluation';
import { HealthReading, Device } from '@/types/health';
import { toast } from 'sonner';

// Mock data generator for demo
const generateMockReading = (prevReading?: HealthReading): HealthReading => {
  const baseHeartRate = 75;
  const baseSpo2 = 97;
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    deviceId: 'ESP32-001',
    timestamp: new Date(),
    heartRate: Math.round(baseHeartRate + (Math.random() - 0.5) * 10),
    spo2: Math.round(baseSpo2 + (Math.random() - 0.5) * 3),
    signalQuality: Math.random() * 100,
  };
};

const mockDevices: Device[] = [
  {
    id: 'ESP32-001',
    name: 'ESP32 Oximeter #1',
    lastSeen: new Date(),
    isOnline: true,
  },
];

export default function Dashboard() {
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [devices] = useState<Device[]>(mockDevices);

  // Simulate realtime data
  useEffect(() => {
    // Initial readings
    const initialReadings: HealthReading[] = [];
    for (let i = 30; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60 * 1000);
      initialReadings.push({
        id: Math.random().toString(36).substr(2, 9),
        deviceId: 'ESP32-001',
        timestamp,
        heartRate: Math.round(75 + (Math.random() - 0.5) * 10),
        spo2: Math.round(97 + (Math.random() - 0.5) * 3),
        signalQuality: Math.random() * 100,
      });
    }
    setReadings(initialReadings);

    // Simulate new readings every 3 seconds
    const interval = setInterval(() => {
      setReadings((prev) => {
        const newReading = generateMockReading(prev[prev.length - 1]);
        const evaluation = evaluateHealth(newReading.heartRate, newReading.spo2);
        
        // Alert on abnormal readings
        if (evaluation.overall === 'critical') {
          toast.error('Critical Alert', {
            description: evaluation.message,
          });
        } else if (evaluation.overall === 'caution') {
          toast.warning('Caution', {
            description: evaluation.message,
          });
        }
        
        return [...prev, newReading].slice(-100); // Keep last 100 readings
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const latestReading = readings[readings.length - 1];
  const evaluation = latestReading
    ? evaluateHealth(latestReading.heartRate, latestReading.spo2)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Health Monitor
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time vital signs monitoring dashboard
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
            Live
          </div>
        </div>

        {/* Vital Cards */}
        {latestReading && evaluation && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VitalCard
                title="Heart Rate"
                value={latestReading.heartRate}
                unit="bpm"
                status={evaluation.heartRateStatus}
                icon={Heart}
                lastUpdated={latestReading.timestamp}
              />
              <VitalCard
                title="Oxygen Saturation"
                value={latestReading.spo2}
                unit="%"
                status={evaluation.spo2Status}
                icon={Droplet}
                lastUpdated={latestReading.timestamp}
              />
            </div>

            {/* Health Status */}
            <HealthStatusCard evaluation={evaluation} />
          </>
        )}

        {/* Live Chart */}
        <LiveChart readings={readings} timeRange={30} />

        {/* Devices */}
        <DeviceList devices={devices} />

        {/* Info Card */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> This is a demo with simulated data. 
            To connect real devices, enable <span className="font-medium text-primary">Lovable Cloud</span> and 
            configure your ESP32 to send data via the provided API endpoint.
          </p>
        </div>
      </div>
    </div>
  );
}

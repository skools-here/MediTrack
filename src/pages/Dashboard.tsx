import { useState, useEffect } from "react";
import { Heart, Droplet } from "lucide-react";
import { VitalCard } from "@/components/health/VitalCard";
import { HealthStatusCard } from "@/components/health/HealthStatusCard";
import { LiveChart } from "@/components/health/LiveChart";
import { DeviceList } from "@/components/health/DeviceList";
import { evaluateHealth } from "@/lib/healthEvaluation";
import { HealthReading, Device } from "@/types/health";
import { toast } from "sonner";

// ✅ Change this to your Flask server URL
const API_BASE_URL = "http://localhost:5000"; 
// or e.g. "http://192.168.1.100:5000" if you’re testing on ESP32 + local network

const mockDevices: Device[] = [
  {
    id: "ESP32-001",
    name: "ESP32 Oximeter #1",
    lastSeen: new Date(),
    isOnline: true,
  },
];

export default function Dashboard() {
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [devices] = useState<Device[]>(mockDevices);
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data`);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item) => ({
          id: item.timestamp,
          deviceId: "ESP32-001",
          timestamp: new Date(item.timestamp),
          heartRate: item.heartRate,
          spo2: item.spo2,
          signalQuality: 100,
        }));

        setReadings(mapped);
        setIsConnected(true);

        const latest = mapped[mapped.length - 1];
        const evaluation = evaluateHealth(latest.heartRate, latest.spo2);
        if (evaluation.overall === "critical") {
          toast.error("Critical Alert", { description: evaluation.message });
        } else if (evaluation.overall === "caution") {
          toast.warning("Caution", { description: evaluation.message });
        }
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
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

          {/* Connection indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-status-healthy animate-pulse" : "bg-red-500"
              }`}
            />
            {isConnected ? "Live" : "Offline"}
          </div>
        </div>

        {/* Vital Cards */}
        {latestReading && evaluation ? (
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
        ) : (
          <p className="text-muted-foreground text-center py-10">
            Waiting for device data...
          </p>
        )}

        {/* Live Chart */}
        <LiveChart readings={readings} timeRange={30} />

        {/* Devices */}
        <DeviceList devices={devices} />

        {/* Info Card */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> This
            dashboard now fetches live data from your ESP32 via the Flask API.{" "}
            Make sure your Flask server is running and accessible on the same
            network.
          </p>
        </div>
      </div>
    </div>
  );
}

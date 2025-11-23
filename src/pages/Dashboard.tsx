import { useState, useEffect } from "react";
import { Heart, Droplet, Footprints } from "lucide-react";
import { VitalCard } from "@/components/health/VitalCard";
import { HealthStatusCard } from "@/components/health/HealthStatusCard";
import { LiveChart } from "@/components/health/LiveChart";
import { DeviceList } from "@/components/health/DeviceList";
import { evaluateHealth } from "@/lib/healthEvaluation";
import type { HealthReading, Device } from "@/types/health";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000";

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

  // 🔹 Load some history for the chart
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data`);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        let mapped: HealthReading[] = data.map((item: any) => ({
          id: `${item.timestamp}-${Math.random()}`,
          deviceId: "ESP32-001",
          timestamp: new Date(item.timestamp),
          heartRate: item.heartRate,
          spo2: item.spo2,
          steps: item.steps ?? 0,
          signalQuality: 100,
        }));

        // ✅ Ensure history is in ascending time order
        mapped = mapped.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        setReadings(mapped);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setIsConnected(false);
    }
  };

  // 🔹 Poll only the latest value every 3 seconds
  const fetchLatest = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/latest`);
      if (!response.ok) {
        // 404 when no data yet – not a hard error
        if (response.status === 404) {
          setIsConnected(false);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const item = await response.json();

      const latest: HealthReading = {
        id: `${item.timestamp}-${Math.random()}`,
        deviceId: "ESP32-001",
        timestamp: new Date(item.timestamp),
        heartRate: item.heartRate,
        spo2: item.spo2,
        steps: item.steps ?? 0,
        signalQuality: 100,
      };

      setReadings((prev) => {
        // avoid duplicate if timestamp is same as last one
        if (
          prev.length > 0 &&
          prev[prev.length - 1].timestamp.getTime() ===
            latest.timestamp.getTime()
        ) {
          return prev;
        }

        const updated = [...prev, latest];

        // keep only last 100 points for chart
        return updated.slice(-100);
      });

      setIsConnected(true);

      const evaluation = evaluateHealth(latest.heartRate, latest.spo2);

      if (evaluation.overall === "critical") {
        toast.error("Critical Alert", { description: evaluation.message });
      } else if (evaluation.overall === "caution") {
        toast.warning("Caution", { description: evaluation.message });
      }
    } catch (error) {
      console.error("Failed to fetch latest:", error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchHistory();
    fetchLatest();

    const interval = setInterval(fetchLatest, 3000);
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
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-status-healthy animate-pulse" : "bg-red-500"
              }`}
            />
            {isConnected ? "Live" : "Offline"}
          </div>
        </div>

        {/* Vital Cards + Health Status */}
        {latestReading && evaluation ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <VitalCard
                title="Step Count"
                value={latestReading.steps ?? 0}
                unit="steps"
                status="neutral"
                icon={Footprints}
                lastUpdated={latestReading.timestamp}
              />
            </div>

            <HealthStatusCard evaluation={evaluation} />
          </>
        ) : (
          <p className="text-muted-foreground text-center py-10">
            Waiting for device data...
          </p>
        )}

        {/* Live Chart */}
        <LiveChart readings={readings} timeRange={30} />

        {/* Device list */}
        <DeviceList devices={devices} />

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> This
            dashboard receives XML/JSON data from the Flask backend. Ensure the
            server is active and reachable.
          </p>
        </div>
      </div>
    </div>
  );
}

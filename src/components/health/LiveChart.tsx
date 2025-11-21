import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HealthReading } from "@/types/health";
import { format } from "date-fns";

interface LiveChartProps {
  readings: HealthReading[];
  timeRange?: number; // minutes
}

export function LiveChart({ readings, timeRange = 30 }: LiveChartProps) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - timeRange * 60 * 1000);

  // Filter valid timestamps ONLY
  const filteredReadings = readings
    .filter((r) => r.timestamp instanceof Date && r.timestamp >= cutoff)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const chartData = filteredReadings.map((reading) => ({
    time: format(reading.timestamp, "HH:mm:ss"),
    heartRate: reading.heartRate,
    spo2: reading.spo2,
  }));

  return (
    <Card className="p-6 border-border/50 bg-gradient-to-br from-card to-secondary/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Live Vitals Trend</h3>
          <span className="text-sm text-muted-foreground">
            Last {timeRange} minutes
          </span>
        </div>

        {/* FIXED HEIGHT WRAPPER */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%" className="!block">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="red"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Heart Rate (bpm)"
              />
              <Line
                type="monotone"
                dataKey="spo2"
                stroke="blue"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="SpO₂ (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

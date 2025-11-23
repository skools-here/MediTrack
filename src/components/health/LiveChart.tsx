"use client";

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

  // 1) Normalize timestamps to valid Date objects
  const normalized = readings
    .map((r) => {
      let ts: Date;

      if (r.timestamp instanceof Date) {
        ts = r.timestamp;
      } else {
        ts = new Date(r.timestamp as any);
      }

      if (isNaN(ts.getTime())) {
        // invalid date -> drop this reading
        return null;
      }

      return {
        ...r,
        timestamp: ts,
      };
    })
    .filter(
      (r): r is HealthReading & { timestamp: Date } => r !== null
    );

  // 2) Sort oldest → newest
  let sorted = [...normalized].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // 3) Try to filter by time range, but fall back to all data if that gives 0 points
  let filtered = sorted;
  if (sorted.length > 0) {
    const cutoff = new Date(now.getTime() - timeRange * 60 * 1000);
    const inRange = sorted.filter((r) => r.timestamp >= cutoff);
    filtered = inRange.length > 0 ? inRange : sorted;
  }

  // 4) Build chart data
  const chartData = filtered.map((reading) => ({
    time: format(reading.timestamp, "HH:mm:ss"),
    heartRate: reading.heartRate,
    spo2: reading.spo2,
  }));

  // Debug if needed:
  // console.log("LiveChart readings:", readings);
  // console.log("LiveChart normalized:", normalized);
  // console.log("LiveChart chartData:", chartData);

  return (
    <Card className="p-6 border-border/50 bg-gradient-to-br from-card to-secondary/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Live Vitals Trend</h3>
          <span className="text-sm text-muted-foreground">
            {chartData.length > 0
              ? `Showing ${chartData.length} recent points`
              : `No data`}
          </span>
        </div>

        <div className="w-full h-[300px]">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
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
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  stroke="blue"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="SpO₂ (%)"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}

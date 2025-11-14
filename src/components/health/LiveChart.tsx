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

  // Filter last X minutes, ensure timestamps are valid Dates
  const filteredReadings = readings
    .filter((r) => new Date(r.timestamp) >= cutoff)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  // Prepare data for the graph
  const chartData = filteredReadings.map(reading => ({
    time: format(new Date(reading.timestamp), 'HH:mm:ss'),
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

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              wrapperStyle={{ color: "hsl(var(--foreground))" }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="heartRate"
              stroke="hsl(var(--chart-heart))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-heart))", r: 3 }}
              activeDot={{ r: 5 }}
              name="Heart Rate (bpm)"
            />
            <Line
              type="monotone"
              dataKey="spo2"
              stroke="hsl(var(--chart-spo2))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-spo2))", r: 3 }}
              activeDot={{ r: 5 }}
              name="SpO₂ (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

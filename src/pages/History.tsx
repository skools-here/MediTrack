import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import { evaluateHealth } from "@/lib/healthEvaluation";
import { HealthReading } from "@/types/health";

const API_BASE_URL = "http://localhost:5000";

export default function History() {
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data`);
      const data = await response.json();

      if (!data.readings) return;

      const parsed: HealthReading[] = data.readings.map((item: any) => ({
        id: item.timestamp + "-" + Math.random(),
        deviceId: item.deviceId || "ESP32-001",
        timestamp: new Date(item.timestamp),
        heartRate: Number(item.heartRate),
        spo2: Number(item.spo2),
        steps: Number(item.steps ?? 0),
        steps: Number(item.steps ?? 0),
      }));

      // Sort by timestamp ascending
      parsed.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      setReadings(parsed);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // === Filter by date range ===
  const filteredReadings = readings;

  // ================== Export to CSV ==================
  const exportToCSV = () => {
    const headers = ["Timestamp", "Device", "Heart Rate", "SpO2", "Status"];
    const rows = filteredReadings.map(reading => {
      const evalStatus = evaluateHealth(reading.heartRate, reading.spo2);

      return [
        format(reading.timestamp, "yyyy-MM-dd HH:mm:ss"),
        reading.deviceId,
        reading.heartRate,
        reading.spo2,
        evalStatus.overall,
      ];
    });

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  // ================== UI ==================
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            History
          </h1>
          <p className="text-muted-foreground mt-1">
            View and export historical health data
          </p>
        </div>

        <Card className="p-6 border-border/50 bg-gradient-to-br from-card to-secondary/50">
          {/* Date Filters and Export Button */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button onClick={exportToCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead className="text-right">Heart Rate</TableHead>
                  <TableHead className="text-right">SpO₂</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredReadings.map(reading => {
                  const evalStatus = evaluateHealth(
                    reading.heartRate,
                    reading.spo2
                  );

                  const statusColors: any = {
                    healthy:
                      "bg-status-healthy/20 text-status-healthy border-status-healthy/40",
                    caution:
                      "bg-status-caution/20 text-status-caution border-status-caution/40",
                    critical:
                      "bg-status-critical/20 text-status-critical border-status-critical/40",
                  };

                  return (
                    <TableRow
                      key={reading.id}
                      className="hover:bg-secondary/30"
                    >
                      <TableCell>
                        {format(reading.timestamp, "MMM dd, yyyy HH:mm:ss")}
                      </TableCell>

                      <TableCell>{reading.deviceId}</TableCell>

                      <TableCell className="text-right">
                        {reading.heartRate} bpm
                      </TableCell>

                      <TableCell className="text-right">
                        {reading.spo2}%
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[evalStatus.overall]}
                        >
                          {evalStatus.overall}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredReadings.length} of {readings.length} readings
          </div>
        </Card>
      </div>
    </div>
  );
}

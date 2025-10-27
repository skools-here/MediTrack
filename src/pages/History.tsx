import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { evaluateHealth } from '@/lib/healthEvaluation';
import { HealthReading } from '@/types/health';

// Mock historical data
const generateHistoricalData = (): HealthReading[] => {
  const data: HealthReading[] = [];
  for (let i = 100; i >= 0; i--) {
    data.push({
      id: Math.random().toString(36).substr(2, 9),
      deviceId: 'ESP32-001',
      timestamp: new Date(Date.now() - i * 5 * 60 * 1000),
      heartRate: Math.round(75 + (Math.random() - 0.5) * 15),
      spo2: Math.round(97 + (Math.random() - 0.5) * 4),
    });
  }
  return data;
};

export default function History() {
  const [readings] = useState<HealthReading[]>(generateHistoricalData());
  const [searchDate, setSearchDate] = useState('');

  const filteredReadings = readings.filter((reading) => {
    if (!searchDate) return true;
    return format(new Date(reading.timestamp), 'yyyy-MM-dd').includes(searchDate);
  });

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Device ID', 'Heart Rate (bpm)', 'SpO₂ (%)', 'Status'];
    const rows = filteredReadings.map((reading) => {
      const evaluation = evaluateHealth(reading.heartRate, reading.spo2);
      return [
        format(new Date(reading.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        reading.deviceId,
        reading.heartRate,
        reading.spo2,
        evaluation.overall,
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-readings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            History
          </h1>
          <p className="text-muted-foreground mt-1">View and export historical health data</p>
        </div>

        <Card className="p-6 border-border/50 bg-gradient-to-br from-card to-secondary/50">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="pl-10"
                placeholder="Filter by date"
              />
            </div>
            <Button onClick={exportToCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

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
                {filteredReadings.map((reading) => {
                  const evaluation = evaluateHealth(reading.heartRate, reading.spo2);
                  const statusColors = {
                    healthy: 'bg-status-healthy/20 text-status-healthy border-status-healthy/40',
                    caution: 'bg-status-caution/20 text-status-caution border-status-caution/40',
                    critical: 'bg-status-critical/20 text-status-critical border-status-critical/40',
                  };

                  return (
                    <TableRow key={reading.id} className="hover:bg-secondary/30">
                      <TableCell className="font-medium">
                        {format(new Date(reading.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>{reading.deviceId}</TableCell>
                      <TableCell className="text-right font-mono">{reading.heartRate} bpm</TableCell>
                      <TableCell className="text-right font-mono">{reading.spo2}%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[evaluation.overall]}>
                          {evaluation.overall}
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

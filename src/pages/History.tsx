import { useState, useEffect } from 'react';
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

const API_BASE_URL = "http://localhost:5000";

// XML → JSON Parser
function xmlToJson(xml: any): any {
  const obj: any = {};
  if (xml.nodeType === 1 && xml.attributes.length > 0) {
    obj["@attributes"] = {};
    for (let j = 0; j < xml.attributes.length; j++) {
      const attribute = xml.attributes.item(j);
      obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
    }
  }
  if (xml.nodeType === 3) return xml.nodeValue.trim();
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      if (item.nodeName === "#text") continue;
      if (!obj[item.nodeName]) obj[item.nodeName] = xmlToJson(item);
      else {
        if (!Array.isArray(obj[item.nodeName]))
          obj[item.nodeName] = [obj[item.nodeName]];
        obj[item.nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

export default function History() {
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch real XML history
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data`);
      const xmlText = await response.text();

      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");

      const json = xmlToJson(xml);
      const items = json.readings?.item;
      if (!items) return;

      const list = Array.isArray(items) ? items : [items];

      const parsed = list.map((item: any) => ({
        id: item.timestamp,
        deviceId: "ESP32-001",
        timestamp: new Date(item.timestamp),
        heartRate: Number(item.heartRate),
        spo2: Number(item.spo2),
      }));

      setReadings(parsed);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter by date range
  const filteredReadings = readings.filter((reading) => {
    const t = reading.timestamp;

    if (startDate && t < new Date(startDate)) return false;
    if (endDate && t > new Date(endDate + "T23:59:59")) return false;

    return true;
  });

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'Device', 'Heart Rate', 'SpO2', 'Status'];
    const rows = filteredReadings.map((reading) => {
      const evalStatus = evaluateHealth(reading.heartRate, reading.spo2);
      return [
        format(reading.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        reading.deviceId,
        reading.heartRate,
        reading.spo2,
        evalStatus.overall,
      ];
    });

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
          {/* Date Range Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Start Date */}
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10"
                placeholder="Start Date"
              />
            </div>

            {/* End Date */}
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10"
                placeholder="End Date"
              />
            </div>

            {/* Export CSV */}
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
                {filteredReadings.map((reading) => {
                  const evalStatus = evaluateHealth(reading.heartRate, reading.spo2);
                  const statusColors = {
                    healthy: "bg-status-healthy/20 text-status-healthy border-status-healthy/40",
                    caution: "bg-status-caution/20 text-status-caution border-status-caution/40",
                    critical: "bg-status-critical/20 text-status-critical border-status-critical/40",
                  };

                  return (
                    <TableRow key={reading.id} className="hover:bg-secondary/30">
                      <TableCell>{format(reading.timestamp, 'MMM dd, yyyy HH:mm:ss')}</TableCell>
                      <TableCell>{reading.deviceId}</TableCell>
                      <TableCell className="text-right">{reading.heartRate} bpm</TableCell>
                      <TableCell className="text-right">{reading.spo2}%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[evalStatus.overall]}>
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

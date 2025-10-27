import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Settings, Activity } from 'lucide-react';
import { Device } from '@/types/health';
import { formatDistanceToNow } from 'date-fns';

const mockDevices: Device[] = [
  {
    id: 'ESP32-001',
    name: 'ESP32 Oximeter #1',
    lastSeen: new Date(),
    isOnline: true,
    metadata: {
      firmwareVersion: '1.2.3',
      ipAddress: '192.168.1.100',
      signalStrength: 85,
    },
  },
  {
    id: 'ESP32-002',
    name: 'ESP32 Oximeter #2',
    lastSeen: new Date(Date.now() - 1000 * 60 * 15),
    isOnline: false,
    metadata: {
      firmwareVersion: '1.2.2',
      ipAddress: '192.168.1.101',
      signalStrength: 72,
    },
  },
];

export default function Devices() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Device Management
            </h1>
            <p className="text-muted-foreground mt-1">Monitor and manage connected health devices</p>
          </div>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Add Device
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockDevices.map((device) => (
            <Card
              key={device.id}
              className="p-6 border-border/50 bg-gradient-to-br from-card to-secondary/50 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      device.isOnline 
                        ? 'bg-status-healthy/20' 
                        : 'bg-muted'
                    }`}>
                      {device.isOnline ? (
                        <Wifi className="w-6 h-6 text-status-healthy" />
                      ) : (
                        <WifiOff className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{device.name}</h3>
                      <p className="text-sm text-muted-foreground">{device.id}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={device.isOnline 
                      ? 'bg-status-healthy/20 text-status-healthy border-status-healthy/40' 
                      : 'bg-muted text-muted-foreground border-border'
                    }
                  >
                    {device.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Seen</p>
                    <p className="text-sm font-medium">
                      {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
                    </p>
                  </div>
                  {device.metadata?.firmwareVersion && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Firmware</p>
                      <p className="text-sm font-medium font-mono">{device.metadata.firmwareVersion}</p>
                    </div>
                  )}
                  {device.metadata?.ipAddress && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                      <p className="text-sm font-medium font-mono">{device.metadata.ipAddress}</p>
                    </div>
                  )}
                  {device.metadata?.signalStrength && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Signal Strength</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${device.metadata.signalStrength}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{device.metadata.signalStrength}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Activity className="w-4 h-4 mr-2" />
                    View Stats
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 border-border/50 bg-gradient-to-br from-card to-secondary/50">
          <h3 className="text-lg font-semibold mb-4">Integration Instructions</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-foreground mb-2">ESP32 Configuration</h4>
              <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
                <code className="text-xs">
{`// ESP32 sends POST to Raspberry Pi
const char* serverUrl = "http://raspberrypi.local:5000/readings";

void sendReading(int heartRate, int spo2) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\\"deviceId\\":\\"ESP32-001\\",";
  payload += "\\"heartRate\\":" + String(heartRate) + ",";
  payload += "\\"spo2\\":" + String(spo2) + "}";
  
  int httpCode = http.POST(payload);
  http.end();
}`}
                </code>
              </pre>
            </div>
            <p className="text-muted-foreground">
              Once Lovable Cloud is enabled, you'll receive a secure API endpoint for the Raspberry Pi to forward data to.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
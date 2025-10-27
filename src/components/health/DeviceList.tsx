import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Device } from '@/types/health';
import { Wifi, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DeviceListProps {
  devices: Device[];
}

export function DeviceList({ devices }: DeviceListProps) {
  return (
    <Card className="p-6 border-border/50 bg-gradient-to-br from-card to-secondary/50">
      <h3 className="text-lg font-semibold mb-4">Connected Devices</h3>
      
      <div className="space-y-3">
        {devices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No devices connected
          </p>
        ) : (
          devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/30 hover:bg-secondary/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                {device.isOnline ? (
                  <Wifi className="w-5 h-5 text-status-healthy" />
                ) : (
                  <WifiOff className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Last seen: {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
                  </p>
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
          ))
        )}
      </div>
    </Card>
  );
}

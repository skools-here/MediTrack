import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { HealthStatus } from '@/types/health';
import { LucideIcon } from 'lucide-react';

interface VitalCardProps {
  title: string;
  value: number;
  unit: string;
  status: HealthStatus;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  lastUpdated?: Date;
}

const statusConfig: Record<
  HealthStatus,
  { label: string; className: string; gradient: string }
> = {
  healthy: {
    label: 'Normal',
    className: 'bg-status-healthy/20 text-status-healthy border-status-healthy/40',
    gradient: 'from-status-healthy/20 to-transparent',
  },
  caution: {
    label: 'Caution',
    className: 'bg-status-caution/20 text-status-caution border-status-caution/40',
    gradient: 'from-status-caution/20 to-transparent',
  },
  critical: {
    label: 'Critical',
    className:
      'bg-status-critical/20 text-status-critical border-status-critical/40 animate-pulse',
    gradient: 'from-status-critical/20 to-transparent',
  },
};

const DEFAULT_STATUS_CONFIG = {
  label: 'Unknown',
  className: 'bg-muted/20 text-muted-foreground border-muted/40',
  gradient: 'from-muted/10 to-transparent',
};

export function VitalCard({
  title,
  value,
  unit,
  status,
  icon: Icon,
  trend,
  lastUpdated,
}: VitalCardProps) {
  // Defensive: pick config and fall back if missing
  const safeConfig =
    // typescript will let you index, but guard at runtime in case status is invalid/undefined
    (status && (statusConfig as Record<string, typeof DEFAULT_STATUS_CONFIG>)[status]) ??
    DEFAULT_STATUS_CONFIG;

  // Helpful dev-only warning so you can find the caller that's passing an invalid status
  if (process.env.NODE_ENV === 'development') {
    const isValid = Boolean(status && (status in statusConfig));
    if (!isValid) {
      // eslint-disable-next-line no-console
      console.warn(
        `[VitalCard] received invalid status="${String(
          status
        )}". Using DEFAULT_STATUS_CONFIG. Expected one of: ${Object.keys(
          statusConfig
        ).join(', ')}`
      );
    }
  }

  return (
    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-secondary/50 backdrop-blur-sm">
      {/* safeConfig.gradient will always exist now */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', safeConfig.gradient)} />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              {/* Guard Icon render in case it's undefined */}
              {Icon ? <Icon className="w-5 h-5 text-primary" /> : <div className="w-5 h-5" />}
            </div>
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          <Badge variant="outline" className={cn('border', safeConfig.className)}>
            {safeConfig.label}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tabular-nums tracking-tight">{value}</span>
            <span className="text-xl text-muted-foreground">{unit}</span>
          </div>

          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

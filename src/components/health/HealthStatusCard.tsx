import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { HealthEvaluation } from '@/types/health';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface HealthStatusCardProps {
  evaluation: HealthEvaluation;
}

const statusIcons = {
  healthy: CheckCircle,
  caution: AlertTriangle,
  critical: AlertCircle,
};

const statusConfig = {
  healthy: {
    className: 'bg-status-healthy/20 text-status-healthy border-status-healthy/40',
    iconClassName: 'text-status-healthy',
    gradient: 'from-status-healthy/10 to-transparent',
  },
  caution: {
    className: 'bg-status-caution/20 text-status-caution border-status-caution/40',
    iconClassName: 'text-status-caution',
    gradient: 'from-status-caution/10 to-transparent',
  },
  critical: {
    className: 'bg-status-critical/20 text-status-critical border-status-critical/40 animate-pulse',
    iconClassName: 'text-status-critical',
    gradient: 'from-status-critical/10 to-transparent',
  },
};

export function HealthStatusCard({ evaluation }: HealthStatusCardProps) {
  const Icon = statusIcons[evaluation.overall];
  const config = statusConfig[evaluation.overall];

  return (
    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-secondary/50">
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', config.gradient)} />
      
      <div className="relative p-6">
        <div className="flex items-start gap-4">
          <div className={cn('p-3 rounded-xl', config.className)}>
            <Icon className={cn('w-6 h-6', config.iconClassName)} />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Health Status</h3>
              <Badge variant="outline" className={cn('border text-sm', config.className)}>
                {evaluation.overall.toUpperCase()}
              </Badge>
            </div>
            
            <p className="text-sm text-foreground/80">{evaluation.message}</p>
            
            {evaluation.recommendations.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recommendations
                </p>
                <ul className="space-y-1">
                  {evaluation.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-foreground/70 flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

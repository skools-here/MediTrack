import { HealthStatus, HealthEvaluation, HealthThresholds } from '@/types/health';

const defaultThresholds: HealthThresholds = {
  spo2: {
    normal: 95,
    caution: 90,
  },
  heartRate: {
    min: 60,
    max: 100,
  },
};

export function evaluateSpo2(spo2: number, thresholds = defaultThresholds): HealthStatus {
  if (spo2 >= thresholds.spo2.normal) return 'healthy';
  if (spo2 >= thresholds.spo2.caution) return 'caution';
  return 'critical';
}

export function evaluateHeartRate(heartRate: number, thresholds = defaultThresholds): HealthStatus {
  if (heartRate < thresholds.heartRate.min) return 'caution'; // Bradycardia
  if (heartRate > thresholds.heartRate.max) return 'caution'; // Tachycardia
  return 'healthy';
}

export function evaluateHealth(
  heartRate: number,
  spo2: number,
  thresholds = defaultThresholds
): HealthEvaluation {
  const heartRateStatus = evaluateHeartRate(heartRate, thresholds);
  const spo2Status = evaluateSpo2(spo2, thresholds);

  // Overall status is worst of both
  let overall: HealthStatus = 'healthy';
  if (heartRateStatus === 'critical' || spo2Status === 'critical') {
    overall = 'critical';
  } else if (heartRateStatus === 'caution' || spo2Status === 'caution') {
    overall = 'caution';
  }

  // Generate messages and recommendations
  const recommendations: string[] = [];
  let message = 'All vitals are within normal range';

  if (spo2Status === 'critical') {
    message = 'Critical: Oxygen saturation is dangerously low';
    recommendations.push('Seek immediate medical attention');
    recommendations.push('Check sensor placement and ensure proper fit');
  } else if (spo2Status === 'caution') {
    message = 'Caution: Oxygen saturation is below normal';
    recommendations.push('Monitor closely and consult physician if persists');
    recommendations.push('Ensure adequate ventilation');
  }

  if (heartRate < thresholds.heartRate.min) {
    message = overall === 'critical' 
      ? 'Critical: Multiple abnormal readings detected'
      : 'Caution: Heart rate is below normal (Bradycardia)';
    recommendations.push('Consult physician about slow heart rate');
    recommendations.push('Monitor for dizziness or fatigue');
  } else if (heartRate > thresholds.heartRate.max) {
    message = overall === 'critical'
      ? 'Critical: Multiple abnormal readings detected'
      : 'Caution: Heart rate is elevated (Tachycardia)';
    recommendations.push('Consider rest and hydration');
    recommendations.push('Seek medical advice if sustained or symptomatic');
  }

  if (overall === 'healthy') {
    recommendations.push('Continue regular monitoring');
    recommendations.push('Maintain healthy lifestyle habits');
  }

  return {
    overall,
    heartRateStatus,
    spo2Status,
    message,
    recommendations,
  };
}

export interface Reading {
  equipment: string;
  hoursSinceService?: number;
  tempF?: number;
  pressurePsi?: number;
  downtimeHours?: number;
}

export const LIMITS = { hoursSinceService: 500, tempF: 220, pressurePsi: 3000, downtimeHours: 8 };

export interface Alert { metric: string; value: number; limit: number; message: string }

export function checkThresholds(r: Reading): Alert[] {
  const out: Alert[] = [];
  const add = (metric: keyof typeof LIMITS, label: string, unit: string) => {
    const v = r[metric];
    if (typeof v === 'number' && v > LIMITS[metric]) out.push({ metric, value: v, limit: LIMITS[metric], message: `${label} ${v}${unit} is over the ${LIMITS[metric]}${unit} limit` });
  };
  add('hoursSinceService', 'Runtime since service', ' hrs');
  add('tempF', 'Temperature', '°F');
  add('pressurePsi', 'Hydraulic pressure', ' psi');
  add('downtimeHours', 'Downtime', ' hrs');
  return out;
}

export const workOrderIssue = (r: Reading, alerts: Alert[]) =>
  `AUTO WORK ORDER — ${alerts.map((a) => a.message).join('; ')}. Inspect and service ${r.equipment}.`;

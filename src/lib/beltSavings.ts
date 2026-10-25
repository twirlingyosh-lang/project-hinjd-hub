// BeltSaver savings estimate: 3x belt life, 60% less tracking downtime (same claims as the product page).
export function beltSavings(i: { beltCost: number; beltsPerYear: number; downtimeHours: number; downtimeCostPerHour: number }) {
  const beltSavings = Math.round(i.beltCost * i.beltsPerYear * (1 - 1 / 3));
  const downtimeSavings = Math.round(i.downtimeHours * i.downtimeCostPerHour * 0.6);
  return { beltSavings, downtimeSavings, total: beltSavings + downtimeSavings };
}

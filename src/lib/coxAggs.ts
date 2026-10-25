// Cox Aggregates catalog. PRICES ARE PLACEHOLDERS until Josh supplies real ones.
export interface AggProduct {
  id: string;
  name: string;
  spec: string;
  use: string;
  tiers: { minTons: number; pricePerTon: number }[]; // ascending minTons
}

export const COX_AGGS: AggProduct[] = [
  { id: 'crusher-run', name: 'Crusher Run Base', spec: '1-1/2" minus, crushed with fines', use: 'Road base, driveways, pads',
    tiers: [{ minTons: 0, pricePerTon: 18 }, { minTons: 100, pricePerTon: 16 }, { minTons: 500, pricePerTon: 14 }] },
  { id: 'pea-gravel', name: 'Pea Gravel', spec: '3/8" rounded, washed', use: 'Drainage, landscaping, play areas',
    tiers: [{ minTons: 0, pricePerTon: 28 }, { minTons: 100, pricePerTon: 25 }, { minTons: 500, pricePerTon: 22 }] },
  { id: 'concrete-sand', name: 'Washed Concrete Sand', spec: 'ASTM C33, 3/16" minus, washed', use: 'Concrete, mortar, pipe bedding',
    tiers: [{ minTons: 0, pricePerTon: 24 }, { minTons: 100, pricePerTon: 21 }, { minTons: 500, pricePerTon: 19 }] },
  { id: 'rip-rap', name: 'Rip Rap', spec: '6"–18" angular rock', use: 'Erosion control, channels, slopes',
    tiers: [{ minTons: 0, pricePerTon: 38 }, { minTons: 100, pricePerTon: 34 }, { minTons: 500, pricePerTon: 30 }] },
  { id: 'crushed-34', name: '3/4" Crushed Rock', spec: '3/4" clean, angular (#57-style)', use: 'Drain rock, concrete aggregate, base',
    tiers: [{ minTons: 0, pricePerTon: 26 }, { minTons: 100, pricePerTon: 23 }, { minTons: 500, pricePerTon: 20 }] },
];

export const pricePerTon = (p: AggProduct, tons: number) =>
  [...p.tiers].reverse().find((t) => tons >= t.minTons)!.pricePerTon;

/** Tons from area and depth. density in tons per cubic yard (default 1.4). */
export const tonsFromArea = (lengthFt: number, widthFt: number, depthIn: number, density = 1.4) =>
  Math.round(((lengthFt * widthFt * (depthIn / 12)) / 27) * density * 10) / 10;

export function quoteTotal(lines: { productId: string; tons: number }[]) {
  return lines.reduce((sum, l) => {
    const p = COX_AGGS.find((x) => x.id === l.productId);
    return p && l.tons > 0 ? sum + pricePerTon(p, l.tons) * l.tons : sum;
  }, 0);
}

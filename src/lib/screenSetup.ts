// Rule-of-thumb screen deck and crusher setup for producing one target product
// at maximum throughput. All figures are field estimates, not OEM specs.

export type Machine = 'jaw' | 'cone' | 'hsi' | 'vsi';

export interface Product {
  value: string;
  label: string;
  top: number; // inches, largest passing size
  bottom: number; // inches, smallest retained size (0 = "minus" product)
}

export const PRODUCTS: Product[] = [
  { value: 'base-1.5', label: '1-1/2" Road Base (minus)', top: 1.5, bottom: 0 },
  { value: 'clean-1.5', label: '1-1/2" Clean Rock', top: 1.5, bottom: 0.75 },
  { value: 'base-0.75', label: '3/4" Road Base (minus)', top: 0.75, bottom: 0 },
  { value: 'clean-0.75', label: '3/4" Clean (#57-style)', top: 0.75, bottom: 0.375 },
  { value: 'chips-0.375', label: '3/8" Chips', top: 0.375, bottom: 0.1875 },
  { value: 'sand', label: 'Manufactured / Concrete Sand', top: 0.1875, bottom: 0 },
];

export const FEED_MATERIALS = [
  { value: 'limestone', label: 'Limestone (soft)', factor: 1.1 },
  { value: 'gravel', label: 'River gravel / pit run', factor: 1.05 },
  { value: 'granite', label: 'Granite (hard)', factor: 0.9 },
  { value: 'basalt', label: 'Basalt / trap rock (hard, abrasive)', factor: 0.85 },
];

export const MACHINES: { value: Machine; label: string; yield: number }[] = [
  { value: 'jaw', label: 'Jaw Crusher', yield: 0.3 },
  { value: 'cone', label: 'Cone Crusher', yield: 0.55 },
  { value: 'hsi', label: 'HSI / Impactor', yield: 0.5 },
  { value: 'vsi', label: 'VSI', yield: 0.6 },
];

/** Square-mesh opening needed to pass a given top size (screens cut slightly under the opening). */
export const openingFor = (size: number) => Math.round(size * 1.1 * 1000) / 1000;

/** Basic screen capacity in TPH per square foot for a given opening (inches). */
export const tphPerSqFt = (opening: number) => Math.min(4.5, 0.6 + 1.6 * opening);

export interface SetupResult {
  crusherSetting: string;
  decks: { deck: string; opening: number; role: string }[];
  productTph: number;
  recirculatingTph: number;
  screenAreaSqFt: number;
  steps: string[];
}

const fmt = (n: number) => `${n.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}"`;

export interface PlantInput { feedMaterial?: string; feedTopSize?: number; myScreenOpening?: number }

export function planSetup(machine: Machine, product: Product, feedTph: number, plant: PlantInput = {}): SetupResult {
  const factor = FEED_MATERIALS.find((f) => f.value === plant.feedMaterial)?.factor ?? 1;
  const m = MACHINES.find((x) => x.value === machine)!;
  const top = openingFor(product.top);
  const bottom = product.bottom > 0 ? openingFor(product.bottom) : 0;

  const crusherSetting =
    machine === 'jaw' ? `Closed side setting ≈ ${fmt(product.top)}`
    : machine === 'cone' ? `Closed side setting ≈ ${fmt(product.top * 0.8)}`
    : machine === 'hsi' ? `Apron gap ≈ ${fmt(product.top * 1.2)}, rotor at mid-high speed`
    : `Rotor tip speed high (~230 ft/s) for cubical fines; cascade 10–20%`;

  // Closed circuit: oversize returns to the crusher, lifting usable yield.
  const closedYield = Math.min(0.9, m.yield + (product.bottom > 0 ? 0.2 : 0.3));
  const productTph = Math.round(feedTph * closedYield * factor);
  const recirculatingTph = Math.round(feedTph * (1 - m.yield) * (product.bottom > 0 ? 0.6 : 0.7));
  const screenAreaSqFt = Math.ceil((feedTph + recirculatingTph) / tphPerSqFt(top));

  const decks = [
    { deck: 'Top deck', opening: top, role: 'Oversize — send back to crusher (closed circuit)' },
    bottom > 0
      ? { deck: 'Middle deck', opening: bottom, role: `Retains ${product.label} — product conveyor` }
      : { deck: 'Middle deck', opening: top, role: `Passing material is ${product.label} — product conveyor` },
    { deck: 'Bottom deck', opening: bottom > 0 ? openingFor(bottom / 2) : openingFor(product.top / 4), role: 'Fines split / blend or waste' },
  ];

  const steps = [
    `Set the ${m.label}: ${crusherSetting}.`,
    `Choke-feed the crusher; target ${feedTph} TPH steady feed.`,
    `Top deck ${fmt(top)} openings: oversize returns to the crusher.`,
    bottom > 0
      ? `Middle deck ${fmt(bottom)}: what stays on top is your product.`
      : `Everything through the top deck is your product; middle deck keeps the split clean.`,
    `Bottom deck ${fmt(decks[2].opening)} to pull fines out of the product.`,
    `Screen needs about ${screenAreaSqFt} ft² per deck for ${feedTph + recirculatingTph} TPH total load.`,
    `Check a gradation sample after 30 min; tighten the setting if oversize return exceeds ${recirculatingTph} TPH.`,
  ];

  if (plant.feedTopSize && plant.feedTopSize > 0) {
    const ratio = plant.feedTopSize / product.top;
    const maxRatio = machine === 'jaw' ? 8 : machine === 'cone' ? 6 : machine === 'hsi' ? 10 : 4;
    if (ratio > maxRatio) steps.unshift(`Feed top size ${fmt(plant.feedTopSize)} is too big for one ${m.label} stage (ratio ${ratio.toFixed(1)}:1, max ~${maxRatio}:1). Add a primary crusher ahead of it.`);
  }
  if (plant.myScreenOpening && plant.myScreenOpening > 0 && Math.abs(plant.myScreenOpening - top) > 0.01) {
    steps.push(plant.myScreenOpening > top
      ? `Your ${fmt(plant.myScreenOpening)} top screen is bigger than the ${fmt(top)} needed — oversize will get into your product. Swap to ${fmt(top)}.`
      : `Your ${fmt(plant.myScreenOpening)} top screen is smaller than the ${fmt(top)} needed — you'll recirculate good product and lose TPH. Swap to ${fmt(top)}.`);
  }

  return { crusherSetting, decks, productTph, recirculatingTph, screenAreaSqFt, steps };
}

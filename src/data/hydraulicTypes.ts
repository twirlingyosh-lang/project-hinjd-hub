export type ComponentType = 'pump' | 'valve' | 'cylinder' | 'motor' | 'filter' | 'reservoir' | 'cooler' | 'accumulator';

export interface HydraulicComponent {
  id: string;
  name: string;
  shortName: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  specs: {
    pressure?: string;
    flow?: string;
    size?: string;
    type?: string;
    partNumber?: string;
    crossRef?: string[];
    manufacturer?: string;
  };
}

export interface HydraulicLine {
  id: string;
  from: string;
  to: string;
  type: 'pressure' | 'return' | 'drain' | 'pilot';
  label: string;
}

export interface BrandSchematic {
  id: string;
  name: string;
  category: 'aggregate' | 'heavy-equipment';
  description: string;
  components: HydraulicComponent[];
  lines: HydraulicLine[];
}

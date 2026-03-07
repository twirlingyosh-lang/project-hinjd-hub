import { BrandSchematic } from '../hydraulicTypes';
import { aggregateSchematics } from './aggregate';
import { heavyEquipmentSchematics } from './heavyEquipment';

export const allSchematics: BrandSchematic[] = [
  ...aggregateSchematics,
  ...heavyEquipmentSchematics,
];

export const schematicCategories = [
  { id: 'aggregate', label: 'Aggregate Equipment' },
  { id: 'heavy-equipment', label: 'Heavy Equipment' },
] as const;

export type SchematicCategory = typeof schematicCategories[number]['id'];

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Wrench, Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HydraulicComponent, HydraulicLine, ComponentType } from '@/data/hydraulicTypes';
import { allSchematics, schematicCategories, SchematicCategory } from '@/data/hydraulicSchematics';

const COMPONENT_COLORS: Record<ComponentType, string> = {
  pump: 'hsl(200, 80%, 50%)',
  valve: 'hsl(280, 70%, 50%)',
  cylinder: 'hsl(25, 95%, 53%)',
  motor: 'hsl(142, 70%, 45%)',
  filter: 'hsl(45, 90%, 50%)',
  reservoir: 'hsl(220, 60%, 55%)',
  cooler: 'hsl(180, 60%, 45%)',
  accumulator: 'hsl(340, 70%, 50%)',
};

const LINE_COLORS: Record<string, string> = {
  pressure: '#ef4444',
  return: '#3b82f6',
  drain: '#1f2937',
  pilot: '#f97316',
};

const LEGEND_ITEMS = [
  { label: 'Pressure Line', color: '#ef4444' },
  { label: 'Return Line', color: '#3b82f6' },
  { label: 'Pilot Line', color: '#f97316' },
  { label: 'Pump', color: COMPONENT_COLORS.pump },
  { label: 'Valve', color: COMPONENT_COLORS.valve },
  { label: 'Cylinder', color: COMPONENT_COLORS.cylinder },
  { label: 'Motor', color: COMPONENT_COLORS.motor },
];

const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  pump: 'Pumps',
  valve: 'Valves',
  cylinder: 'Cylinders',
  motor: 'Motors',
  filter: 'Filters',
  reservoir: 'Reservoirs',
  cooler: 'Coolers',
  accumulator: 'Accumulators',
};

const HydraulicSchematic = () => {
  const [selectedCategory, setSelectedCategory] = useState<SchematicCategory | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState('metso');
  const [selectedComponent, setSelectedComponent] = useState<HydraulicComponent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [componentTypeFilter, setComponentTypeFilter] = useState<ComponentType | 'all'>('all');

  // Deep search: matches brand name, description, component names, part numbers, cross-refs
  const filteredBrands = useMemo(() => {
    let brands = selectedCategory === 'all'
      ? allSchematics
      : allSchematics.filter(s => s.category === selectedCategory);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      brands = brands.filter(b =>
        b.name.toLowerCase().includes(term) ||
        b.description.toLowerCase().includes(term) ||
        b.components.some(c =>
          c.name.toLowerCase().includes(term) ||
          c.shortName.toLowerCase().includes(term) ||
          c.specs.partNumber?.toLowerCase().includes(term) ||
          c.specs.manufacturer?.toLowerCase().includes(term) ||
          c.specs.crossRef?.some(ref => ref.toLowerCase().includes(term))
        )
      );
    }

    if (componentTypeFilter !== 'all') {
      brands = brands.filter(b =>
        b.components.some(c => c.type === componentTypeFilter)
      );
    }

    return brands;
  }, [selectedCategory, searchTerm, componentTypeFilter]);

  const hasActiveFilters = searchTerm || componentTypeFilter !== 'all' || selectedCategory !== 'all';

  const clearAllFilters = () => {
    setSearchTerm('');
    setComponentTypeFilter('all');
    setSelectedCategory('all');
    setSelectedComponent(null);
  };

  const currentSchematic = allSchematics.find(s => s.id === selectedBrand) || allSchematics[0];

  const getLineCoords = (line: HydraulicLine) => {
    const fromComp = currentSchematic.components.find(c => c.id === line.from);
    const toComp = currentSchematic.components.find(c => c.id === line.to);
    if (!fromComp || !toComp) return null;

    const fromX = fromComp.x + fromComp.width;
    const fromY = fromComp.y + fromComp.height / 2;
    const toX = toComp.x;
    const toY = toComp.y + toComp.height / 2;
    const midX = (fromX + toX) / 2;

    return `M${fromX},${fromY} C${midX},${fromY} ${midX},${toY} ${toX},${toY}`;
  };

  const componentCounts = useMemo(() => ({
    pumps: currentSchematic.components.filter(c => c.type === 'pump').length,
    valves: currentSchematic.components.filter(c => c.type === 'valve').length,
    cylinders: currentSchematic.components.filter(c => c.type === 'cylinder').length,
    motors: currentSchematic.components.filter(c => c.type === 'motor').length,
  }), [currentSchematic]);

  return (
    <div className="space-y-6">
      {/* Category Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs
          value={selectedCategory}
          onValueChange={(v) => {
            setSelectedCategory(v as SchematicCategory | 'all');
            setSelectedComponent(null);
          }}
          className="flex-1"
        >
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="all">All Brands</TabsTrigger>
            {schematicCategories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>{cat.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary/50"
          />
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{currentSchematic.name} Hydraulic System</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {currentSchematic.description}
                </p>
              </div>
            </div>
            <Select value={selectedBrand} onValueChange={(v) => { setSelectedBrand(v); setSelectedComponent(null); }}>
              <SelectTrigger className="w-[220px] bg-secondary/50">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent className="bg-card border max-h-[300px]">
                {filteredBrands.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">No brands found</div>
                ) : (
                  filteredBrands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      <span className="flex items-center gap-2">
                        {brand.name}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {brand.category === 'aggregate' ? 'AGG' : 'HVY'}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
            {LEGEND_ITEMS.map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          {/* SVG Schematic */}
          <div className="border border-border/30 rounded-lg p-4 bg-slate-900/95 overflow-auto">
            <svg viewBox="0 0 620 560" className="w-full h-auto min-w-[600px]">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Lines */}
              {currentSchematic.lines.map((line) => {
                const path = getLineCoords(line);
                if (!path) return null;
                return (
                  <g key={line.id}>
                    <path
                      d={path}
                      fill="none"
                      stroke={LINE_COLORS[line.type] || '#6b7280'}
                      strokeWidth="2.5"
                      strokeDasharray={line.type === 'pilot' ? '8,4' : 'none'}
                      opacity={0.8}
                    />
                    <circle
                      cx={(currentSchematic.components.find(c => c.id === line.from)?.x || 0) +
                          (currentSchematic.components.find(c => c.id === line.from)?.width || 0) + 20}
                      cy={(currentSchematic.components.find(c => c.id === line.from)?.y || 0) +
                          (currentSchematic.components.find(c => c.id === line.from)?.height || 0) / 2}
                      r="3"
                      fill={LINE_COLORS[line.type] || '#6b7280'}
                    />
                  </g>
                );
              })}

              {/* Components */}
              {currentSchematic.components.map((comp) => {
                const isSelected = selectedComponent?.id === comp.id;
                return (
                  <g
                    key={comp.id}
                    className="cursor-pointer transition-opacity"
                    onClick={() => setSelectedComponent(isSelected ? null : comp)}
                    filter={isSelected ? 'url(#glow)' : undefined}
                  >
                    <rect
                      x={comp.x}
                      y={comp.y}
                      width={comp.width}
                      height={comp.height}
                      rx="6"
                      fill={COMPONENT_COLORS[comp.type]}
                      stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.2)'}
                      strokeWidth={isSelected ? 2.5 : 1}
                      opacity={0.9}
                    />
                    {comp.type === 'pump' && (
                      <circle
                        cx={comp.x + comp.width / 2}
                        cy={comp.y + comp.height / 2}
                        r={Math.min(comp.width, comp.height) / 3}
                        fill="none"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="1.5"
                      />
                    )}
                    {comp.type === 'motor' && (
                      <text
                        x={comp.x + comp.width / 2}
                        y={comp.y + comp.height / 2 + 2}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.7)"
                        fontSize="14"
                        fontWeight="bold"
                      >
                        M
                      </text>
                    )}
                    {comp.type === 'cylinder' && (
                      <line
                        x1={comp.x + comp.width * 0.65}
                        y1={comp.y + 8}
                        x2={comp.x + comp.width * 0.65}
                        y2={comp.y + comp.height - 8}
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="2.5"
                      />
                    )}
                    <text
                      x={comp.x + comp.width / 2}
                      y={comp.y + comp.height / 2 + (comp.type === 'motor' ? 0 : 5)}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="10"
                      fontWeight="bold"
                      style={{ display: comp.type === 'motor' ? 'none' : 'block' }}
                    >
                      {comp.shortName}
                    </text>
                  </g>
                );
              })}

              {/* Title */}
              <text x="310" y="30" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold" opacity="0.9">
                {currentSchematic.name} Hydraulic System
              </text>
            </svg>
          </div>

          {/* Selected Component Details */}
          {selectedComponent && (
            <Card className="border-2 border-primary/50 bg-card/80">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Badge
                    className="text-white border-0"
                    style={{ backgroundColor: COMPONENT_COLORS[selectedComponent.type] }}
                  >
                    {selectedComponent.type.toUpperCase()}
                  </Badge>
                  <CardTitle className="text-lg">{selectedComponent.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedComponent.specs.pressure && (
                    <div>
                      <p className="text-xs text-muted-foreground">Max Pressure</p>
                      <p className="font-medium text-sm">{selectedComponent.specs.pressure}</p>
                    </div>
                  )}
                  {selectedComponent.specs.flow && (
                    <div>
                      <p className="text-xs text-muted-foreground">Flow Rate</p>
                      <p className="font-medium text-sm">{selectedComponent.specs.flow}</p>
                    </div>
                  )}
                  {selectedComponent.specs.size && (
                    <div>
                      <p className="text-xs text-muted-foreground">Size/Capacity</p>
                      <p className="font-medium text-sm">{selectedComponent.specs.size}</p>
                    </div>
                  )}
                  {selectedComponent.specs.type && (
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="font-medium text-sm">{selectedComponent.specs.type}</p>
                    </div>
                  )}
                </div>

                {(selectedComponent.specs.partNumber || selectedComponent.specs.crossRef) && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <h4 className="font-semibold text-sm mb-3 text-primary">Part Numbers & Cross-Reference</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedComponent.specs.partNumber && (
                        <div className="bg-secondary/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">OEM Part Number</p>
                          <p className="font-mono font-bold text-sm text-foreground">{selectedComponent.specs.partNumber}</p>
                          {selectedComponent.specs.manufacturer && (
                            <p className="text-xs text-muted-foreground mt-1">Mfr: {selectedComponent.specs.manufacturer}</p>
                          )}
                        </div>
                      )}
                      {selectedComponent.specs.crossRef && selectedComponent.specs.crossRef.length > 0 && (
                        <div className="bg-secondary/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Cross-Reference Parts</p>
                          <div className="space-y-0.5">
                            {selectedComponent.specs.crossRef.map((ref, idx) => (
                              <p key={idx} className="font-mono text-xs text-foreground">{ref}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Overview */}
          <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-primary" />
              System Overview — {currentSchematic.name}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Pumps</p>
                <p className="font-medium">{componentCounts.pumps}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Valve Blocks</p>
                <p className="font-medium">{componentCounts.valves}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Cylinders</p>
                <p className="font-medium">{componentCounts.cylinders}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Motors</p>
                <p className="font-medium">{componentCounts.motors}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HydraulicSchematic;

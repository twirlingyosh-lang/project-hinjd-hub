import { useState, useMemo, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Wrench, Search, X, Filter, Hash, ArrowRight, Printer, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HydraulicComponent, HydraulicLine, ComponentType } from '@/data/hydraulicTypes';
import { allSchematics, schematicCategories, SchematicCategory } from '@/data/hydraulicSchematics';
import { toast } from 'sonner';

interface PartLookupResult {
  schematicId: string;
  schematicName: string;
  category: string;
  component: HydraulicComponent;
  matchType: 'oem' | 'crossRef';
  matchedValue: string;
}

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

  const [partLookupTerm, setPartLookupTerm] = useState('');
  const [highlightedComponentId, setHighlightedComponentId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Part number quick-lookup across ALL schematics
  const partLookupResults = useMemo<PartLookupResult[]>(() => {
    if (!partLookupTerm || partLookupTerm.length < 2) return [];
    const term = partLookupTerm.toLowerCase();
    const results: PartLookupResult[] = [];
    for (const schematic of allSchematics) {
      for (const comp of schematic.components) {
        if (comp.specs.partNumber?.toLowerCase().includes(term)) {
          results.push({ schematicId: schematic.id, schematicName: schematic.name, category: schematic.category, component: comp, matchType: 'oem', matchedValue: comp.specs.partNumber });
        }
        comp.specs.crossRef?.forEach(ref => {
          if (ref.toLowerCase().includes(term)) {
            results.push({ schematicId: schematic.id, schematicName: schematic.name, category: schematic.category, component: comp, matchType: 'crossRef', matchedValue: ref });
          }
        });
      }
    }
    return results;
  }, [partLookupTerm]);

  const handlePartLookupSelect = useCallback((result: PartLookupResult) => {
    setSelectedBrand(result.schematicId);
    setSelectedComponent(result.component);
    setHighlightedComponentId(result.component.id);
    setPartLookupTerm('');
    // Auto-clear highlight after 3 seconds
    setTimeout(() => setHighlightedComponentId(null), 3000);
  }, []);

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

  const buildExportSvgString = useCallback(() => {
    if (!svgRef.current) return null;
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('width', '1240');
    svgClone.setAttribute('height', '1120');
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', '#0f172a');
    svgClone.insertBefore(bgRect, svgClone.firstChild);
    return new XMLSerializer().serializeToString(svgClone);
  }, []);

  const handleExportPNG = useCallback(async () => {
    const svgString = buildExportSvgString();
    if (!svgString) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1240;
      canvas.height = 1120;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => { ctx.drawImage(img, 0, 0); URL.revokeObjectURL(url); resolve(); };
        img.onerror = reject;
        img.src = url;
      });
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${currentSchematic.name.replace(/\s+/g, '-')}-hydraulic-schematic.png`;
      link.href = pngUrl;
      link.click();
      toast.success('Schematic exported as PNG');
    } catch { toast.error('Failed to export schematic'); }
  }, [buildExportSvgString, currentSchematic.name]);

  const handlePrint = useCallback(() => {
    const svgString = buildExportSvgString();
    if (!svgString) return;
    const rows = currentSchematic.components.map(c =>
      `<tr><td style="padding:4px 8px;border:1px solid #ddd">${c.name}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.type}</td><td style="padding:4px 8px;border:1px solid #ddd;font-family:monospace">${c.specs.partNumber || '—'}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.specs.manufacturer || '—'}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.specs.pressure || '—'}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.specs.flow || '—'}</td></tr>`
    ).join('');
    const w = window.open('', '_blank');
    if (!w) { toast.error('Pop-up blocked — allow pop-ups to print'); return; }
    w.document.write(`<!DOCTYPE html><html><head><title>${currentSchematic.name} Hydraulic Schematic</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#333}h1{font-size:22px;margin-bottom:4px}.sub{color:#666;font-size:14px;margin-bottom:24px}.svg-wrap{background:#0f172a;border-radius:8px;padding:16px;margin-bottom:24px}svg{width:100%;height:auto}table{border-collapse:collapse;width:100%;font-size:12px;margin-top:8px}th{background:#f1f5f9;padding:6px 8px;border:1px solid #ddd;text-align:left;font-weight:600}.ft{margin-top:32px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:12px}@media print{body{margin:20px}}</style></head><body><h1>${currentSchematic.name} Hydraulic System</h1><p class="sub">${currentSchematic.description}</p><div class="svg-wrap">${svgString}</div><h2 style="font-size:16px;margin-top:24px">Component Details</h2><table><thead><tr><th>Component</th><th>Type</th><th>Part Number</th><th>Manufacturer</th><th>Pressure</th><th>Flow</th></tr></thead><tbody>${rows}</tbody></table><div class="ft">Generated from HINJD Ecosystem Hub — ${new Date().toLocaleDateString()}</div><script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
    toast.success('Print dialog opened');
  }, [buildExportSvgString, currentSchematic]);


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
      <div className="flex flex-col gap-4">
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
              placeholder="Search brand, part #, manufacturer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary/50"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Component Type Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mr-1">Component:</span>
          {(['all', 'pump', 'valve', 'cylinder', 'motor', 'filter', 'reservoir', 'cooler'] as const).map(type => (
            <Button
              key={type}
              size="sm"
              variant={componentTypeFilter === type ? 'default' : 'outline'}
              className="h-7 text-xs px-2.5"
              onClick={() => setComponentTypeFilter(type)}
            >
              {type === 'all' ? 'All' : COMPONENT_TYPE_LABELS[type]}
            </Button>
          ))}
          {hasActiveFilters && (
            <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground ml-auto" onClick={clearAllFilters}>
              <X className="h-3 w-3 mr-1" /> Clear filters
            </Button>
          )}
        </div>

        {/* Results count */}
        <div className="text-xs text-muted-foreground">
          Showing {filteredBrands.length} of {allSchematics.length} schematics
          {searchTerm && <span> matching "<span className="text-foreground font-medium">{searchTerm}</span>"</span>}
        </div>

        {/* Part Number Quick Lookup */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">Part Number Quick Lookup</h4>
              <span className="text-xs text-muted-foreground">— Search across all schematics</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter part number (e.g. A4VG71, 4474-638...)"
                value={partLookupTerm}
                onChange={e => setPartLookupTerm(e.target.value)}
                className="pl-9 bg-background"
              />
              {partLookupTerm && (
                <button onClick={() => setPartLookupTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {partLookupTerm.length >= 2 && (
              <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
                {partLookupResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">No parts found matching "{partLookupTerm}"</p>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-2">{partLookupResults.length} result{partLookupResults.length !== 1 ? 's' : ''} found</p>
                    {partLookupResults.map((result, idx) => (
                      <button
                        key={`${result.schematicId}-${result.component.id}-${idx}`}
                        onClick={() => handlePartLookupSelect(result)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-md bg-background hover:bg-accent border border-border/50 text-left transition-colors"
                      >
                        <div className="h-8 w-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: COMPONENT_COLORS[result.component.type] }}>
                          <span className="text-[10px] font-bold text-white">{result.component.type.slice(0, 3).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.component.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.schematicName}
                            <Badge variant="outline" className="ml-1.5 text-[9px] px-1 py-0">{result.matchType === 'oem' ? 'OEM' : 'X-REF'}</Badge>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-mono font-bold text-primary">{result.matchedValue}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
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
                <filter id="highlight-glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
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
                const isHighlighted = highlightedComponentId === comp.id;
                return (
                  <g
                    key={comp.id}
                    className="cursor-pointer transition-opacity"
                    onClick={() => setSelectedComponent(isSelected ? null : comp)}
                    filter={isHighlighted ? 'url(#highlight-glow)' : isSelected ? 'url(#glow)' : undefined}
                  >
                    {isHighlighted && (
                      <rect
                        x={comp.x - 4}
                        y={comp.y - 4}
                        width={comp.width + 8}
                        height={comp.height + 8}
                        rx="8"
                        fill="none"
                        stroke="hsl(45, 100%, 60%)"
                        strokeWidth="2.5"
                        opacity="0.9"
                      >
                        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1s" repeatCount="indefinite" />
                      </rect>
                    )}
                    <rect
                      x={comp.x}
                      y={comp.y}
                      width={comp.width}
                      height={comp.height}
                      rx="6"
                      fill={COMPONENT_COLORS[comp.type]}
                      stroke={isHighlighted ? 'hsl(45, 100%, 60%)' : isSelected ? '#fff' : 'rgba(255,255,255,0.2)'}
                      strokeWidth={isHighlighted ? 3 : isSelected ? 2.5 : 1}
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

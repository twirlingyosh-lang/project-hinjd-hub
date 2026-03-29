import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Layers, Satellite, Mountain, MapPin, Activity, Clock, Wrench, Gauge, Fuel, Zap, AlertTriangle, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEquipmentMaster, EquipmentNode } from '@/hooks/useEquipmentMaster';
import { GOOGLE_MAPS_API_KEY } from '@/lib/googleMapsConfig';

const LIBRARIES: ("places")[] = ['places'];

const mapContainerStyle = { width: '100%', height: '100%', minHeight: '500px' };
const defaultCenter = { lat: 40.7612, lng: -111.891 };

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e4166' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
];

type MapStyle = 'roadmap' | 'satellite' | 'terrain';

const STATUS_COLORS: Record<string, string> = {
  Operational: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  'In-Transit': 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  Idle: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  Warning: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  Maintenance: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
};

const STATUS_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Operational: 'default',
  'In-Transit': 'secondary',
  Idle: 'outline',
  Warning: 'destructive',
  Maintenance: 'destructive',
};

const TELEMETRY_ICONS: Record<string, typeof Gauge> = {
  hydraulic_pressure: Gauge,
  motor_load: Zap,
  fuel_level: Fuel,
  belt_speed_fpm: Activity,
  belt_tension: Gauge,
  material_tph: Activity,
  material_flow_tph: Activity,
  css: Wrench,
  coolant_temp: Gauge,
  output_kw: Zap,
  payload_tons: Gauge,
};

function formatTelemetryKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace('Tph', 'TPH')
    .replace('Fpm', 'FPM')
    .replace('Psi', 'PSI')
    .replace('Kw', 'kW')
    .replace('Mph', 'MPH')
    .replace('Css', 'CSS')
    .replace('Hz', 'Hz');
}

function formatTelemetryValue(key: string, value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Active' : 'Inactive';
  if (typeof value === 'number') {
    if (key.includes('pct') || key.includes('level') || key.includes('tension') || key.includes('load')) return `${value}%`;
    if (key.includes('pressure')) return `${value} PSI`;
    if (key.includes('temp')) return `${value}°F`;
    if (key.includes('fpm')) return `${value} FPM`;
    if (key.includes('tph')) return `${value} TPH`;
    if (key.includes('kw')) return `${value} kW`;
    if (key.includes('mph') || key.includes('speed_mph')) return `${value} MPH`;
    if (key.includes('tons')) return `${value} T`;
    if (key.includes('psi')) return `${value} PSI`;
    if (key.includes('hz')) return `${value} Hz`;
    if (key.includes('amps')) return `${value} A`;
    if (key === 'css') return `${value} mm`;
    return `${value}`;
  }
  return String(value);
}

export default function EquipmentMasterMap() {
  const { data: nodes = [], isLoading } = useEquipmentMaster();
  const [mapStyle, setMapStyle] = useState<MapStyle>('roadmap');
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapRenderError, setMapRenderError] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const filteredNodes = useMemo(() => {
    let result = nodes;
    if (statusFilter) result = result.filter(n => n.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.node_id.toLowerCase().includes(q) ||
        (n.equipment_type?.toLowerCase().includes(q)) ||
        (n.model?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [nodes, statusFilter, searchQuery]);

  const nodesWithCoords = useMemo(
    () => filteredNodes.filter(n => n.lat != null && n.lng != null),
    [filteredNodes]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach(n => {
      const s = n.status || 'Unknown';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [nodes]);

  const getMapOptions = useCallback((): google.maps.MapOptions => {
    const base: google.maps.MapOptions = {
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: 'greedy',
    };
    if (mapStyle === 'roadmap') return { ...base, mapTypeId: 'roadmap', styles: darkMapStyle };
    if (mapStyle === 'satellite') return { ...base, mapTypeId: 'hybrid', styles: [] };
    return { ...base, mapTypeId: 'terrain', styles: [], tilt: 45 };
  }, [mapStyle]);

  if (loadError || mapRenderError) {
    return <FleetFallbackTable nodes={nodes} isLoading={isLoading} />;
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading fleet map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={14}
        options={getMapOptions()}
        onTilesLoaded={() => setMapRenderError(false)}
      >
        {nodesWithCoords.map(node => (
          <Marker
            key={node.node_id}
            position={{ lat: node.lat!, lng: node.lng! }}
            onClick={() => setActiveNode(node.node_id)}
            icon={{
              url: STATUS_COLORS[node.status || ''] || 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
              scaledSize: new google.maps.Size(36, 36),
            }}
            title={`${node.node_id} — ${node.model}`}
          />
        ))}

        {nodesWithCoords.map(node =>
          activeNode === node.node_id ? (
            <InfoWindow
              key={`info-${node.node_id}`}
              position={{ lat: node.lat!, lng: node.lng! }}
              onCloseClick={() => setActiveNode(null)}
            >
              <TelemetryPopup node={node} />
            </InfoWindow>
          ) : null
        )}
      </GoogleMap>

      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-10 w-64">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search node ID, type, model..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-8 h-9 text-xs bg-background/90 backdrop-blur-sm border-border shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-1 text-[10px] text-muted-foreground bg-background/80 backdrop-blur-sm rounded px-2 py-0.5">
            {filteredNodes.length} of {nodes.length} units
          </p>
        )}
      </div>

      {/* Layer Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg shadow-lg backdrop-blur-sm bg-background/90 border border-border hover:bg-muted transition-colors"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
          >
            <Layers className="h-4 w-4" />
            Layers
          </button>
          {showLayerMenu && (
            <div className="absolute top-full right-0 mt-2 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl border p-2 space-y-1 animate-fade-in min-w-[140px]">
              {([['roadmap', MapPin, 'HINJD Dark'], ['satellite', Satellite, 'Satellite'], ['terrain', Mountain, '3D Terrain']] as const).map(([key, Icon, label]) => (
                <button
                  key={key}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors",
                    mapStyle === key ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => { setMapStyle(key); setShowLayerMenu(false); }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Filter Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-background/95 backdrop-blur-md rounded-xl shadow-2xl border border-border p-3 animate-fade-in">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Fleet Status</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setStatusFilter(null)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-full border transition-colors",
                !statusFilter ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
              )}
            >
              All ({nodes.length})
            </button>
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                className={cn(
                  "text-[10px] px-2 py-1 rounded-full border transition-colors",
                  statusFilter === status ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                )}
              >
                {status} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TelemetryPopup({ node }: { node: EquipmentNode }) {
  const telemetry = node.telemetry as Record<string, unknown> | null;

  return (
    <div className="p-1 min-w-[240px] max-w-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-sm text-foreground">{node.node_id}</h3>
          <p className="text-xs text-muted-foreground">{node.model}</p>
        </div>
        <Badge variant={STATUS_BADGE_VARIANT[node.status || ''] ?? 'outline'} className="text-[10px]">
          {node.status}
        </Badge>
      </div>

      {/* Equipment Info */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wrench className="h-3 w-3 text-primary" />
          <span>{node.equipment_type}</span>
        </div>
        {node.current_spec_task && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="h-3 w-3 text-primary" />
            <span className="truncate">{node.current_spec_task}</span>
          </div>
        )}
        {node.runtime_hours != null && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 text-primary" />
            <span>{node.runtime_hours.toLocaleString()} hrs</span>
          </div>
        )}
      </div>

      {/* Telemetry Grid */}
      {telemetry && Object.keys(telemetry).length > 0 && (
        <div className="border-t pt-2 mt-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5">
            Live Telemetry
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {Object.entries(telemetry).map(([key, value]) => {
              const Icon = TELEMETRY_ICONS[key] || Gauge;
              return (
                <div key={key} className="flex items-center gap-1 text-[11px]">
                  <Icon className="h-3 w-3 text-primary shrink-0" />
                  <span className="text-muted-foreground truncate">{formatTelemetryKey(key)}:</span>
                  <span className="font-semibold text-foreground ml-auto">{formatTelemetryValue(key, value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Last Maintenance */}
      {node.last_maintenance && (
        <p className="text-[10px] text-muted-foreground mt-2 border-t pt-1.5">
          Last maintenance: {new Date(node.last_maintenance).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function FleetFallbackTable({ nodes, isLoading }: { nodes: EquipmentNode[]; isLoading: boolean }) {
  const STATUS_DOT: Record<string, string> = {
    Operational: 'bg-green-500',
    'In-Transit': 'bg-blue-500',
    Idle: 'bg-yellow-500',
    Warning: 'bg-orange-500',
    Maintenance: 'bg-red-500',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-background rounded-lg border border-border">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-primary" />
        <p className="text-sm text-muted-foreground">Map unavailable — showing fleet data as table</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-3 font-semibold text-muted-foreground">Node</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Type</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Model</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Task</th>
              <th className="text-right p-3 font-semibold text-muted-foreground">Hours</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map(node => (
              <tr key={node.node_id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="p-3 font-mono font-bold text-primary">{node.node_id}</td>
                <td className="p-3">{node.equipment_type}</td>
                <td className="p-3 text-muted-foreground">{node.model}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={cn('w-2 h-2 rounded-full', STATUS_DOT[node.status || ''] || 'bg-muted')} />
                    {node.status}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground max-w-[200px] truncate">{node.current_spec_task}</td>
                <td className="p-3 text-right font-mono">{node.runtime_hours?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

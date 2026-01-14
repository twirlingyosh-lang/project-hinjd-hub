import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Satellite, Mountain, MapPin, Navigation, Clock, Route } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Dealer {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  makes_served: string[];
  latitude: number | null;
  longitude: number | null;
}

interface LogisticsData {
  distance: string;
  duration: string;
  isLoading: boolean;
}

interface GoogleMapViewProps {
  dealers: Dealer[];
  selectedDealer?: Dealer | null;
  onDealerSelect?: (dealer: Dealer) => void;
  jobSiteLocation?: { lat: number; lng: number } | null;
  showLogistics?: boolean;
}

type MapStyle = 'roadmap' | 'satellite' | 'terrain';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
};

const defaultCenter = { lat: 40.5, lng: -111.9 }; // Salt Lake area

// HINJD Dark map style
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

export const GoogleMapView = ({
  dealers,
  selectedDealer,
  onDealerSelect,
  jobSiteLocation,
  showLogistics = true,
}: GoogleMapViewProps) => {
  const [mapStyle, setMapStyle] = useState<MapStyle>('roadmap');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [logistics, setLogistics] = useState<LogisticsData>({
    distance: '--',
    duration: '--',
    isLoading: false,
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const dealersWithCoords = dealers.filter(d => d.latitude && d.longitude);
  const center = dealersWithCoords.length > 0
    ? { lat: dealersWithCoords[0].latitude!, lng: dealersWithCoords[0].longitude! }
    : defaultCenter;

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Calculate route when dealer and job site are selected
  useEffect(() => {
    if (!map || !selectedDealer?.latitude || !selectedDealer?.longitude || !jobSiteLocation) {
      setDirections(null);
      setLogistics({ distance: '--', duration: '--', isLoading: false });
      return;
    }

    setLogistics(prev => ({ ...prev, isLoading: true }));

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: selectedDealer.latitude, lng: selectedDealer.longitude },
        destination: jobSiteLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const leg = result.routes[0]?.legs[0];
          setLogistics({
            distance: leg?.distance?.text || '--',
            duration: leg?.duration?.text || '--',
            isLoading: false,
          });
        } else {
          setLogistics({ distance: '--', duration: '--', isLoading: false });
        }
      }
    );
  }, [map, selectedDealer, jobSiteLocation]);

  const getMapOptions = useCallback((): google.maps.MapOptions => {
    const baseOptions: google.maps.MapOptions = {
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: 'greedy',
    };

    if (mapStyle === 'roadmap') {
      return { ...baseOptions, mapTypeId: 'roadmap', styles: darkMapStyle };
    } else if (mapStyle === 'satellite') {
      return { ...baseOptions, mapTypeId: 'hybrid', styles: [] };
    } else {
      return { ...baseOptions, mapTypeId: 'terrain', styles: [], tilt: 45 };
    }
  }, [mapStyle]);

  useEffect(() => {
    if (map) {
      const options = getMapOptions();
      map.setOptions(options);
    }
  }, [map, mapStyle, getMapOptions]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">Failed to load Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={8}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={getMapOptions()}
      >
        {/* Dealer markers */}
        {dealersWithCoords.map(dealer => (
          <Marker
            key={dealer.id}
            position={{ lat: dealer.latitude!, lng: dealer.longitude! }}
            onClick={() => {
              setActiveInfoWindow(dealer.id);
              onDealerSelect?.(dealer);
            }}
            icon={{
              url: selectedDealer?.id === dealer.id
                ? 'https://maps.google.com/mapfiles/ms/icons/gold-dot.png'
                : 'https://maps.google.com/mapfiles/ms/icons/ltblue-dot.png',
              scaledSize: new google.maps.Size(40, 40),
            }}
          />
        ))}

        {/* Job site marker */}
        {jobSiteLocation && (
          <Marker
            position={jobSiteLocation}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: new google.maps.Size(40, 40),
            }}
          />
        )}

        {/* Info windows */}
        {dealersWithCoords.map(dealer => (
          activeInfoWindow === dealer.id && (
            <InfoWindow
              key={`info-${dealer.id}`}
              position={{ lat: dealer.latitude!, lng: dealer.longitude! }}
              onCloseClick={() => setActiveInfoWindow(null)}
            >
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-foreground">{dealer.name}</h3>
                {dealer.city && dealer.state && (
                  <p className="text-sm text-muted-foreground">{dealer.city}, {dealer.state}</p>
                )}
                {dealer.phone && (
                  <a href={`tel:${dealer.phone}`} className="text-sm text-primary block mt-1">
                    {dealer.phone}
                  </a>
                )}
                {dealer.makes_served?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dealer.makes_served.slice(0, 3).map((m, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{m}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </InfoWindow>
          )
        ))}

        {/* Directions route */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#f59e0b',
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Layer switcher */}
      <div className="absolute top-4 right-4 z-10">
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            className="shadow-lg backdrop-blur-sm bg-background/90"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
          >
            <Layers className="h-4 w-4 mr-2" />
            Layers
          </Button>

          {showLayerMenu && (
            <div className="absolute top-full right-0 mt-2 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl border p-2 space-y-1 animate-fade-in">
              <button
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors",
                  mapStyle === 'roadmap' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
                onClick={() => { setMapStyle('roadmap'); setShowLayerMenu(false); }}
              >
                <MapPin className="h-4 w-4" />
                HINJD Dark
              </button>
              <button
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors",
                  mapStyle === 'satellite' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
                onClick={() => { setMapStyle('satellite'); setShowLayerMenu(false); }}
              >
                <Satellite className="h-4 w-4" />
                Satellite (HD)
              </button>
              <button
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors",
                  mapStyle === 'terrain' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
                onClick={() => { setMapStyle('terrain'); setShowLayerMenu(false); }}
              >
                <Mountain className="h-4 w-4" />
                3D Terrain
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logistics Intelligence Panel */}
      {showLogistics && selectedDealer && jobSiteLocation && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-background/95 backdrop-blur-md rounded-xl shadow-2xl border border-primary/20 p-4 animate-fade-in">
            {/* Decorative gradient */}
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Navigation className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-sm">Logistics Intelligence</h4>
                <Badge variant="outline" className="text-xs ml-auto">LIVE</Badge>
              </div>

              {/* Route visualization */}
              <div className="flex items-center gap-2 mb-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-muted-foreground">Dealer</span>
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-500 via-primary to-green-500 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_2s_infinite]" 
                    style={{ backgroundSize: '200% 100%' }} />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Site</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Route className="h-3 w-3" />
                    Distance
                  </div>
                  <div className={cn(
                    "text-xl font-bold transition-all duration-500",
                    logistics.isLoading ? "opacity-50" : "animate-fade-in"
                  )}>
                    {logistics.isLoading ? (
                      <div className="h-7 w-20 bg-muted animate-pulse rounded" />
                    ) : (
                      logistics.distance
                    )}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Clock className="h-3 w-3" />
                    ETA
                  </div>
                  <div className={cn(
                    "text-xl font-bold text-primary transition-all duration-500",
                    logistics.isLoading ? "opacity-50" : "animate-fade-in"
                  )}>
                    {logistics.isLoading ? (
                      <div className="h-7 w-20 bg-muted animate-pulse rounded" />
                    ) : (
                      logistics.duration
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Route Optimization</span>
                  <span>{logistics.isLoading ? 'Calculating...' : '100%'}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-1000",
                      logistics.isLoading ? "w-1/3 animate-pulse" : "w-full"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapView;

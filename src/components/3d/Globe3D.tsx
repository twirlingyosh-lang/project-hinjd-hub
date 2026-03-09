import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const locations = [
  { lat: 33.7, lng: -84.4, label: 'Atlanta, GA' },
  { lat: 36.1, lng: -115.2, label: 'Las Vegas, NV' },
  { lat: 29.7, lng: -95.4, label: 'Houston, TX' },
  { lat: 39.1, lng: -94.6, label: 'Kansas City, MO' },
  { lat: 47.6, lng: -122.3, label: 'Seattle, WA' },
  { lat: 40.7, lng: -74.0, label: 'New York, NY' },
];

const latLngToPos = (lat: number, lng: number, r: number): [number, number, number] => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
};

const GlobeWireframe = () => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  const gridLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lng = 0; lng <= 360; lng += 5) {
        const [x, y, z] = latLngToPos(lat, lng, 1.5);
        pts.push(new THREE.Vector3(x, y, z));
      }
      lines.push(pts);
    }
    // Longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        const [x, y, z] = latLngToPos(lat, lng, 1.5);
        pts.push(new THREE.Vector3(x, y, z));
      }
      lines.push(pts);
    }
    return lines;
  }, []);

  return (
    <group ref={ref}>
      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[1.48, 32, 32]} />
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0.6}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Grid lines */}
      {gridLines.map((pts, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color="#f59e0b" transparent opacity={0.15} />
          </line>
        );
      })}

      {/* Location markers */}
      {locations.map((loc, i) => {
        const pos = latLngToPos(loc.lat, loc.lng, 1.52);
        return (
          <group key={i} position={pos}>
            <mesh>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={1}
              />
            </mesh>
            {/* Pulse ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.04, 0.06, 16]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.58, 32, 32]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

const Globe3D = () => {
  return (
    <section className="animate-slide-up">
      <div className="text-center mb-6">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">
          Global Operations
        </span>
        <h2 className="text-2xl md:text-3xl industrial-title">
          Serving <span className="text-primary">Nationwide</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Equipment dealers and BeltSaver® installations across the United States.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="h-72 sm:h-80 cursor-grab active:cursor-grabbing">
          <Canvas
            camera={{ position: [0, 1, 4], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true }}
          >
            <ambientLight intensity={0.3} />
            <directionalLight position={[3, 3, 3]} intensity={0.8} />
            <pointLight position={[-3, 2, -2]} intensity={0.3} color="#6495ED" />
            <GlobeWireframe />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.3}
            />
          </Canvas>
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex flex-wrap justify-center gap-3">
            {locations.slice(0, 4).map((loc) => (
              <span key={loc.label} className="text-[10px] text-muted-foreground uppercase tracking-wider bg-secondary/50 px-2.5 py-1 rounded-full">
                {loc.label}
              </span>
            ))}
            <span className="text-[10px] text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full">
              +{locations.length - 4} more
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Globe3D;

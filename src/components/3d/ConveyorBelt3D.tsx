import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { AlertTriangle, CheckCircle2, ArrowRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Roller component
const Roller = ({ position, radius = 0.3, hasBeltSaver = false }: { position: [number, number, number]; radius?: number; hasBeltSaver?: boolean }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z -= delta * 3;
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <cylinderGeometry args={[radius, radius, 1.8, 16]} />
        <meshStandardMaterial color={hasBeltSaver ? '#f59e0b' : '#555'} metalness={0.7} roughness={0.3} />
      </mesh>
      {hasBeltSaver && (
        <>
          <mesh position={[0, 0.95, 0]}>
            <torusGeometry args={[radius + 0.05, 0.04, 8, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, -0.95, 0]}>
            <torusGeometry args={[radius + 0.05, 0.04, 8, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}
    </group>
  );
};

// Belt surface
const Belt = ({ showBeltSaver, isRunning }: { showBeltSaver: boolean; isRunning: boolean }) => {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const timeRef = useRef(0);

  const beltShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-3, -0.05);
    shape.lineTo(3, -0.05);
    shape.lineTo(3, 0.05);
    shape.lineTo(-3, 0.05);
    shape.lineTo(-3, -0.05);
    return shape;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current || !isRunning) return;
    timeRef.current += delta;
    
    if (!showBeltSaver) {
      const wander = Math.sin(timeRef.current * 1.5) * 0.3 + Math.sin(timeRef.current * 3.7) * 0.1;
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, wander, 0.05);
    } else {
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, 0, 0.1);
    }
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.35]}>
      <boxGeometry args={[6.2, 1.8, 0.08]} />
      <meshStandardMaterial
        ref={matRef}
        color="#333"
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  );
};

// Material chunks on belt
const MaterialChunks = ({ isRunning }: { isRunning: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);

  const chunks = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 1.2,
      scale: 0.08 + Math.random() * 0.12,
      speed: 0.5 + Math.random() * 0.5,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current || !isRunning) return;
    groupRef.current.children.forEach((child, i) => {
      child.position.x += delta * chunks[i].speed;
      if (child.position.x > 3.2) child.position.x = -3.2;
      child.rotation.x += delta * 0.5;
      child.rotation.z += delta * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {chunks.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, 0.5]} scale={c.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#8B7355" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

// Frame / support structure
const Frame = () => (
  <group>
    {/* Side rails */}
    <mesh position={[0, 1.05, 0.15]}>
      <boxGeometry args={[6.8, 0.05, 0.6]} />
      <meshStandardMaterial color="#444" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0, -1.05, 0.15]}>
      <boxGeometry args={[6.8, 0.05, 0.6]} />
      <meshStandardMaterial color="#444" metalness={0.8} roughness={0.3} />
    </mesh>
    {/* Legs */}
    {[-2.5, 0, 2.5].map((x) => (
      <group key={x}>
        <mesh position={[x, 1, -0.3]}>
          <boxGeometry args={[0.06, 0.06, 0.8]} />
          <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[x, -1, -0.3]}>
          <boxGeometry args={[0.06, 0.06, 0.8]} />
          <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    ))}
  </group>
);

// Scene
const ConveyorScene = ({ showBeltSaver, isRunning }: { showBeltSaver: boolean; isRunning: boolean }) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#6495ED" />
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#f59e0b" />

      <group rotation={[0.3, 0.4, 0]}>
        <Frame />
        <Roller position={[-3, 0, 0.35]} radius={0.25} />
        <Roller position={[3, 0, 0.35]} radius={0.35} hasBeltSaver={showBeltSaver} />
        <Roller position={[-1, 0, 0.35]} radius={0.15} />
        <Roller position={[1, 0, 0.35]} radius={0.15} />
        <Belt showBeltSaver={showBeltSaver} isRunning={isRunning} />
        <MaterialChunks isRunning={isRunning} />
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};

const ConveyorBelt3D = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(true);
  const [showBeltSaver, setShowBeltSaver] = useState(false);

  const damageLevel = showBeltSaver ? 0 : 65;

  return (
    <section className="animate-slide-up">
      <div className="text-center mb-6">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">
          3D Interactive Demo
        </span>
        <h2 className="text-2xl md:text-3xl industrial-title">
          See the <span className="text-primary">Difference</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Explore the 3D conveyor — toggle BeltSaver® to see real-time belt tracking behavior.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* 3D Canvas */}
        <div className="relative h-64 sm:h-80 bg-gradient-to-b from-secondary/50 to-background">
          <Canvas
            camera={{ position: [0, 2, 6], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true }}
          >
            <ConveyorScene showBeltSaver={showBeltSaver} isRunning={isRunning} />
          </Canvas>

          {/* Status badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all duration-500 ${
              showBeltSaver
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}>
              {showBeltSaver ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Tracking Stable
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Belt Wandering
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-5 border-t border-border space-y-4">
          <div className="flex items-center justify-center gap-4">
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${!showBeltSaver ? 'text-destructive' : 'text-muted-foreground/40'}`}>
              Without
            </span>
            <button
              onClick={() => setShowBeltSaver(!showBeltSaver)}
              className={`relative w-16 h-8 rounded-full transition-all duration-500 ${showBeltSaver ? 'bg-primary' : 'bg-destructive/60'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-foreground transition-all duration-300 ${showBeltSaver ? 'left-9' : 'left-1'}`} />
            </button>
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${showBeltSaver ? 'text-primary' : 'text-muted-foreground/40'}`}>
              BeltSaver®
            </span>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRunning ? <Pause size={12} /> : <Play size={12} />}
              {isRunning ? 'Pause' : 'Play'} Simulation
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className={`text-lg font-black ${showBeltSaver ? 'text-primary' : 'text-destructive'}`}>
                {showBeltSaver ? '0°' : '18°'}
              </div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Tracking Drift</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className={`text-lg font-black ${showBeltSaver ? 'text-primary' : 'text-destructive'}`}>
                {showBeltSaver ? '$0' : '$7,800'}
              </div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Damage Cost/Mo</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className={`text-lg font-black ${showBeltSaver ? 'text-primary' : 'text-destructive'}`}>
                {showBeltSaver ? '100%' : '48%'}
              </div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Belt Life</div>
            </div>
          </div>

          <div className="flex items-center justify-center pt-2">
            <Button
              onClick={() => navigate('/beltsaver')}
              className="text-[10px] font-black uppercase tracking-widest rounded-xl gap-2"
            >
              Learn More About BeltSaver®
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConveyorBelt3D;

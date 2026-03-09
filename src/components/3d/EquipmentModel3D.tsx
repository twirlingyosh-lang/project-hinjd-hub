import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Jaw Crusher model (procedural)
const JawCrusher = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef} scale={0.8}>
        {/* Main body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 1.5, 1.5]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Feed opening */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[1.8, 0.5, 1.3]} />
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Feed hopper walls */}
        <mesh position={[-0.95, 1.5, 0]}>
          <boxGeometry args={[0.1, 1, 1.4]} />
          <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.95, 1.5, 0]}>
          <boxGeometry args={[0.1, 1, 1.4]} />
          <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Flywheel */}
        <mesh position={[1.2, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.15, 20]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} emissive="#f59e0b" emissiveIntensity={0.15} />
        </mesh>
        {/* Base */}
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[2.4, 0.3, 1.8]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Discharge */}
        <mesh position={[0, -0.6, 0.9]}>
          <boxGeometry args={[1.2, 0.6, 0.3]} />
          <meshStandardMaterial color="#444" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    </Float>
  );
};

const EquipmentModel3D = () => {
  return (
    <section className="animate-slide-up">
      <div className="text-center mb-6">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">
          3D Equipment Preview
        </span>
        <h2 className="text-2xl md:text-3xl industrial-title">
          Industrial <span className="text-primary">Machinery</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Interactive 3D view — drag to rotate. AI diagnostics available for crushers, screeners & conveyors.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="h-72 sm:h-80 cursor-grab active:cursor-grabbing">
          <Canvas
            camera={{ position: [4, 3, 5], fov: 40 }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#6495ED" />
            <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.5} penumbra={0.5} />
            <JawCrusher />
            <Environment preset="warehouse" />
            <gridHelper args={[10, 10, '#333', '#222']} position={[0, -1.2, 0]} />
          </Canvas>
        </div>
        <div className="p-4 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Drag to rotate • Scroll to zoom • Jaw Crusher Model
          </p>
        </div>
      </div>
    </section>
  );
};

export default EquipmentModel3D;

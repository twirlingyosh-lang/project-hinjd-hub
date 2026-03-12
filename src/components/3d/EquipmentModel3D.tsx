import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PART_INFO: Record<string, { name: string; description: string }> = {
  flywheel: { name: 'Flywheel', description: 'Stores rotational energy to maintain jaw momentum through the crushing stroke' },
  head_pulley: { name: 'Head / Drive Pulley', description: 'Drives the belt via friction; powered by the gearbox motor' },
  tail_pulley: { name: 'Tail Pulley', description: 'Provides belt tension and return-side tracking at the loading end' },
  eccentric_shaft: { name: 'Eccentric Shaft', description: 'Converts motor rotation into linear vibration for the screen decks' },
  deck_0: { name: 'Top Deck', description: 'Coarsest screen media — scalps oversize material first' },
  deck_1: { name: 'Middle Deck', description: 'Intermediate sizing — separates mid-range aggregate' },
  deck_2: { name: 'Bottom Deck', description: 'Finest screen media — produces spec sand and fines' },
  idler_0: { name: 'Troughing Idler (Center)', description: 'Supports and shapes the belt into a trough for material containment' },
  'idler_-1': { name: 'Troughing Idler', description: 'Carries belt load between head and tail pulleys' },
  idler_1: { name: 'Troughing Idler', description: 'Carries belt load between head and tail pulleys' },
  'idler_-2': { name: 'Troughing Idler (Tail)', description: 'Supports belt near the loading zone' },
  idler_2: { name: 'Troughing Idler (Head)', description: 'Supports belt near the discharge zone' },
};

type EquipmentType = 'crusher' | 'screener' | 'conveyor';

const EQUIPMENT_INFO: Record<EquipmentType, { label: string; description: string }> = {
  crusher: { label: 'Jaw Crusher', description: 'Primary reduction unit with oscillating jaw plate & flywheel drive' },
  screener: { label: 'Vibrating Screener', description: 'Multi-deck screening unit with eccentric shaft vibration system' },
  conveyor: { label: 'Belt Conveyor', description: 'Troughed belt conveyor with drive drum, idlers & tail pulley' },
};

const stdMat = (color: number, metalness = 0.8, roughness = 0.3) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness });

const accentMat = () =>
  new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1, emissive: 0xf59e0b, emissiveIntensity: 0.15 });

function addMesh(group: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, name?: string): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (name) m.name = name;
  group.add(m);
  return m;
}

function buildCrusher(): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(0.8);
  addMesh(g, new THREE.BoxGeometry(2, 1.5, 1.5), stdMat(0x4a4a4a), 0, 0, 0);
  addMesh(g, new THREE.BoxGeometry(1.8, 0.5, 1.3), stdMat(0x333333, 0.6, 0.4), 0, 1, 0);
  addMesh(g, new THREE.BoxGeometry(0.1, 1, 1.4), stdMat(0x555555, 0.7), -0.95, 1.5, 0);
  addMesh(g, new THREE.BoxGeometry(0.1, 1, 1.4), stdMat(0x555555, 0.7), 0.95, 1.5, 0);
  const fw = addMesh(g, new THREE.CylinderGeometry(0.5, 0.5, 0.15, 20), accentMat(), 1.2, 0.3, 0, 'flywheel');
  fw.rotation.x = Math.PI / 2;
  addMesh(g, new THREE.BoxGeometry(2.4, 0.3, 1.8), stdMat(0x3a3a3a, 0.5, 0.5), 0, -1, 0);
  addMesh(g, new THREE.BoxGeometry(1.2, 0.6, 0.3), stdMat(0x444444, 0.6, 0.4), 0, -0.6, 0.9);
  addMesh(g, new THREE.BoxGeometry(0.08, 1.2, 1.0), stdMat(0x666666, 0.7, 0.25), -0.6, 0.2, 0);
  addMesh(g, new THREE.BoxGeometry(0.12, 1.0, 1.2), stdMat(0x5a5a5a, 0.85, 0.2), 0.5, 0.3, 0);
  addMesh(g, new THREE.BoxGeometry(0.12, 1.0, 1.2), stdMat(0x5a5a5a, 0.85, 0.2), -0.4, 0.3, 0);
  return g;
}

function buildScreener(): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(0.7);

  // Main box frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.15, 2.0), stdMat(0x4a4a4a));
  frame.position.set(0, 0.6, 0);
  g.add(frame);

  // Screen decks (3 levels)
  for (let i = 0; i < 3; i++) {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.04, 1.8), stdMat(0x666666, 0.5, 0.6));
    deck.position.set(0, 0.3 - i * 0.4, 0);
    deck.name = `deck_${i}`;
    g.add(deck);

    // Wire mesh lines on each deck
    for (let j = -4; j <= 4; j++) {
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.8, 4), stdMat(0x888888, 0.9, 0.1));
      wire.position.set(j * 0.35, 0.32 - i * 0.4, 0);
      wire.rotation.x = Math.PI / 2;
      g.add(wire);
    }
  }

  // Side panels
  addMesh(g, new THREE.BoxGeometry(3.5, 1.4, 0.08), stdMat(0x555555, 0.7), 0, 0, 1.0);
  addMesh(g, new THREE.BoxGeometry(3.5, 1.4, 0.08), stdMat(0x555555, 0.7), 0, 0, -1.0);

  // Eccentric shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 12), accentMat());
  shaft.position.set(0, 0.6, 0);
  shaft.rotation.x = Math.PI / 2;
  shaft.name = 'eccentric_shaft';
  g.add(shaft);

  // Vibrator motor housing
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 12), stdMat(0x3a3a3a, 0.6, 0.4));
  motor.position.set(0, 0.6, 1.3);
  motor.rotation.x = Math.PI / 2;
  g.add(motor);

  // Spring mounts (4 corners)
  const springPositions = [[-1.5, -0.6, 0.8], [1.5, -0.6, 0.8], [-1.5, -0.6, -0.8], [1.5, -0.6, -0.8]];
  springPositions.forEach(([x, y, z]) => {
    // Spring coil (simplified as stacked toruses)
    for (let s = 0; s < 4; s++) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 12), accentMat());
      coil.position.set(x, y + s * 0.08, z);
      g.add(coil);
    }
    // Mount plate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.3), stdMat(0x3a3a3a, 0.5));
    plate.position.set(x, y - 0.05, z);
    g.add(plate);
  });

  // Feed chute
  const chute = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.6), stdMat(0x444444, 0.6, 0.4));
  chute.position.set(-2.0, 1.0, 0);
  g.add(chute);

  // Discharge lips
  for (let i = 0; i < 3; i++) {
    const lip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.6 - i * 0.1), stdMat(0x4a4a4a, 0.7));
    lip.position.set(2.0, 0.15 - i * 0.4, 0);
    g.add(lip);
  }

  return g;
}

function buildConveyor(): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(0.65);

  // Side stringers
  addMesh(g, new THREE.BoxGeometry(5.5, 0.08, 0.5), stdMat(0x4a4a4a), 0, 1.0, 0);
  addMesh(g, new THREE.BoxGeometry(5.5, 0.08, 0.5), stdMat(0x4a4a4a), 0, -1.0, 0);

  // Belt (flat top surface)
  const belt = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.8, 0.06), stdMat(0x2a2a2a, 0.1, 0.85));
  belt.position.set(0, 0, 0.3);
  g.add(belt);

  // Troughing idlers (angled rollers in sets of 3)
  for (let i = -2; i <= 2; i++) {
    const x = i * 1.0;
    // Center roller
    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 10), stdMat(0x666666, 0.7, 0.3));
    center.position.set(x, 0, 0.25);
    center.rotation.x = Math.PI / 2;
    center.name = `idler_${i}`;
    g.add(center);
    // Wing rollers (angled)
    const wingL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), stdMat(0x666666, 0.7));
    wingL.position.set(x, 0.8, 0.35);
    wingL.rotation.set(Math.PI / 2, 0, 0.5);
    g.add(wingL);
    const wingR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), stdMat(0x666666, 0.7));
    wingR.position.set(x, -0.8, 0.35);
    wingR.rotation.set(Math.PI / 2, 0, -0.5);
    g.add(wingR);
  }

  // Head/drive pulley (large)
  const headPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.0, 16), accentMat());
  headPulley.position.set(2.8, 0, 0.3);
  headPulley.rotation.x = Math.PI / 2;
  headPulley.name = 'head_pulley';
  g.add(headPulley);

  // Tail pulley
  const tailPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2.0, 16), stdMat(0x555555, 0.7));
  tailPulley.position.set(-2.8, 0, 0.3);
  tailPulley.rotation.x = Math.PI / 2;
  tailPulley.name = 'tail_pulley';
  g.add(tailPulley);

  // Drive motor
  const motor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.6), stdMat(0x3a3a3a, 0.6, 0.4));
  motor.position.set(3.2, -0.6, 0.3);
  g.add(motor);
  // Motor shaft
  const mShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8), accentMat());
  mShaft.position.set(3.2, -0.15, 0.3);
  mShaft.rotation.x = Math.PI / 2;
  g.add(mShaft);

  // Support legs
  const legPositions = [[-2, 1], [-2, -1], [0, 1], [0, -1], [2, 1], [2, -1]];
  legPositions.forEach(([x, y]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.0), stdMat(0x555555, 0.6));
    leg.position.set(x, y, -0.2);
    g.add(leg);
    // Cross brace
    if (y > 0) {
      const brace = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.8, 0.04), stdMat(0x444444, 0.6));
      brace.position.set(x, 0, -0.5);
      g.add(brace);
    }
  });

  // Skirt boards
  addMesh(g, new THREE.BoxGeometry(3.0, 0.06, 0.3), stdMat(0x4a4a4a, 0.6), -0.5, 0.95, 0.45);
  addMesh(g, new THREE.BoxGeometry(3.0, 0.06, 0.3), stdMat(0x4a4a4a, 0.6), -0.5, -0.95, 0.45);

  // Material chunks on belt
  for (let i = 0; i < 8; i++) {
    const chunk = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.06, 0),
      stdMat(0x8B7355, 0.2, 0.9)
    );
    chunk.position.set(-2 + Math.random() * 4, (Math.random() - 0.5) * 1.2, 0.4);
    g.add(chunk);
  }

  return g;
}

const BUILDERS: Record<EquipmentType, () => THREE.Group> = {
  crusher: buildCrusher,
  screener: buildScreener,
  conveyor: buildConveyor,
};

const TYPES: EquipmentType[] = ['crusher', 'screener', 'conveyor'];

const EquipmentModel3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ scene: THREE.Scene; camera: THREE.PerspectiveCamera | null; model: THREE.Group | null; autoRot: number }>({ scene: new THREE.Scene(), camera: null, model: null, autoRot: 0 });
  const [activeType, setActiveType] = useState<EquipmentType>('crusher');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; description: string } | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());

  // Swap model when type changes
  const swapModel = useCallback((type: EquipmentType) => {
    const { scene } = sceneRef.current;
    if (sceneRef.current.model) {
      scene.remove(sceneRef.current.model);
      sceneRef.current.model.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    }
    const newModel = BUILDERS[type]();
    scene.add(newModel);
    sceneRef.current.model = newModel;
    sceneRef.current.autoRot = 0;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = sceneRef.current.scene;
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(4, 3, 5);
    sceneRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const d1 = new THREE.DirectionalLight(0xffffff, 1); d1.position.set(5, 5, 5); scene.add(d1);
    const d2 = new THREE.DirectionalLight(0x6495ed, 0.3); d2.position.set(-3, 2, -2); scene.add(d2);
    const spot = new THREE.SpotLight(0xffffff, 0.5, 20, 0.5, 0.5); spot.position.set(0, 5, 0); scene.add(spot);

    // Grid
    const grid = new THREE.GridHelper(10, 10, 0x333333, 0x222222);
    grid.position.y = -1.2;
    scene.add(grid);

    // Initial model
    swapModel('crusher');

    // Mouse orbit
    let isDragging = false;
    let prevX = 0;
    const onDown = (e: PointerEvent) => { isDragging = true; prevX = e.clientX; };
    const onUp = () => { isDragging = false; };
    const onMove = (e: PointerEvent) => {
      if (isDragging) {
        sceneRef.current.autoRot += (e.clientX - prevX) * 0.005;
        prevX = e.clientX;
        setTooltip(null);
        return;
      }
      // Raycasting for tooltip
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(pointer.current, camera);
      const model = sceneRef.current.model;
      if (model) {
        const intersects = raycaster.current.intersectObjects(model.children, true);
        let found = false;
        for (const hit of intersects) {
          let obj: THREE.Object3D | null = hit.object;
          while (obj && obj !== model) {
            if (obj.name && PART_INFO[obj.name]) {
              const info = PART_INFO[obj.name];
              setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, name: info.name, description: info.description });
              renderer.domElement.style.cursor = 'pointer';
              found = true;
              break;
            }
            obj = obj.parent;
          }
          if (found) break;
        }
        if (!found) {
          setTooltip(null);
          renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
        }
      }
    };
    const onLeave = () => { setTooltip(null); };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerleave', onLeave);

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const model = sceneRef.current.model;
      if (model) {
        model.rotation.y = t * 0.15 + sceneRef.current.autoRot;
        model.position.y = Math.sin(t * 1.5) * 0.05;

        // Animate spinning parts
        model.traverse((child) => {
          if (child.name === 'flywheel' || child.name === 'head_pulley' || child.name === 'tail_pulley') {
            child.rotation.z += 0.03;
          }
          if (child.name === 'eccentric_shaft') {
            child.rotation.z += 0.05;
          }
          if (child.name.startsWith('idler_')) {
            child.rotation.z += 0.04;
          }
          // Screener vibration
          if (child.name.startsWith('deck_')) {
            child.position.x = Math.sin(t * 25) * 0.015;
            child.position.z += Math.sin(t * 30) * 0.001;
          }
        });
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerleave', onLeave);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [swapModel]);

  const cycleType = (dir: 1 | -1) => {
    const idx = TYPES.indexOf(activeType);
    const next = TYPES[(idx + dir + TYPES.length) % TYPES.length];
    setActiveType(next);
    swapModel(next);
  };

  const info = EQUIPMENT_INFO[activeType];

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
          Interactive 3D view — drag to rotate. Use arrows to browse crushers, screeners & conveyors.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="relative">
          <div ref={containerRef} className="h-72 sm:h-80 cursor-grab active:cursor-grabbing" />

          {/* Part tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none z-20 max-w-[200px] px-3 py-2 rounded-lg bg-background/95 border border-primary/30 shadow-lg backdrop-blur-sm"
              style={{ left: Math.min(tooltip.x, 180), top: Math.max(tooltip.y - 60, 8) }}
            >
              <p className="text-[11px] font-bold text-primary leading-tight">{tooltip.name}</p>
              <p className="text-[9px] text-muted-foreground leading-snug mt-0.5">{tooltip.description}</p>
            </div>
          )}

          {/* Nav arrows */}
          <button
            onClick={() => cycleType(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            aria-label="Previous model"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => cycleType(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            aria-label="Next model"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Info bar */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-center gap-3 mb-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => { setActiveType(t); swapModel(t); }}
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                  t === activeType
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
                }`}
              >
                {EQUIPMENT_INFO[t].label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wider">
            {info.description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default EquipmentModel3D;

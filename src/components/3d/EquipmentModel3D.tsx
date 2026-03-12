import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  EquipmentType, EQUIPMENT_INFO, TYPES, BUILDERS, PART_INFO,
  animateModel, disposeGroup, findPartInfo,
} from './equipmentBuilders';

const EquipmentModel3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ scene: THREE.Scene; camera: THREE.PerspectiveCamera | null; model: THREE.Group | null; autoRot: number }>({ scene: new THREE.Scene(), camera: null, model: null, autoRot: 0 });
  const [activeType, setActiveType] = useState<EquipmentType>('crusher');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; description: string } | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());

  const swapModel = useCallback((type: EquipmentType) => {
    const { scene } = sceneRef.current;
    if (sceneRef.current.model) {
      scene.remove(sceneRef.current.model);
      disposeGroup(sceneRef.current.model);
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

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const d1 = new THREE.DirectionalLight(0xffffff, 1); d1.position.set(5, 5, 5); scene.add(d1);
    const d2 = new THREE.DirectionalLight(0x6495ed, 0.3); d2.position.set(-3, 2, -2); scene.add(d2);
    const spot = new THREE.SpotLight(0xffffff, 0.5, 20, 0.5, 0.5); spot.position.set(0, 5, 0); scene.add(spot);

    const grid = new THREE.GridHelper(10, 10, 0x333333, 0x222222);
    grid.position.y = -1.2;
    scene.add(grid);

    swapModel('crusher');

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
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(pointer.current, camera);
      const model = sceneRef.current.model;
      if (model) {
        const intersects = raycaster.current.intersectObjects(model.children, true);
        let found = false;
        for (const hit of intersects) {
          const info = findPartInfo(hit.object, model);
          if (info) {
            setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, name: info.name, description: info.description });
            renderer.domElement.style.cursor = 'pointer';
            found = true;
            break;
          }
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
        animateModel(model, t);
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

          {tooltip && (
            <div
              className="absolute pointer-events-none z-20 max-w-[200px] px-3 py-2 rounded-lg bg-background/95 border border-primary/30 shadow-lg backdrop-blur-sm"
              style={{ left: Math.min(tooltip.x, 180), top: Math.max(tooltip.y - 60, 8) }}
            >
              <p className="text-[11px] font-bold text-primary leading-tight">{tooltip.name}</p>
              <p className="text-[9px] text-muted-foreground leading-snug mt-0.5">{tooltip.description}</p>
            </div>
          )}

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

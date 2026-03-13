import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, ZoomIn, ZoomOut, Maximize2, Move3D, Info, Eye, EyeOff, Box, Sun, Snowflake, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  EquipmentType, EQUIPMENT_INFO, TYPES, BUILDERS, PART_INFO,
  animateModel, disposeGroup, findPartInfo,
} from '@/components/3d/equipmentBuilders';

const ThreeDViewerPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const autoRotRef = useRef(0);

  const [activeType, setActiveType] = useState<EquipmentType>('crusher');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; description: string } | null>(null);
  const [exploded, setExploded] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [lightPreset, setLightPreset] = useState<'studio' | 'warm' | 'cool'>('studio');

  const lightsRef = useRef<{ ambient: THREE.AmbientLight; d1: THREE.DirectionalLight; d2: THREE.DirectionalLight; rim: THREE.DirectionalLight } | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const cameraDistance = useRef(7);

  const swapModel = useCallback((type: EquipmentType) => {
    const scene = sceneRef.current;
    if (modelRef.current) {
      scene.remove(modelRef.current);
      disposeGroup(modelRef.current);
    }
    const newModel = BUILDERS[type]();
    scene.add(newModel);
    modelRef.current = newModel;
    autoRotRef.current = 0;
    setSelectedPart(null);
    setExploded(false);
  }, []);

  // Exploded view
  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    model.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.name) {
        const dir = child.position.clone().normalize();
        if (exploded) {
          child.userData.originalPos = child.userData.originalPos || child.position.clone();
          child.position.copy(child.userData.originalPos.clone().add(dir.multiplyScalar(0.6)));
        } else if (child.userData.originalPos) {
          child.position.copy(child.userData.originalPos);
        }
      }
    });
  }, [exploded]);

  // Toggle grid
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.visible = showGrid;
    }
  }, [showGrid]);

  // Wireframe toggle
  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.wireframe = wireframe;
      }
    });
  }, [wireframe, activeType]);

  // Lighting presets
  useEffect(() => {
    const lights = lightsRef.current;
    if (!lights) return;
    const presets = {
      studio: { ambient: { color: 0xffffff, intensity: 0.6 }, d1: { color: 0xffffff, intensity: 1.2 }, d2: { color: 0x6495ed, intensity: 0.4 }, rim: { color: 0xf59e0b, intensity: 0.3 } },
      warm: { ambient: { color: 0xfff0e0, intensity: 0.5 }, d1: { color: 0xffb347, intensity: 1.4 }, d2: { color: 0xff8c00, intensity: 0.5 }, rim: { color: 0xff6600, intensity: 0.4 } },
      cool: { ambient: { color: 0xe0f0ff, intensity: 0.5 }, d1: { color: 0x87ceeb, intensity: 1.0 }, d2: { color: 0x4169e1, intensity: 0.6 }, rim: { color: 0x00bfff, intensity: 0.3 } },
    };
    const p = presets[lightPreset];
    lights.ambient.color.setHex(p.ambient.color); lights.ambient.intensity = p.ambient.intensity;
    lights.d1.color.setHex(p.d1.color); lights.d1.intensity = p.d1.intensity;
    lights.d2.color.setHex(p.d2.color); lights.d2.intensity = p.d2.intensity;
    lights.rim.color.setHex(p.rim.color); lights.rim.intensity = p.rim.intensity;
  }, [lightPreset]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = sceneRef.current;
    scene.background = new THREE.Color(0x0f0f1a);

    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(5, 4, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lighting — brighter for fullscreen
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const d1 = new THREE.DirectionalLight(0xffffff, 1.2);
    d1.position.set(8, 8, 5);
    d1.castShadow = true;
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0x6495ed, 0.4);
    d2.position.set(-5, 3, -3);
    scene.add(d2);
    const rim = new THREE.DirectionalLight(0xf59e0b, 0.3);
    rim.position.set(-2, 1, 5);
    scene.add(rim);
    lightsRef.current = { ambient, d1, d2, rim };
    const spot = new THREE.SpotLight(0xffffff, 0.6, 30, 0.5, 0.5);
    spot.position.set(0, 8, 0);
    scene.add(spot);

    // Grid
    const grid = new THREE.GridHelper(16, 16, 0x333344, 0x1a1a2e);
    grid.position.y = -1.5;
    scene.add(grid);
    gridRef.current = grid;

    swapModel('crusher');

    // Orbit controls (manual)
    let isDragging = false;
    let isRightDrag = false;
    let prevX = 0, prevY = 0;
    let theta = 0.8, phi = 0.6;
    let panX = 0, panY = 0;

    const updateCamera = () => {
      const dist = cameraDistance.current;
      camera.position.set(
        dist * Math.sin(theta) * Math.cos(phi) + panX,
        dist * Math.sin(phi) + panY,
        dist * Math.cos(theta) * Math.cos(phi)
      );
      camera.lookAt(panX, panY, 0);
    };
    updateCamera();

    const onDown = (e: PointerEvent) => {
      isDragging = true;
      isRightDrag = e.button === 2;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onUp = () => { isDragging = false; isRightDrag = false; };
    const onMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        if (isRightDrag) {
          panX -= dx * 0.005;
          panY += dy * 0.005;
        } else {
          theta += dx * 0.005;
          phi = Math.max(0.1, Math.min(1.4, phi - dy * 0.005));
        }
        prevX = e.clientX;
        prevY = e.clientY;
        updateCamera();
        setTooltip(null);
        return;
      }
      // Raycasting
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(pointer.current, camera);
      const model = modelRef.current;
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
          renderer.domElement.style.cursor = 'grab';
        }
      }
    };
    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(pointer.current, camera);
      const model = modelRef.current;
      if (model) {
        const intersects = raycaster.current.intersectObjects(model.children, true);
        for (const hit of intersects) {
          const info = findPartInfo(hit.object, model);
          if (info) {
            setSelectedPart(prev => prev === info.name ? null : info.name);
            return;
          }
        }
      }
      setSelectedPart(null);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistance.current = Math.max(3, Math.min(15, cameraDistance.current + e.deltaY * 0.005));
      updateCamera();
    };
    const onLeave = () => setTooltip(null);
    const onContext = (e: MouseEvent) => e.preventDefault();

    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerleave', onLeave);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('contextmenu', onContext);

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const model = modelRef.current;
      if (model) {
        if (autoRotate) {
          autoRotRef.current += 0.003;
        }
        model.rotation.y = autoRotRef.current;
        model.position.y = Math.sin(t * 1.5) * 0.03;
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
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('contextmenu', onContext);
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
  }, [swapModel, autoRotate]);

  const zoom = (dir: 1 | -1) => {
    cameraDistance.current = Math.max(3, Math.min(15, cameraDistance.current + dir * 1));
    const camera = cameraRef.current;
    if (camera) {
      const dist = cameraDistance.current;
      // Keep current angle
      const pos = camera.position.clone().normalize().multiplyScalar(dist);
      camera.position.copy(pos);
      camera.lookAt(0, 0, 0);
    }
  };

  const resetView = () => {
    cameraDistance.current = 7;
    autoRotRef.current = 0;
    setExploded(false);
    setSelectedPart(null);
  };

  const info = EQUIPMENT_INFO[activeType];
  const partsList = Object.entries(PART_INFO).filter(([key]) => {
    if (activeType === 'crusher') return key === 'flywheel';
    if (activeType === 'screener') return key.startsWith('deck_') || key === 'eccentric_shaft';
    return key.startsWith('idler_') || key === 'head_pulley' || key === 'tail_pulley';
  });

  return (
    <>
      <Helmet>
        <title>3D Equipment Viewer | Hinjd Global</title>
        <meta name="description" content="Interactive full-screen 3D viewer for industrial crushers, screeners, and conveyors with exploded views and part inspection." />
      </Helmet>

      <div className="fixed inset-0 bg-background flex flex-col">
        {/* Top toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-sm font-bold text-foreground">{info.label}</h1>
              <p className="text-[10px] text-muted-foreground">{info.description}</p>
            </div>
          </div>

          {/* Model selector */}
          <div className="flex gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => { setActiveType(t); swapModel(t); }}
                className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                  t === activeType
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
                }`}
              >
                {EQUIPMENT_INFO[t].label}
              </button>
            ))}
          </div>
        </div>

        {/* Main canvas */}
        <div className="flex-1 relative">
          <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none z-30 max-w-[220px] px-3 py-2 rounded-lg bg-background/95 border border-primary/30 shadow-xl backdrop-blur-md"
              style={{ left: Math.min(tooltip.x + 12, window.innerWidth - 240), top: Math.max(tooltip.y - 50, 8) }}
            >
              <p className="text-xs font-bold text-primary leading-tight">{tooltip.name}</p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{tooltip.description}</p>
            </div>
          )}

          {/* Right-side controls */}
          <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-20">
            <button
              onClick={() => zoom(-1)}
              className="w-9 h-9 rounded-lg bg-card/80 border border-border backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => zoom(1)}
              className="w-9 h-9 rounded-lg bg-card/80 border border-border backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={resetView}
              className="w-9 h-9 rounded-lg bg-card/80 border border-border backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              title="Reset View"
            >
              <RotateCcw size={16} />
            </button>
            <div className="h-px bg-border my-0.5" />
            <button
              onClick={() => setExploded(!exploded)}
              className={`w-9 h-9 rounded-lg border backdrop-blur-sm flex items-center justify-center transition-colors ${
                exploded ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-card/80 border-border text-muted-foreground hover:text-foreground hover:bg-card'
              }`}
              title="Exploded View"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`w-9 h-9 rounded-lg border backdrop-blur-sm flex items-center justify-center transition-colors ${
                autoRotate ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-card/80 border-border text-muted-foreground hover:text-foreground hover:bg-card'
              }`}
              title="Auto Rotate"
            >
              <Move3D size={16} />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`w-9 h-9 rounded-lg border backdrop-blur-sm flex items-center justify-center transition-colors ${
                showGrid ? 'bg-card/80 border-border text-muted-foreground hover:text-foreground hover:bg-card' : 'bg-primary/15 border-primary/40 text-primary'
              }`}
              title="Toggle Grid"
            >
              {showGrid ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`w-9 h-9 rounded-lg border backdrop-blur-sm flex items-center justify-center transition-colors ${
                wireframe ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-card/80 border-border text-muted-foreground hover:text-foreground hover:bg-card'
              }`}
              title="Wireframe"
            >
              <Box size={16} />
            </button>
            <div className="h-px bg-border my-0.5" />
            <button
              onClick={() => setLightPreset('studio')}
              className={`w-9 h-9 rounded-lg border backdrop-blur-sm flex items-center justify-center transition-colors ${
                lightPreset === 'studio' ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-card/80 border-border text-muted-foreground hover:text-foreground hover:bg-card'
              }`}
              title="Studio Lighting"
            >
              <Lightbulb size={16} />
            </button>
            <button
              onClick={() => setLightPreset('warm')}
              className={`w-9 h-9 rounded-lg border backdrop-blur-sm flex items-center justify-center transition-colors ${
                lightPreset === 'warm' ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-card/80 border-border text-muted-foreground hover:text-foreground hover:bg-card'
              }`}
              title="Warm Lighting"
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => setLightPreset('cool')}
              className={`w-9 h-9 rounded-lg border backdrop-blur-sm flex items-center justify-center transition-colors ${
                lightPreset === 'cool' ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-card/80 border-border text-muted-foreground hover:text-foreground hover:bg-card'
              }`}
              title="Cool Lighting"
            >
              <Snowflake size={16} />
            </button>
          </div>

          {/* Parts panel (bottom-left) */}
          <div className="absolute left-3 bottom-3 z-20 w-52 max-h-[40vh] overflow-y-auto rounded-xl bg-card/90 border border-border backdrop-blur-md">
            <div className="p-3 border-b border-border flex items-center gap-2">
              <Info size={14} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Parts</span>
            </div>
            <div className="p-2 space-y-1">
              {partsList.map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPart(prev => prev === info.name ? null : info.name)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg transition-all text-[10px] ${
                    selectedPart === info.name
                      ? 'bg-primary/15 border border-primary/30 text-primary'
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <p className="font-bold leading-tight">{info.name}</p>
                  <p className="text-[9px] opacity-70 leading-snug mt-0.5">{info.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Controls hint */}
          <div className="absolute bottom-3 right-3 z-20 text-[9px] text-muted-foreground/50 text-right space-y-0.5">
            <p>Left-drag: Orbit</p>
            <p>Right-drag: Pan</p>
            <p>Scroll: Zoom</p>
            <p>Click part: Select</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThreeDViewerPage;

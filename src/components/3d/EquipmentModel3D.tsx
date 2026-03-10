import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const EquipmentModel3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(4, 3, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const d1 = new THREE.DirectionalLight(0xffffff, 1); d1.position.set(5, 5, 5); scene.add(d1);
    const d2 = new THREE.DirectionalLight(0x6495ed, 0.3); d2.position.set(-3, 2, -2); scene.add(d2);
    const spot = new THREE.SpotLight(0xffffff, 0.5, 20, 0.5, 0.5); spot.position.set(0, 5, 0); scene.add(spot);

    // Jaw Crusher group
    const crusher = new THREE.Group();
    crusher.scale.setScalar(0.8);

    const stdMat = (color: number, metalness = 0.8, roughness = 0.3) =>
      new THREE.MeshStandardMaterial({ color, metalness, roughness });

    // Main body
    crusher.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 1.5), stdMat(0x4a4a4a)), { position: new THREE.Vector3(0, 0, 0) }));
    // Feed opening
    crusher.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 1.3), stdMat(0x333333, 0.6, 0.4)), { position: new THREE.Vector3(0, 1, 0) }));
    // Hopper walls
    crusher.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 1.4), stdMat(0x555555, 0.7)), { position: new THREE.Vector3(-0.95, 1.5, 0) }));
    crusher.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 1.4), stdMat(0x555555, 0.7)), { position: new THREE.Vector3(0.95, 1.5, 0) }));
    // Flywheel
    const flywheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 20), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1, emissive: 0xf59e0b, emissiveIntensity: 0.15 }));
    flywheel.position.set(1.2, 0.3, 0);
    flywheel.rotation.x = Math.PI / 2;
    crusher.add(flywheel);
    // Base
    crusher.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 1.8), stdMat(0x3a3a3a, 0.5, 0.5)), { position: new THREE.Vector3(0, -1, 0) }));
    // Discharge
    crusher.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.3), stdMat(0x444444, 0.6, 0.4)), { position: new THREE.Vector3(0, -0.6, 0.9) }));

    scene.add(crusher);

    // Grid
    const grid = new THREE.GridHelper(10, 10, 0x333333, 0x222222);
    grid.position.y = -1.2;
    scene.add(grid);

    // Mouse orbit
    let isDragging = false;
    let prevX = 0;
    let autoRot = 0;

    const onDown = (e: PointerEvent) => { isDragging = true; prevX = e.clientX; };
    const onUp = () => { isDragging = false; };
    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;
      autoRot += (e.clientX - prevX) * 0.005;
      prevX = e.clientX;
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointermove', onMove);

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      crusher.rotation.y = t * 0.15 + autoRot;
      // Float effect
      crusher.position.y = Math.sin(t * 1.5) * 0.05;
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
  }, []);

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
        <div ref={containerRef} className="h-72 sm:h-80 cursor-grab active:cursor-grabbing" />
        <div className="p-4 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Drag to rotate • Jaw Crusher Model
          </p>
        </div>
      </div>
    </section>
  );
};

export default EquipmentModel3D;

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const locations = [
  { lat: 33.7, lng: -84.4, label: 'Atlanta, GA' },
  { lat: 36.1, lng: -115.2, label: 'Las Vegas, NV' },
  { lat: 29.7, lng: -95.4, label: 'Houston, TX' },
  { lat: 39.1, lng: -94.6, label: 'Kansas City, MO' },
  { lat: 47.6, lng: -122.3, label: 'Seattle, WA' },
  { lat: 40.7, lng: -74.0, label: 'New York, NY' },
];

const latLngToPos = (lat: number, lng: number, r: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
};

const Globe3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x1a1a2e);
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8); dl.position.set(3, 3, 3); scene.add(dl);
    const pl = new THREE.PointLight(0x6495ed, 0.3); pl.position.set(-3, 2, -2); scene.add(pl);

    // Globe group
    const globe = new THREE.Group();

    // Sphere
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, transparent: true, opacity: 0.6, metalness: 0.3, roughness: 0.7 });
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(1.48, 32, 32), sphereMat));

    // Grid lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.15 });
    // Latitude
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lng = 0; lng <= 360; lng += 5) pts.push(latLngToPos(lat, lng, 1.5));
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }
    // Longitude
    for (let lng = 0; lng < 360; lng += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 5) pts.push(latLngToPos(lat, lng, 1.5));
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }

    // Location markers
    const markerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1 });
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    locations.forEach((loc) => {
      const pos = latLngToPos(loc.lat, loc.lng, 1.52);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), markerMat);
      dot.position.copy(pos);
      globe.add(dot);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.06, 16), ringMat);
      ring.position.copy(pos);
      ring.lookAt(0, 0, 0);
      globe.add(ring);
    });

    // Atmosphere
    const atmoMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.05, side: THREE.BackSide });
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(1.58, 32, 32), atmoMat));

    scene.add(globe);

    // Orbit interaction
    let isDragging = false;
    let prevX = 0;
    let userRot = 0;
    const onDown = (e: PointerEvent) => { isDragging = true; prevX = e.clientX; };
    const onUp = () => { isDragging = false; };
    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;
      userRot += (e.clientX - prevX) * 0.005;
      prevX = e.clientX;
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointermove', onMove);

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      globe.rotation.y = clock.getElapsedTime() * 0.08 + userRot;
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
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
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
        <div ref={containerRef} className="h-72 sm:h-80 cursor-grab active:cursor-grabbing" />
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

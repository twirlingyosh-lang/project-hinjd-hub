import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const HeroParticles = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Particles
    const count = 600;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      speeds[i] = 0.002 + Math.random() * 0.008;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Floating octahedrons
    const octas: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const r = 4 + i * 0.5;
      const geo = new THREE.OctahedronGeometry(0.15 + i * 0.05, 0);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(Math.cos(angle) * r, Math.sin(angle * 0.7) * 2, Math.sin(angle) * r);
      scene.add(mesh);
      octas.push(mesh);
    }

    const octaGroup = new THREE.Group();
    octas.forEach((o) => { scene.remove(o); octaGroup.add(o); });
    scene.add(octaGroup);

    // Light
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // Animate
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Update particles
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        posArr[i * 3 + 1] -= speeds[i];
        if (posArr[i * 3 + 1] < -10) posArr[i * 3 + 1] = 10;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = t * 0.02;

      // Update octahedrons
      octaGroup.rotation.y = t * 0.05;
      octaGroup.rotation.x = Math.sin(t * 0.03) * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      octas.forEach((o) => {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default HeroParticles;

import * as THREE from 'three';

export type EquipmentType = 'crusher' | 'screener' | 'conveyor';

export const PART_INFO: Record<string, { name: string; description: string }> = {
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

export const EQUIPMENT_INFO: Record<EquipmentType, { label: string; description: string }> = {
  crusher: { label: 'Jaw Crusher', description: 'Primary reduction unit with oscillating jaw plate & flywheel drive' },
  screener: { label: 'Vibrating Screener', description: 'Multi-deck screening unit with eccentric shaft vibration system' },
  conveyor: { label: 'Belt Conveyor', description: 'Troughed belt conveyor with drive drum, idlers & tail pulley' },
};

export const TYPES: EquipmentType[] = ['crusher', 'screener', 'conveyor'];

export const stdMat = (color: number, metalness = 0.8, roughness = 0.3) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness });

export const accentMat = () =>
  new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1, emissive: 0xf59e0b, emissiveIntensity: 0.15 });

export function addMesh(group: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, name?: string): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (name) m.name = name;
  group.add(m);
  return m;
}

export function buildCrusher(): THREE.Group {
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

export function buildScreener(): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(0.7);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.15, 2.0), stdMat(0x4a4a4a));
  frame.position.set(0, 0.6, 0);
  g.add(frame);
  for (let i = 0; i < 3; i++) {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.04, 1.8), stdMat(0x666666, 0.5, 0.6));
    deck.position.set(0, 0.3 - i * 0.4, 0);
    deck.name = `deck_${i}`;
    g.add(deck);
    for (let j = -4; j <= 4; j++) {
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.8, 4), stdMat(0x888888, 0.9, 0.1));
      wire.position.set(j * 0.35, 0.32 - i * 0.4, 0);
      wire.rotation.x = Math.PI / 2;
      g.add(wire);
    }
  }
  addMesh(g, new THREE.BoxGeometry(3.5, 1.4, 0.08), stdMat(0x555555, 0.7), 0, 0, 1.0);
  addMesh(g, new THREE.BoxGeometry(3.5, 1.4, 0.08), stdMat(0x555555, 0.7), 0, 0, -1.0);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 12), accentMat());
  shaft.position.set(0, 0.6, 0);
  shaft.rotation.x = Math.PI / 2;
  shaft.name = 'eccentric_shaft';
  g.add(shaft);
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 12), stdMat(0x3a3a3a, 0.6, 0.4));
  motor.position.set(0, 0.6, 1.3);
  motor.rotation.x = Math.PI / 2;
  g.add(motor);
  const springPositions = [[-1.5, -0.6, 0.8], [1.5, -0.6, 0.8], [-1.5, -0.6, -0.8], [1.5, -0.6, -0.8]];
  springPositions.forEach(([x, y, z]) => {
    for (let s = 0; s < 4; s++) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 12), accentMat());
      coil.position.set(x, y + s * 0.08, z);
      g.add(coil);
    }
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.3), stdMat(0x3a3a3a, 0.5));
    plate.position.set(x, y - 0.05, z);
    g.add(plate);
  });
  const chute = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.6), stdMat(0x444444, 0.6, 0.4));
  chute.position.set(-2.0, 1.0, 0);
  g.add(chute);
  for (let i = 0; i < 3; i++) {
    const lip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.6 - i * 0.1), stdMat(0x4a4a4a, 0.7));
    lip.position.set(2.0, 0.15 - i * 0.4, 0);
    g.add(lip);
  }
  return g;
}

export function buildConveyor(): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(0.65);
  addMesh(g, new THREE.BoxGeometry(5.5, 0.08, 0.5), stdMat(0x4a4a4a), 0, 1.0, 0);
  addMesh(g, new THREE.BoxGeometry(5.5, 0.08, 0.5), stdMat(0x4a4a4a), 0, -1.0, 0);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.8, 0.06), stdMat(0x2a2a2a, 0.1, 0.85));
  belt.position.set(0, 0, 0.3);
  g.add(belt);
  for (let i = -2; i <= 2; i++) {
    const x = i * 1.0;
    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 10), stdMat(0x666666, 0.7, 0.3));
    center.position.set(x, 0, 0.25);
    center.rotation.x = Math.PI / 2;
    center.name = `idler_${i}`;
    g.add(center);
    const wingL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), stdMat(0x666666, 0.7));
    wingL.position.set(x, 0.8, 0.35);
    wingL.rotation.set(Math.PI / 2, 0, 0.5);
    g.add(wingL);
    const wingR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), stdMat(0x666666, 0.7));
    wingR.position.set(x, -0.8, 0.35);
    wingR.rotation.set(Math.PI / 2, 0, -0.5);
    g.add(wingR);
  }
  const headPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.0, 16), accentMat());
  headPulley.position.set(2.8, 0, 0.3);
  headPulley.rotation.x = Math.PI / 2;
  headPulley.name = 'head_pulley';
  g.add(headPulley);
  const tailPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2.0, 16), stdMat(0x555555, 0.7));
  tailPulley.position.set(-2.8, 0, 0.3);
  tailPulley.rotation.x = Math.PI / 2;
  tailPulley.name = 'tail_pulley';
  g.add(tailPulley);
  const motorBox = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.6), stdMat(0x3a3a3a, 0.6, 0.4));
  motorBox.position.set(3.2, -0.6, 0.3);
  g.add(motorBox);
  const mShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8), accentMat());
  mShaft.position.set(3.2, -0.15, 0.3);
  mShaft.rotation.x = Math.PI / 2;
  g.add(mShaft);
  const legPositions = [[-2, 1], [-2, -1], [0, 1], [0, -1], [2, 1], [2, -1]];
  legPositions.forEach(([x, y]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.0), stdMat(0x555555, 0.6));
    leg.position.set(x, y, -0.2);
    g.add(leg);
    if (y > 0) {
      const brace = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.8, 0.04), stdMat(0x444444, 0.6));
      brace.position.set(x, 0, -0.5);
      g.add(brace);
    }
  });
  addMesh(g, new THREE.BoxGeometry(3.0, 0.06, 0.3), stdMat(0x4a4a4a, 0.6), -0.5, 0.95, 0.45);
  addMesh(g, new THREE.BoxGeometry(3.0, 0.06, 0.3), stdMat(0x4a4a4a, 0.6), -0.5, -0.95, 0.45);
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

export const BUILDERS: Record<EquipmentType, () => THREE.Group> = {
  crusher: buildCrusher,
  screener: buildScreener,
  conveyor: buildConveyor,
};

export function animateModel(model: THREE.Group, t: number) {
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
    if (child.name.startsWith('deck_')) {
      child.position.x = Math.sin(t * 25) * 0.015;
      child.position.z += Math.sin(t * 30) * 0.001;
    }
  });
}

export function disposeGroup(group: THREE.Group) {
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
  });
}

export function findPartInfo(obj: THREE.Object3D, model: THREE.Group): { name: string; description: string } | null {
  let current: THREE.Object3D | null = obj;
  while (current && current !== model) {
    if (current.name && PART_INFO[current.name]) {
      return PART_INFO[current.name];
    }
    current = current.parent;
  }
  return null;
}

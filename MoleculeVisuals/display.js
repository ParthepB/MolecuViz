
import { oxygenMolecule } from './Diatomic/oxygen.js';

let scene, camera, renderer;
let currentMolecule = null;

const atomColors = {
  'H': 0xffffff,
  'C': 0x404040,
  'O': 0xff0000,
  'N': 0x0000ff
};
const atomRadii = { 'H': 1.2, 'C': 1.7, 'O': 1.52, 'N': 1.55 };

init();

function init() {
  const canvas = document.getElementById('viewer');

  // Scene & camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Lights
  const ambient = new THREE.AmbientLight(0x404040, 1.5);
  scene.add(ambient);
  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.position.set(5, 5, 5);
  scene.add(directional);

  // Load molecule
  loadMolecule(oxygenMolecule);

  animate();
}

function loadMolecule(molecule) {
  if (currentMolecule) scene.remove(currentMolecule);
  currentMolecule = new THREE.Group();

  // Atoms
  molecule.atoms.forEach(atom => {
    const mesh = createAtom(atom.element, atom.position);
    currentMolecule.add(mesh);
  });

  // Bonds
  molecule.bonds.forEach(([i, j]) => {
    const pos1 = molecule.atoms[i].position;
    const pos2 = molecule.atoms[j].position;
    currentMolecule.add(createBond(pos1, pos2));
  });

  scene.add(currentMolecule);

  // Update info panel
  document.getElementById('infoTitle').textContent = molecule.name;
  document.getElementById('infoContent').innerHTML = `
    Formula: ${molecule.formula}<br>
    Description: ${molecule.info.description}<br>
    Molecular Weight: ${molecule.info.molecularWeight}<br>
    ${molecule.info.bondLength ? `Bond Length: ${molecule.info.bondLength}` : ''}
  `;
}

function createAtom(element, position) {
  const geometry = new THREE.SphereGeometry(atomRadii[element] * 0.3, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: atomColors[element] || 0x888888 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  return mesh;
}

function createBond(pos1, pos2) {
  const distance = new THREE.Vector3(...pos1).distanceTo(new THREE.Vector3(...pos2));
  const geometry = new THREE.CylinderGeometry(0.1, 0.1, distance, 16);
  const material = new THREE.MeshPhongMaterial({ color: 0x888888 });
  const mesh = new THREE.Mesh(geometry, material);

  // Position & orientation
  const midpoint = [(pos1[0] + pos2[0]) / 2, (pos1[1] + pos2[1]) / 2, (pos1[2] + pos2[2]) / 2];
  mesh.position.set(...midpoint);

  const dir = new THREE.Vector3(pos2[0] - pos1[0], pos2[1] - pos1[1], pos2[2] - pos1[2]);
  const axis = new THREE.Vector3(0, 1, 0);
  mesh.quaternion.setFromUnitVectors(axis, dir.normalize());

  return mesh;
}

function animate() {
  requestAnimationFrame(animate);
  if (currentMolecule) currentMolecule.rotation.y += 0.01;
  renderer.render(scene, camera);
}

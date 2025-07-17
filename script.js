// Global variables
let scene, camera, renderer, controls;
let currentMolecule = null;
let molecules = [];
let displayMode = 'ball-stick';
let autoRotate = false;
let mouseX = 0, mouseY = 0;
let isMouseDown = false;
let cameraDistance = 50;

// Atom colors (CPK coloring)
const atomColors = {
    'H': 0xffffff, // White
    'C': 0x404040, // Dark gray
    'N': 0x0000ff, // Blue
    'O': 0xff0000, // Red
    'S': 0xffff00, // Yellow
    'P': 0xffa500, // Orange
    'F': 0x00ff00, // Green
    'Cl': 0x00ff00, // Green
    'Br': 0x8b4513, // Brown
    'I': 0x9400d3   // Purple
};

// Van der Waals radii
const atomRadii = {
    'H': 1.2, 'C': 1.7, 'N': 1.55, 'O': 1.52, 'S': 1.8, 'P': 1.8,
    'F': 1.47, 'Cl': 1.75, 'Br': 1.85, 'I': 1.98
};

// Molecule database
const moleculeDatabase = [
    {
        name: "Water",
        formula: "H₂O",
        atoms: [
            { element: 'O', position: [0, 0, 0] },
            { element: 'H', position: [0.96, 0, 0] },
            { element: 'H', position: [-0.24, 0.93, 0] }
        ],
        bonds: [[0, 1], [0, 2]],
        info: {
            description: "Water is essential for all known forms of life. It's a polar molecule with unique properties.",
            molecularWeight: "18.015 g/mol",
            bondAngle: "104.5°",
            polarity: "Polar",
            uses: "Universal solvent, biological processes, industrial applications"
        }
    },
    {
        name: "Methane",
        formula: "CH₄",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'H', position: [1.09, 0, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [0, 2], [0, 3], [0, 4]],
        info: {
            description: "Methane is the simplest hydrocarbon and main component of natural gas.",
            molecularWeight: "16.043 g/mol",
            bondAngle: "109.5°",
            polarity: "Nonpolar",
            uses: "Fuel, heating, chemical feedstock"
        }
    },
    {
        name: "Ammonia",
        formula: "NH₃",
        atoms: [
            { element: 'N', position: [0, 0, 0] },
            { element: 'H', position: [0.94, 0, 0] },
            { element: 'H', position: [-0.47, 0.81, 0] },
            { element: 'H', position: [-0.47, -0.81, 0] }
        ],
        bonds: [[0, 1], [0, 2], [0, 3]],
        info: {
            description: "Ammonia has a trigonal pyramidal geometry and is a common base.",
            molecularWeight: "17.031 g/mol",
            bondAngle: "107°",
            polarity: "Polar",
            uses: "Fertilizer production, cleaning products, refrigeration"
        }
    },
    {
        name: "Carbon Dioxide",
        formula: "CO₂",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'O', position: [1.16, 0, 0] },
            { element: 'O', position: [-1.16, 0, 0] }
        ],
        bonds: [[0, 1], [0, 2]],
        info: {
            description: "Carbon dioxide is a linear molecule, important in photosynthesis and respiration.",
            molecularWeight: "44.01 g/mol",
            bondAngle: "180°",
            polarity: "Nonpolar",
            uses: "Photosynthesis, carbonation, fire extinguishers"
        }
    },
    {
        name: "Ethanol",
        formula: "C₂H₅OH",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'O', position: [2.32, 1.06, 0] },
            { element: 'H', position: [3.26, 1.06, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] },
            { element: 'H', position: [1.9, -0.51, 0.89] },
            { element: 'H', position: [1.9, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [0, 4], [0, 5], [0, 6], [1, 7], [1, 8]],
        info: {
            description: "Ethanol is a simple alcohol with important industrial and biological significance.",
            molecularWeight: "46.068 g/mol",
            bondAngle: "Various",
            polarity: "Polar",
            uses: "Alcoholic beverages, fuel, solvent, disinfectant"
        }
    },
    {
        name: "Benzene",
        formula: "C₆H₆",
        atoms: [
            { element: 'C', position: [1.4, 0, 0] },
            { element: 'C', position: [0.7, 1.21, 0] },
            { element: 'C', position: [-0.7, 1.21, 0] },
            { element: 'C', position: [-1.4, 0, 0] },
            { element: 'C', position: [-0.7, -1.21, 0] },
            { element: 'C', position: [0.7, -1.21, 0] },
            { element: 'H', position: [2.48, 0, 0] },
            { element: 'H', position: [1.24, 2.15, 0] },
            { element: 'H', position: [-1.24, 2.15, 0] },
            { element: 'H', position: [-2.48, 0, 0] },
            { element: 'H', position: [-1.24, -2.15, 0] },
            { element: 'H', position: [1.24, -2.15, 0] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]],
        info: {
            description: "Benzene is the simplest aromatic compound with a ring of six carbon atoms.",
            molecularWeight: "78.114 g/mol",
            bondAngle: "120°",
            polarity: "Nonpolar",
            uses: "Chemical industry, plastics, synthetic fibers"
        }
    }
];

// Initialize the application
function init() {
    setupViewer();
    populateMoleculeList();
    loadMolecule(0);
    animate();
}

// Setup Three.js viewer
function setupViewer() {
    const container = document.getElementById('viewer');
    const loading = document.getElementById('loading');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Mouse controls
    setupMouseControls();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    loading.style.display = 'none';
}

// Setup mouse controls for camera
function setupMouseControls() {
    const canvas = document.getElementById('viewer');
    
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            
            // Rotate camera around origin
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(camera.position);
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            camera.position.setFromSpherical(spherical);
            camera.lookAt(0, 0, 0);
            
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
    
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(10, Math.min(100, cameraDistance));
        
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.normalize().multiplyScalar(-cameraDistance);
        camera.position.copy(direction);
    });
}

// Populate molecule list
function populateMoleculeList() {
    const list = document.getElementById('moleculeList');
    list.innerHTML = '';
    
    moleculeDatabase.forEach((molecule, index) => {
        const item = document.createElement('li');
        item.className = 'molecule-item';
        item.innerHTML = `
            <div class="molecule-name">${molecule.name}</div>
            <div class="molecule-formula">${molecule.formula}</div>
        `;
        item.addEventListener('click', () => loadMolecule(index));
        list.appendChild(item);
    });
}

// Load and display a molecule
function loadMolecule(index) {
    // Clear previous molecule
    if (currentMolecule) {
        scene.remove(currentMolecule);
    }
    
    // Update active state
    document.querySelectorAll('.molecule-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    const molecule = moleculeDatabase[index];
    currentMolecule = new THREE.Group();
    
    // Create atoms
    molecule.atoms.forEach((atom, atomIndex) => {
        const atomMesh = createAtom(atom.element, atom.position);
        atomMesh.userData = { element: atom.element, index: atomIndex };
        currentMolecule.add(atomMesh);
    });
    
    // Create bonds
    molecule.bonds.forEach(bond => {
        const atom1 = molecule.atoms[bond[0]];
        const atom2 = molecule.atoms[bond[1]];
        const bondMesh = createBond(atom1.position, atom2.position);
        currentMolecule.add(bondMesh);
    });
    
    scene.add(currentMolecule);
    updateInfoPanel(molecule);
}

// Create atom mesh
function createAtom(element, position) {
    const radius = displayMode === 'space-fill' ? atomRadii[element] : atomRadii[element] * 0.3;
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: atomColors[element] });
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
}

// Create bond mesh
function createBond(pos1, pos2) {
    if (displayMode === 'space-fill') {
        return new THREE.Group(); // No bonds in space-fill mode
    }
    
    const distance = Math.sqrt(
        Math.pow(pos2[0] - pos1[0], 2) +
        Math.pow(pos2[1] - pos1[1], 2) +
        Math.pow(pos2[2] - pos1[2], 2)
    );
    
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, distance, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position bond between atoms
    const midpoint = [
        (pos1[0] + pos2[0]) / 2,
        (pos1[1] + pos2[1]) / 2,
        (pos1[2] + pos2[2]) / 2
    ];
    mesh.position.set(midpoint[0], midpoint[1], midpoint[2]);
    
    // Orient bond correctly
    const direction = new THREE.Vector3(pos2[0] - pos1[0], pos2[1] - pos1[1], pos2[2] - pos1[2]);
    const axis = new THREE.Vector3(0, 1, 0);
    mesh.quaternion.setFromUnitVectors(axis, direction.normalize());
    
    return mesh;
}

// Update info panel
function updateInfoPanel(molecule) {
    const title = document.getElementById('infoTitle');
    const content = document.getElementById('infoContent');
    
    title.textContent = molecule.name;
    content.innerHTML = `
        <div class="info-section">
            <div class="info-label">Formula:</div>
            <div class="info-value">${molecule.formula}</div>
        </div>
        <div class="info-section">
            <div class="info-label">Description:</div>
            <div class="info-value">${molecule.info.description}</div>
        </div>
        <div class="info-section">
            <div class="info-label">Molecular Weight:</div>
            <div class="info-value">${molecule.info.molecularWeight}</div>
        </div>
        <div class="info-section">
            <div class="info-label">Bond Angle:</div>
            <div class="info-value">${molecule.info.bondAngle}</div>
        </div>
        <div class="info-section">
            <div class="info-label">Polarity:</div>
            <div class="info-value">${molecule.info.polarity}</div>
        </div>
        <div class="info-section">
            <div class="info-label">Uses:</div>
            <div class="info-value">${molecule.info.uses}</div>
        </div>
    `;
}

// Set display mode
function setDisplayMode(mode) {
    displayMode = mode;
    
    // Update button states
    document.querySelectorAll('.control-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Reload current molecule with new display mode
    const activeIndex = Array.from(document.querySelectorAll('.molecule-item')).findIndex(item => item.classList.contains('active'));
    if (activeIndex !== -1) {
        loadMolecule(activeIndex);
    }
}

// Toggle auto rotation
function toggleRotation() {
    autoRotate = !autoRotate;
    event.target.textContent = autoRotate ? 'Stop Rotation' : 'Auto Rotate';
}

// Reset camera
function resetCamera() {
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
    cameraDistance = 50;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (autoRotate && currentMolecule) {
        currentMolecule.rotation.y += 0.01;
    }
    
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('viewer');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Start the application
init();
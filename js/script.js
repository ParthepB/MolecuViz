// Global variables
let scene, camera, renderer, controls;
let currentMolecule = null;
let molecules = [];
let displayMode = 'ball-stick';
let autoRotate = false;
let mouseX = 0, mouseY = 0;
let isMouseDown = false;
let cameraDistance = 14;

// Atom colors (CPK coloring)
const atomColors = {
    'H': 0xffffff, // White
    'C': 0x404040, // Dark gray
    'N': 0x0000ff, // Blue
    'O': 0xff0000, // Red
    'S': 0xffff00, // Yellow
    'P': 0xffa500, // Orange
    'F': 0x00ff00, // Green
    'Cl': 0x00ffff, // Cyan
    'Br': 0x8b4513, // Brown
    'I': 0x800080   // Purple
};

// Van der Waals radii
const atomRadii = {
    'H': 1.2, 'C': 1.7, 'N': 1.55, 'O': 1.52, 'S': 1.8, 'P': 1.8,
    'F': 1.47, 'Cl': 1.75, 'Br': 1.85, 'I': 1.98
};

// Molecule database
const moleculeDatabase = [
    // Simple Molecules
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
        name: "Hydrogen Gas",
        formula: "H₂",
        atoms: [
            { element: 'H', position: [0, 0, 0] },
            { element: 'H', position: [0.74, 0, 0] }
        ],
        bonds: [[0, 1]],
        info: {
            description: "Hydrogen gas is the lightest and most abundant element in the universe.",
            molecularWeight: "2.016 g/mol",
            bondAngle: "Linear",
            polarity: "Nonpolar",
            uses: "Fuel cells, rocket fuel, chemical synthesis"
        }
    },
    {
        name: "Oxygen Gas",
        formula: "O₂",
        atoms: [
            { element: 'O', position: [0, 0, 0] },
            { element: 'O', position: [1.21, 0, 0] }
        ],
        bonds: [[0, 1]],
        info: {
            description: "Oxygen gas is essential for respiration and combustion reactions.",
            molecularWeight: "31.998 g/mol",
            bondAngle: "Linear",
            polarity: "Nonpolar",
            uses: "Respiration, combustion, medical applications"
        }
    },
    {
        name: "Nitrogen Gas",
        formula: "N₂",
        atoms: [
            { element: 'N', position: [0, 0, 0] },
            { element: 'N', position: [1.10, 0, 0] }
        ],
        bonds: [[0, 1]],
        info: {
            description: "Nitrogen gas makes up 78% of Earth's atmosphere and has a strong triple bond.",
            molecularWeight: "28.014 g/mol",
            bondAngle: "Linear",
            polarity: "Nonpolar",
            uses: "Inert atmosphere, fertilizer production, cryogenics"
        }
    },
    {
        name: "Hydrogen Chloride",
        formula: "HCl",
        atoms: [
            { element: 'H', position: [0, 0, 0] },
            { element: 'Cl', position: [1.27, 0, 0] }
        ],
        bonds: [[0, 1]],
        info: {
            description: "Hydrogen chloride is a strong acid when dissolved in water (hydrochloric acid).",
            molecularWeight: "36.458 g/mol",
            bondAngle: "Linear",
            polarity: "Polar",
            uses: "Acid production, metal cleaning, chemical synthesis"
        }
    },
    // Alcohols
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
        name: "Methanol",
        formula: "CH₃OH",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'O', position: [1.43, 0, 0] },
            { element: 'H', position: [2.37, 0, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [1, 2], [0, 3], [0, 4], [0, 5]],
        info: {
            description: "Methanol is the simplest alcohol, toxic to humans but useful industrially.",
            molecularWeight: "32.042 g/mol",
            bondAngle: "Various",
            polarity: "Polar",
            uses: "Fuel, solvent, antifreeze, chemical feedstock"
        }
    },
    // Aromatics
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
    },
    {
        name: "Toluene",
        formula: "C₇H₈",
        atoms: [
            { element: 'C', position: [1.4, 0, 0] },
            { element: 'C', position: [0.7, 1.21, 0] },
            { element: 'C', position: [-0.7, 1.21, 0] },
            { element: 'C', position: [-1.4, 0, 0] },
            { element: 'C', position: [-0.7, -1.21, 0] },
            { element: 'C', position: [0.7, -1.21, 0] },
            { element: 'C', position: [2.8, 0, 0] },
            { element: 'H', position: [1.24, 2.15, 0] },
            { element: 'H', position: [-1.24, 2.15, 0] },
            { element: 'H', position: [-2.48, 0, 0] },
            { element: 'H', position: [-1.24, -2.15, 0] },
            { element: 'H', position: [1.24, -2.15, 0] },
            { element: 'H', position: [3.16, 1.03, 0] },
            { element: 'H', position: [3.16, -0.51, 0.89] },
            { element: 'H', position: [3.16, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12], [6, 13], [6, 14]],
        info: {
            description: "Toluene is benzene with a methyl group attached, widely used as a solvent.",
            molecularWeight: "92.141 g/mol",
            bondAngle: "120° (aromatic)",
            polarity: "Slightly polar",
            uses: "Solvent, fuel additive, chemical synthesis"
        }
    },
    // Alkanes
    {
        name: "Ethane",
        formula: "C₂H₆",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] },
            { element: 'H', position: [1.9, 1.03, 0] },
            { element: 'H', position: [1.9, -0.51, 0.89] },
            { element: 'H', position: [1.9, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [1, 6], [1, 7]],
        info: {
            description: "Ethane is a simple alkane with two carbon atoms, found in natural gas.",
            molecularWeight: "30.070 g/mol",
            bondAngle: "109.5°",
            polarity: "Nonpolar",
            uses: "Fuel, chemical feedstock, ethylene production"
        }
    },
    {
        name: "Propane",
        formula: "C₃H₈",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'C', position: [3.08, 0, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] },
            { element: 'H', position: [1.54, 1.03, 0] },
            { element: 'H', position: [1.54, -1.03, 0] },
            { element: 'H', position: [3.44, 1.03, 0] },
            { element: 'H', position: [3.44, -0.51, 0.89] },
            { element: 'H', position: [3.44, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [1, 2], [0, 3], [0, 4], [0, 5], [1, 6], [1, 7], [2, 8], [2, 9], [2, 10]],
        info: {
            description: "Propane is a three-carbon alkane commonly used as fuel for grills and heating.",
            molecularWeight: "44.097 g/mol",
            bondAngle: "109.5°",
            polarity: "Nonpolar",
            uses: "Fuel, heating, refrigerant, chemical feedstock"
        }
    },
    // Alkenes
    {
        name: "Ethylene",
        formula: "C₂H₄",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.34, 0, 0] },
            { element: 'H', position: [-0.50, 0.87, 0] },
            { element: 'H', position: [-0.50, -0.87, 0] },
            { element: 'H', position: [1.84, 0.87, 0] },
            { element: 'H', position: [1.84, -0.87, 0] }
        ],
        bonds: [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5]],
        info: {
            description: "Ethylene is the simplest alkene with a carbon-carbon double bond.",
            molecularWeight: "28.054 g/mol",
            bondAngle: "120°",
            polarity: "Nonpolar",
            uses: "Polymer production, fruit ripening, chemical synthesis"
        }
    },
    // Acids
    {
        name: "Acetic Acid",
        formula: "CH₃COOH",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'O', position: [2.08, 1.21, 0] },
            { element: 'O', position: [2.08, -1.21, 0] },
            { element: 'H', position: [2.92, -1.65, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [1, 2], [1, 3], [3, 4], [0, 5], [0, 6], [0, 7]],
        info: {
            description: "Acetic acid is the main component of vinegar and a weak organic acid.",
            molecularWeight: "60.052 g/mol",
            bondAngle: "Various",
            polarity: "Polar",
            uses: "Food preservative, chemical synthesis, cleaning"
        }
    },
    {
        name: "Formic Acid",
        formula: "HCOOH",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'O', position: [1.21, 0, 0] },
            { element: 'O', position: [-0.75, 1.06, 0] },
            { element: 'H', position: [-0.89, -0.94, 0] },
            { element: 'H', position: [-1.69, 1.06, 0] }
        ],
        bonds: [[0, 1], [0, 2], [0, 3], [2, 4]],
        info: {
            description: "Formic acid is the simplest carboxylic acid, found in ant venom.",
            molecularWeight: "46.025 g/mol",
            bondAngle: "Various",
            polarity: "Polar",
            uses: "Leather tanning, textile dyeing, preservative"
        }
    },
    // Ketones & Aldehydes
    {
        name: "Acetone",
        formula: "C₃H₆O",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'C', position: [3.08, 0, 0] },
            { element: 'O', position: [1.54, 1.21, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] },
            { element: 'H', position: [3.44, 1.03, 0] },
            { element: 'H', position: [3.44, -0.51, 0.89] },
            { element: 'H', position: [3.44, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [1, 2], [1, 3], [0, 4], [0, 5], [0, 6], [2, 7], [2, 8], [2, 9]],
        info: {
            description: "Acetone is a common ketone used as a solvent and nail polish remover.",
            molecularWeight: "58.080 g/mol",
            bondAngle: "120° at C=O",
            polarity: "Polar",
            uses: "Solvent, nail polish remover, chemical synthesis"
        }
    },
    {
        name: "Formaldehyde",
        formula: "CH₂O",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'O', position: [1.21, 0, 0] },
            { element: 'H', position: [-0.50, 0.87, 0] },
            { element: 'H', position: [-0.50, -0.87, 0] }
        ],
        bonds: [[0, 1], [0, 2], [0, 3]],
        info: {
            description: "Formaldehyde is the simplest aldehyde, used in plastics and preservation.",
            molecularWeight: "30.031 g/mol",
            bondAngle: "120°",
            polarity: "Polar",
            uses: "Plastics, preservative, disinfectant"
        }
    },
    // Nitrogen Compounds
    {
        name: "Methylamine",
        formula: "CH₃NH₂",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'N', position: [1.47, 0, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] },
            { element: 'H', position: [1.83, 0.81, 0] },
            { element: 'H', position: [1.83, -0.81, 0] }
        ],
        bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [1, 6]],
        info: {
            description: "Methylamine is a simple primary amine with a fishy odor.",
            molecularWeight: "31.058 g/mol",
            bondAngle: "107° at N",
            polarity: "Polar",
            uses: "Chemical synthesis, pharmaceuticals, agriculture"
        }
    },
    // Sulfur Compounds
    {
        name: "Hydrogen Sulfide",
        formula: "H₂S",
        atoms: [
            { element: 'S', position: [0, 0, 0] },
            { element: 'H', position: [1.34, 0, 0] },
            { element: 'H', position: [-0.33, 1.29, 0] }
        ],
        bonds: [[0, 1], [0, 2]],
        info: {
            description: "Hydrogen sulfide is a toxic gas with the smell of rotten eggs.",
            molecularWeight: "34.082 g/mol",
            bondAngle: "92°",
            polarity: "Polar",
            uses: "Chemical analysis, metal purification"
        }
    },
    {
        name: "Sulfur Dioxide",
        formula: "SO₂",
        atoms: [
            { element: 'S', position: [0, 0, 0] },
            { element: 'O', position: [1.49, 0, 0] },
            { element: 'O', position: [-0.75, 1.29, 0] }
        ],
        bonds: [[0, 1], [0, 2]],
        info: {
            description: "Sulfur dioxide is a toxic gas produced by burning sulfur, causes acid rain.",
            molecularWeight: "64.066 g/mol",
            bondAngle: "119°",
            polarity: "Polar",
            uses: "Preservative, bleaching agent, chemical synthesis"
        }
    },
    // Phosphorus Compounds
    {
        name: "Phosphine",
        formula: "PH₃",
        atoms: [
            { element: 'P', position: [0, 0, 0] },
            { element: 'H', position: [1.42, 0, 0] },
            { element: 'H', position: [-0.47, 1.34, 0] },
            { element: 'H', position: [-0.47, -1.34, 0] }
        ],
        bonds: [[0, 1], [0, 2], [0, 3]],
        info: {
            description: "Phosphine is a toxic gas with a garlic-like odor, used in semiconductors.",
            molecularWeight: "33.998 g/mol",
            bondAngle: "93.5°",
            polarity: "Polar",
            uses: "Semiconductor industry, fumigant, chemical synthesis"
        }
    },
    // Fluorine Compounds
    {
        name: "Hydrogen Fluoride",
        formula: "HF",
        atoms: [
            { element: 'H', position: [0, 0, 0] },
            { element: 'F', position: [0.92, 0, 0] }
        ],
        bonds: [[0, 1]],
        info: {
            description: "Hydrogen fluoride is a highly corrosive acid with strong hydrogen bonding.",
            molecularWeight: "20.006 g/mol",
            bondAngle: "Linear",
            polarity: "Polar",
            uses: "Glass etching, aluminum production, chemical synthesis"
        }
    },
    {
        name: "Methyl Fluoride",
        formula: "CH₃F",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'F', position: [1.39, 0, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [0, 2], [0, 3], [0, 4]],
        info: {
            description: "Methyl fluoride is a simple organofluorine compound.",
            molecularWeight: "34.033 g/mol",
            bondAngle: "109.5°",
            polarity: "Polar",
            uses: "Refrigerant, chemical intermediate"
        }
    },
    // Biological Molecules (simplified)
    {
        name: "Glucose",
        formula: "C₆H₁₂O₆",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'C', position: [2.31, 1.21, 0] },
            { element: 'C', position: [1.54, 2.42, 0] },
            { element: 'C', position: [0, 2.42, 0] },
            { element: 'O', position: [-0.77, 1.21, 0] },
            { element: 'O', position: [0, -1.21, 0] },
            { element: 'O', position: [2.31, -1.21, 0] },
            { element: 'O', position: [3.77, 1.21, 0] },
            { element: 'O', position: [2.31, 3.63, 0] },
            { element: 'O', position: [-0.77, 3.63, 0] },
            { element: 'H', position: [0.94, -1.65, 0] },
            { element: 'H', position: [3.25, -1.65, 0] },
            { element: 'H', position: [4.71, 1.65, 0] },
            { element: 'H', position: [3.25, 4.07, 0] },
            { element: 'H', position: [-1.71, 4.07, 0] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [6, 11], [7, 12], [8, 13], [9, 14], [10, 15]],
        info: {
            description: "Glucose is a simple sugar and the primary source of energy for living organisms.",
            molecularWeight: "180.156 g/mol",
            bondAngle: "Various",
            polarity: "Polar",
            uses: "Energy source, food industry, medical applications"
        }
    },
    // Additional Simple Molecules
    {
        name: "Carbon Monoxide",
        formula: "CO",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'O', position: [1.13, 0, 0] }
        ],
        bonds: [[0, 1]],
        info: {
            description: "Carbon monoxide is a toxic gas produced by incomplete combustion.",
            molecularWeight: "28.010 g/mol",
            bondAngle: "Linear",
            polarity: "Polar",
            uses: "Metal refining, fuel gas, chemical synthesis"
        }
    },
    {
        name: "Nitric Oxide",
        formula: "NO",
        atoms: [
            { element: 'N', position: [0, 0, 0] },
            { element: 'O', position: [1.15, 0, 0] }
        ],
        bonds: [[0, 1]],
        info: {
            description: "Nitric oxide is a radical molecule important in biological signaling.",
            molecularWeight: "30.006 g/mol",
            bondAngle: "Linear",
            polarity: "Polar",
            uses: "Biological signaling, medical treatments, chemical synthesis"
        }
    },
    // Additional Alcohols
    {
        name: "Isopropanol",
        formula: "C₃H₈O",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'C', position: [3.08, 0, 0] },
            { element: 'O', position: [1.54, 1.43, 0] },
            { element: 'H', position: [2.37, 1.43, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] },
            { element: 'H', position: [1.54, -1.03, 0] },
            { element: 'H', position: [3.44, 1.03, 0] },
            { element: 'H', position: [3.44, -0.51, 0.89] },
            { element: 'H', position: [3.44, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [1, 2], [1, 3], [3, 4], [0, 5], [0, 6], [0, 7], [1, 8], [2, 9], [2, 10], [2, 11]],
        info: {
            description: "Isopropanol (rubbing alcohol) is a common antiseptic and solvent.",
            molecularWeight: "60.096 g/mol",
            bondAngle: "Various",
            polarity: "Polar",
            uses: "Antiseptic, solvent, cleaning agent"
        }
    },
    {
        name: "Phenol",
        formula: "C₆H₅OH",
        atoms: [
            { element: 'C', position: [1.4, 0, 0] },
            { element: 'C', position: [0.7, 1.21, 0] },
            { element: 'C', position: [-0.7, 1.21, 0] },
            { element: 'C', position: [-1.4, 0, 0] },
            { element: 'C', position: [-0.7, -1.21, 0] },
            { element: 'C', position: [0.7, -1.21, 0] },
            { element: 'O', position: [2.8, 0, 0] },
            { element: 'H', position: [3.74, 0, 0] },
            { element: 'H', position: [1.24, 2.15, 0] },
            { element: 'H', position: [-1.24, 2.15, 0] },
            { element: 'H', position: [-2.48, 0, 0] },
            { element: 'H', position: [-1.24, -2.15, 0] },
            { element: 'H', position: [1.24, -2.15, 0] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [6, 7], [1, 8], [2, 9], [3, 10], [4, 11], [5, 12]],
        info: {
            description: "Phenol is an aromatic alcohol with antiseptic properties.",
            molecularWeight: "94.111 g/mol",
            bondAngle: "120° (aromatic)",
            polarity: "Polar",
            uses: "Antiseptic, plastics production, pharmaceuticals"
        }
    },
    // Additional Aromatics
    {
        name: "Naphthalene",
        formula: "C₁₀H₈",
        atoms: [
            { element: 'C', position: [1.4, 0, 0] },
            { element: 'C', position: [0.7, 1.21, 0] },
            { element: 'C', position: [-0.7, 1.21, 0] },
            { element: 'C', position: [-1.4, 0, 0] },
            { element: 'C', position: [-0.7, -1.21, 0] },
            { element: 'C', position: [0.7, -1.21, 0] },
            { element: 'C', position: [2.8, 0, 0] },
            { element: 'C', position: [3.5, 1.21, 0] },
            { element: 'C', position: [2.8, 2.42, 0] },
            { element: 'C', position: [1.4, 2.42, 0] },
            { element: 'H', position: [-2.48, 0, 0] },
            { element: 'H', position: [-1.24, -2.15, 0] },
            { element: 'H', position: [1.24, -2.15, 0] },
            { element: 'H', position: [3.88, 0, 0] },
            { element: 'H', position: [4.58, 1.21, 0] },
            { element: 'H', position: [3.36, 3.36, 0] },
            { element: 'H', position: [0.84, 3.36, 0] },
            { element: 'H', position: [-1.24, 2.15, 0] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [6, 7], [7, 8], [8, 9], [9, 1], [1, 9], [6, 7], [3, 10], [4, 11], [5, 12], [6, 13], [7, 14], [8, 15], [9, 16], [2, 17]],
        info: {
            description: "Naphthalene consists of two fused benzene rings, commonly found in mothballs.",
            molecularWeight: "128.174 g/mol",
            bondAngle: "120°",
            polarity: "Nonpolar",
            uses: "Mothballs, chemical synthesis, dyes"
        }
    },
    // Additional Alkanes
    {
        name: "Butane",
        formula: "C₄H₁₀",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'C', position: [3.08, 0, 0] },
            { element: 'C', position: [4.62, 0, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] },
            { element: 'H', position: [1.54, 1.03, 0] },
            { element: 'H', position: [1.54, -1.03, 0] },
            { element: 'H', position: [3.08, 1.03, 0] },
            { element: 'H', position: [3.08, -1.03, 0] },
            { element: 'H', position: [4.98, 1.03, 0] },
            { element: 'H', position: [4.98, -0.51, 0.89] },
            { element: 'H', position: [4.98, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [0, 4], [0, 5], [0, 6], [1, 7], [1, 8], [2, 9], [2, 10], [3, 11], [3, 12], [3, 13]],
        info: {
            description: "Butane is a four-carbon alkane commonly used as lighter fuel.",
            molecularWeight: "58.124 g/mol",
            bondAngle: "109.5°",
            polarity: "Nonpolar",
            uses: "Lighter fuel, refrigerant, aerosol propellant"
        }
    },
    {
        name: "Cyclohexane",
        formula: "C₆H₁₂",
        atoms: [
            { element: 'C', position: [1.4, 0, 0.5] },
            { element: 'C', position: [0.7, 1.21, -0.5] },
            { element: 'C', position: [-0.7, 1.21, 0.5] },
            { element: 'C', position: [-1.4, 0, -0.5] },
            { element: 'C', position: [-0.7, -1.21, 0.5] },
            { element: 'C', position: [0.7, -1.21, -0.5] },
            { element: 'H', position: [2.48, 0, 0.5] },
            { element: 'H', position: [1.4, 0, 1.6] },
            { element: 'H', position: [1.24, 2.15, -0.5] },
            { element: 'H', position: [0.7, 1.21, -1.6] },
            { element: 'H', position: [-1.24, 2.15, 0.5] },
            { element: 'H', position: [-0.7, 1.21, 1.6] },
            { element: 'H', position: [-2.48, 0, -0.5] },
            { element: 'H', position: [-1.4, 0, -1.6] },
            { element: 'H', position: [-1.24, -2.15, 0.5] },
            { element: 'H', position: [-0.7, -1.21, 1.6] },
            { element: 'H', position: [1.24, -2.15, -0.5] },
            { element: 'H', position: [0.7, -1.21, -1.6] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [0, 7], [1, 8], [1, 9], [2, 10], [2, 11], [3, 12], [3, 13], [4, 14], [4, 15], [5, 16], [5, 17]],
        info: {
            description: "Cyclohexane is a six-membered carbon ring in chair conformation.",
            molecularWeight: "84.162 g/mol",
            bondAngle: "109.5°",
            polarity: "Nonpolar",
            uses: "Solvent, nylon production, chemical synthesis"
        }
    },
    // Additional Alkenes & Alkynes
    {
        name: "Propene",
        formula: "C₃H₆",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.34, 0, 0] },
            { element: 'C', position: [2.88, 0, 0] },
            { element: 'H', position: [-0.50, 0.87, 0] },
            { element: 'H', position: [-0.50, -0.87, 0] },
            { element: 'H', position: [1.84, 0.87, 0] },
            { element: 'H', position: [3.24, 1.03, 0] },
            { element: 'H', position: [3.24, -0.51, 0.89] },
            { element: 'H', position: [3.24, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [1, 2], [0, 3], [0, 4], [1, 5], [2, 6], [2, 7], [2, 8]],
        info: {
            description: "Propene is a three-carbon alkene used in polymer production.",
            molecularWeight: "42.081 g/mol",
            bondAngle: "120° at C=C",
            polarity: "Nonpolar",
            uses: "Polypropylene production, chemical synthesis"
        }
    },
    {
        name: "Acetylene",
        formula: "C₂H₂",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.20, 0, 0] },
            { element: 'H', position: [-1.06, 0, 0] },
            { element: 'H', position: [2.26, 0, 0] }
        ],
        bonds: [[0, 1], [0, 2], [1, 3]],
        info: {
            description: "Acetylene is the simplest alkyne with a carbon-carbon triple bond.",
            molecularWeight: "26.038 g/mol",
            bondAngle: "180°",
            polarity: "Nonpolar",
            uses: "Welding gas, chemical synthesis, lighting"
        }
    },
    // Additional Acids
    {
        name: "Propionic Acid",
        formula: "C₃H₆O₂",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'C', position: [3.08, 0, 0] },
            { element: 'O', position: [3.62, 1.21, 0] },
            { element: 'O', position: [3.62, -1.21, 0] },
            { element: 'H', position: [4.46, -1.65, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] },
            { element: 'H', position: [1.54, 1.03, 0] },
            { element: 'H', position: [1.54, -1.03, 0] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [0, 6], [0, 7], [0, 8], [1, 9], [1, 10]],
        info: {
            description: "Propionic acid is a three-carbon carboxylic acid used as a food preservative.",
            molecularWeight: "74.079 g/mol",
            bondAngle: "Various",
            polarity: "Polar",
            uses: "Food preservative, chemical synthesis, herbicides"
        }
    },
    // Esters
    {
        name: "Ethyl Acetate",
        formula: "C₄H₈O₂",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'O', position: [2.08, 1.21, 0] },
            { element: 'O', position: [2.08, -1.21, 0] },
            { element: 'C', position: [3.62, -1.21, 0] },
            { element: 'C', position: [5.16, -1.21, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] },
            { element: 'H', position: [3.98, -0.18, 0] },
            { element: 'H', position: [3.98, -2.24, 0] },
            { element: 'H', position: [5.52, -0.18, 0] },
            { element: 'H', position: [5.52, -1.72, 0.89] },
            { element: 'H', position: [5.52, -1.72, -0.89] }
        ],
        bonds: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [0, 6], [0, 7], [0, 8], [4, 9], [4, 10], [5, 11], [5, 12], [5, 13]],
        info: {
            description: "Ethyl acetate is a common ester used as a solvent in nail polish remover.",
            molecularWeight: "88.106 g/mol",
            bondAngle: "Various",
            polarity: "Polar",
            uses: "Solvent, nail polish remover, food flavoring"
        }
    },
    // Additional Ketones
    {
        name: "Acetaldehyde",
        formula: "C₂H₄O",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'O', position: [2.75, 0, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] },
            { element: 'H', position: [1.54, -1.06, 0] }
        ],
        bonds: [[0, 1], [1, 2], [0, 3], [0, 4], [0, 5], [1, 6]],
        info: {
            description: "Acetaldehyde is produced during alcohol metabolism and has a pungent smell.",
            molecularWeight: "44.053 g/mol",
            bondAngle: "120° at C=O",
            polarity: "Polar",
            uses: "Chemical synthesis, flavoring, preservative"
        }
    },
    // Ethers
    {
        name: "Diethyl Ether",
        formula: "C₄H₁₀O",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'O', position: [3.08, 0, 0] },
            { element: 'C', position: [4.62, 0, 0] },
            { element: 'C', position: [6.16, 0, 0] },
            { element: 'H', position: [-0.36, 1.03, 0] },
            { element: 'H', position: [-0.36, -0.51, 0.89] },
            { element: 'H', position: [-0.36, -0.51, -0.89] },
            { element: 'H', position: [1.54, 1.03, 0] },
            { element: 'H', position: [1.54, -1.03, 0] },
            { element: 'H', position: [4.62, 1.03, 0] },
            { element: 'H', position: [4.62, -1.03, 0] },
            { element: 'H', position: [6.52, 1.03, 0] },
            { element: 'H', position: [6.52, -0.51, 0.89] },
            { element: 'H', position: [6.52, -0.51, -0.89] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [0, 6], [0, 7], [1, 8], [1, 9], [3, 10], [3, 11], [4, 12], [4, 13], [4, 14]],
        info: {
            description: "Diethyl ether was historically used as an anesthetic and is a common solvent.",
            molecularWeight: "74.123 g/mol",
            bondAngle: "104° at oxygen",
            polarity: "Slightly polar",
            uses: "Solvent, extraction, former anesthetic"
        }
    },
    // Additional Nitrogen Compounds
    {
        name: "Dimethylamine",
        formula: "C₂H₇N",
        atoms: [
            { element: 'N', position: [0, 0, 0] },
            { element: 'C', position: [1.47, 0, 0] },
            { element: 'C', position: [-0.74, 1.28, 0] },
            { element: 'H', position: [0, -1.01, 0] },
            { element: 'H', position: [1.83, 1.03, 0] },
            { element: 'H', position: [1.83, -0.51, 0.89] },
            { element: 'H', position: [1.83, -0.51, -0.89] },
            { element: 'H', position: [-1.10, 1.79, 0.89] },
            { element: 'H', position: [-1.10, 1.79, -0.89] },
            { element: 'H', position: [-0.38, 2.31, 0] }
        ],
        bonds: [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [1, 6], [2, 7], [2, 8], [2, 9]],
        info: {
            description: "Dimethylamine is a secondary amine with a fishy odor.",
            molecularWeight: "45.085 g/mol",
            bondAngle: "107° at N",
            polarity: "Polar",
            uses: "Chemical synthesis, pharmaceuticals, agriculture"
        }
    },
    {
        name: "Pyridine",
        formula: "C₅H₅N",
        atoms: [
            { element: 'C', position: [1.4, 0, 0] },
            { element: 'C', position: [0.43, 1.32, 0] },
            { element: 'C', position: [-1.0, 1.32, 0] },
            { element: 'N', position: [-1.83, 0, 0] },
            { element: 'C', position: [-1.0, -1.32, 0] },
            { element: 'C', position: [0.43, -1.32, 0] },
            { element: 'H', position: [2.48, 0, 0] },
            { element: 'H', position: [0.79, 2.35, 0] },
            { element: 'H', position: [-1.56, 2.35, 0] },
            { element: 'H', position: [-1.56, -2.35, 0] },
            { element: 'H', position: [0.79, -2.35, 0] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [1, 7], [2, 8], [4, 9], [5, 10]],
        info: {
            description: "Pyridine is an aromatic nitrogen heterocycle used as a solvent and base.",
            molecularWeight: "79.101 g/mol",
            bondAngle: "120°",
            polarity: "Polar",
            uses: "Solvent, chemical synthesis, pharmaceuticals"
        }
    },
    // Halogen Compounds
    {
        name: "Chloroform",
        formula: "CHCl₃",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'Cl', position: [1.77, 0, 0] },
            { element: 'Cl', position: [-0.59, 1.67, 0] },
            { element: 'Cl', position: [-0.59, -0.83, 1.45] },
            { element: 'H', position: [-0.59, -0.83, -1.45] }
        ],
        bonds: [[0, 1], [0, 2], [0, 3], [0, 4]],
        info: {
            description: "Chloroform was formerly used as an anesthetic but is now known to be toxic.",
            molecularWeight: "119.378 g/mol",
            bondAngle: "109.5°",
            polarity: "Polar",
            uses: "Solvent, refrigerant production, chemical synthesis"
        }
    },
    // Additional Biological Molecules
    {
        name: "Fructose",
        formula: "C₆H₁₂O₆",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'C', position: [1.54, 0, 0] },
            { element: 'C', position: [2.31, 1.21, 0] },
            { element: 'C', position: [1.54, 2.42, 0] },
            { element: 'C', position: [0, 2.42, 0] },
            { element: 'C', position: [-0.77, 1.21, 0] },
            { element: 'O', position: [0, -1.21, 0] },
            { element: 'O', position: [2.31, -1.21, 0] },
            { element: 'O', position: [3.77, 1.21, 0] },
            { element: 'O', position: [2.31, 3.63, 0] },
            { element: 'O', position: [-0.77, 3.63, 0] },
            { element: 'O', position: [-2.23, 1.21, 0] },
            { element: 'H', position: [0.94, -1.65, 0] },
            { element: 'H', position: [3.25, -1.65, 0] },
            { element: 'H', position: [4.71, 1.65, 0] },
            { element: 'H', position: [3.25, 4.07, 0] },
            { element: 'H', position: [-1.71, 4.07, 0] },
            { element: 'H', position: [-3.17, 1.65, 0] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12], [7, 13], [8, 14], [9, 15], [10, 16], [11, 17]],
        info: {
            description: "Fructose is a simple sugar found in fruits and honey.",
            molecularWeight: "180.156 g/mol",
            bondAngle: "Various",
            polarity: "Polar",
            uses: "Sweetener, food industry, energy source"
        }
    },
    {
        name: "Caffeine",
        formula: "C₈H₁₀N₄O₂",
        atoms: [
            { element: 'C', position: [0, 0, 0] },
            { element: 'N', position: [1.35, 0, 0] },
            { element: 'C', position: [2.03, 1.17, 0] },
            { element: 'N', position: [1.35, 2.34, 0] },
            { element: 'C', position: [0, 2.34, 0] },
            { element: 'C', position: [-0.68, 1.17, 0] },
            { element: 'N', position: [-2.03, 1.17, 0] },
            { element: 'C', position: [-2.71, 0, 0] },
            { element: 'N', position: [-2.03, -1.17, 0] },
            { element: 'C', position: [-0.68, -1.17, 0] },
            { element: 'O', position: [3.38, 1.17, 0] },
            { element: 'O', position: [-0.68, 3.51, 0] },
            { element: 'C', position: [2.03, 3.51, 0] },
            { element: 'C', position: [-2.71, 2.34, 0] },
            { element: 'C', position: [-2.71, -2.34, 0] },
            { element: 'H', position: [-3.79, 0, 0] },
            { element: 'H', position: [-1.76, -1.17, 0] },
            { element: 'H', position: [2.71, 4.34, 0] },
            { element: 'H', position: [1.35, 4.34, 0] },
            { element: 'H', position: [2.71, 2.68, 0] },
            { element: 'H', position: [-3.79, 2.34, 0] },
            { element: 'H', position: [-2.03, 3.17, 0] },
            { element: 'H', position: [-2.03, 1.51, 0] },
            { element: 'H', position: [-3.79, -2.34, 0] },
            { element: 'H', position: [-2.03, -3.17, 0] },
            { element: 'H', position: [-2.03, -1.51, 0] }
        ],
        bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0], [2, 10], [4, 11], [3, 12], [6, 13], [8, 14], [7, 15], [9, 16], [12, 17], [12, 18], [12, 19], [13, 20], [13, 21], [13, 22], [14, 23], [14, 24], [14, 25]],
        info: {
            description: "Caffeine is a stimulant alkaloid found in coffee, tea, and other plants.",
            molecularWeight: "194.194 g/mol",
            bondAngle: "Various",
            polarity: "Polar",
            uses: "Stimulant, beverages, pharmaceuticals"
        }
    }
];

// Molecule categorization
const moleculeCategories = {
    "Simple Molecules": [
        "Water", "Methane", "Ammonia", "Carbon Dioxide", "Hydrogen Gas", 
        "Oxygen Gas", "Nitrogen Gas", "Hydrogen Chloride", "Carbon Monoxide", "Nitric Oxide"
    ],
    "Alcohols & Phenols": [
        "Ethanol", "Methanol", "Isopropanol", "Phenol"
    ],
    "Aromatics": [
        "Benzene", "Toluene", "Naphthalene"
    ],
    "Alkanes": [
        "Ethane", "Propane", "Butane", "Cyclohexane"
    ],
    "Alkenes & Alkynes": [
        "Ethylene", "Propene", "Acetylene"
    ],
    "Carboxylic Acids": [
        "Acetic Acid", "Formic Acid", "Propionic Acid"
    ],
    "Esters": [
        "Ethyl Acetate"
    ],
    "Ketones & Aldehydes": [
        "Acetone", "Formaldehyde", "Acetaldehyde"
    ],
    "Ethers": [
        "Diethyl Ether"
    ],
    "Nitrogen Compounds": [
        "Methylamine", "Dimethylamine", "Pyridine"
    ],
    "Sulfur Compounds": [
        "Hydrogen Sulfide", "Sulfur Dioxide"
    ],
    "Phosphorus Compounds": [
        "Phosphine"
    ],
    "Halogen Compounds": [
        "Hydrogen Fluoride", "Methyl Fluoride", "Chloroform"
    ],
    "Biological Molecules": [
        "Glucose", "Fructose", "Caffeine"
    ]
};

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
    camera.position.set(10, 10, 10);
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
        cameraDistance = Math.max(5, Math.min(50, cameraDistance));
        
        // Update camera position using spherical coordinates
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(camera.position);
        spherical.radius = cameraDistance;
        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);
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
    let radius, material;
    
    if (displayMode === 'space-fill') {
        radius = atomRadii[element];
        material = new THREE.MeshPhongMaterial({ color: atomColors[element] });
    } else if (displayMode === 'wireframe') {
        radius = atomRadii[element] * 0.2;
        material = new THREE.MeshPhongMaterial({ 
            color: atomColors[element],
            wireframe: true,
            wireframeLinewidth: 2
        });
    } else { // ball-stick mode
        radius = atomRadii[element] * 0.3;
        material = new THREE.MeshPhongMaterial({ color: atomColors[element] });
    }
    
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
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
    
    let bondRadius, material;
    
    if (displayMode === 'wireframe') {
        bondRadius = 0.05;
        material = new THREE.MeshPhongMaterial({ 
            color: 0x666666,
            wireframe: true,
            wireframeLinewidth: 2
        });
    } else { // ball-stick mode
        bondRadius = 0.1;
        material = new THREE.MeshPhongMaterial({ color: 0x666666 });
    }
    
    const geometry = new THREE.CylinderGeometry(bondRadius, bondRadius, distance, 8);
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
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    cameraDistance = 14;
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

// Function to populate molecule categories
function populateMoleculeCategories() {
    const container = document.getElementById('moleculeCategories');
    container.innerHTML = '';
    
    Object.keys(moleculeCategories).forEach(categoryName => {
        // Create category header
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.innerHTML = `
            ${categoryName}
            <span class="category-icon">▼</span>
        `;
        
        // Create category content
        const categoryContent = document.createElement('div');
        categoryContent.className = 'category-content';
        
        const moleculeList = document.createElement('ul');
        moleculeList.className = 'molecule-list';
        
        // Add molecules to this category
        moleculeCategories[categoryName].forEach(moleculeName => {
            const molecule = moleculeDatabase.find(mol => mol.name === moleculeName);
            if (molecule) {
                const listItem = document.createElement('li');
                listItem.className = 'molecule-item';
                listItem.innerHTML = `
                    <div class="molecule-name">${molecule.name}</div>
                    <div class="molecule-formula">${molecule.formula}</div>
                `;
                listItem.addEventListener('click', () => selectMolecule(molecule));
                moleculeList.appendChild(listItem);
            }
        });
        
        categoryContent.appendChild(moleculeList);
        
        // Add click handler for category toggle
        categoryHeader.addEventListener('click', () => {
            categoryHeader.classList.toggle('collapsed');
            categoryContent.classList.toggle('collapsed');
        });
        
        container.appendChild(categoryHeader);
        container.appendChild(categoryContent);
    });
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Update the element color mapping to include all elements
const elementColors = {
    'H': 0xffffff,   // White
    'C': 0x404040,   // Dark gray
    'N': 0x0000ff,   // Blue
    'O': 0xff0000,   // Red
    'S': 0xffff00,   // Yellow
    'P': 0xffa500,   // Orange
    'F': 0x00ff00,   // Green
    'Cl': 0x00ffff,  // Cyan
    'Br': 0x8b4513,  // Brown
    'I': 0x800080    // Purple
};

// Make sure this runs when the page loads
document.addEventListener('DOMContentLoaded', function() {
    populateMoleculeCategories();
    // ... rest of initialization code
});
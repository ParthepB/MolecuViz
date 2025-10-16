// MoleculeVisuals/Diatomic/hydrogen.js
export const hydrogenMolecule = {
  name: "Hydrogen",
  formula: "H₂",
  atoms: [
    { element: 'H', position: [0, 0, 0] },
    { element: 'H', position: [0.74, 0, 0] }
  ],
  bonds: [[0, 1]],
  info: {
    description: "Hydrogen gas (H₂) is the simplest molecule in the universe.",
    molecularWeight: "2.016 g/mol",
    bondLength: "0.74 Å"
  }
};

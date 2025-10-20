// MoleculeVisuals/Diatomic/oxygen.js
export const oxygenMolecule = {
  name: "Oxygen",
  formula: "O₂",
  atoms: [
    { element: 'O', position: [0, 0, 0] },
    { element: 'O', position: [1.21, 0, 0] } // typical O=O bond length ~1.21 Å
  ],
  bonds: [[0, 1]],
  info: {
    description: "Oxygen gas (O₂) is essential for respiration and combustion.",
    molecularWeight: "31.998 g/mol",
    bondLength: "1.21 Å"
  }
};

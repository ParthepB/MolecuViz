// MoleculeVisuals/Diatomic/nitrogen.js
export const nitrogenMolecule = {
  name: "Nitrogen",
  formula: "N₂",
  atoms: [
    { element: 'N', position: [0, 0, 0] },
    { element: 'N', position: [1.10, 0, 0] } // typical N≡N bond length ~1.10 Å
  ],
  bonds: [[0, 1]],
  info: {
    description: "Nitrogen gas (N₂) makes up about 78% of Earth's atmosphere and is essential for life, forming the basis of amino acids and DNA.",
    molecularWeight: "28.014 g/mol",
    bondLength: "1.10 Å"
  }
};

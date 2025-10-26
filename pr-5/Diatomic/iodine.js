// MoleculeVisuals/Diatomic/iodine.js
export const iodineMolecule = {
  name: "Iodine",
  formula: "I₂",
  atoms: [
    { element: 'I', position: [0, 0, 0] },
    { element: 'I', position: [2.67, 0, 0] } // typical I-I bond length ~2.67 Å
  ],
  bonds: [[0, 1]],
  info: {
    description: "Iodine gas (I₂) is a violet-colored diatomic halogen. It's essential for thyroid function and is commonly used as an antiseptic.",
    molecularWeight: "253.809 g/mol",
    bondLength: "2.67 Å",
    boilingPoint: "184.3°C",
    meltingPoint: "113.7°C",
    color: "Violet vapor, dark crystals",
    uses: "Antiseptic, thyroid medication, photography, analytical chemistry"
  }
};
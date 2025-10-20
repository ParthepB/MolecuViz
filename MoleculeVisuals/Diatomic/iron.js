// MoleculeVisuals/Diatomic/iodine.js
export const iodineMolecule = {
  name: "Iodine",
  formula: "I₂",
  atoms: [
    { element: 'I', position: [0, 0, 0] },
    { element: 'I', position: [2.67, 0, 0] } // typical I–I bond length ~2.67 Å
  ],
  bonds: [[0, 1]],
  info: {
    description: "Iodine (I₂) is a dark violet solid at room temperature that sublimates into a purple vapor. It is essential for thyroid hormone production in humans.",
    molecularWeight: "253.8089 g/mol",
    bondLength: "2.67 Å"
  }
};

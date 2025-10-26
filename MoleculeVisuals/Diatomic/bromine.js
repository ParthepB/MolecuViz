// MoleculeVisuals/Diatomic/bromine.js
export const bromineMolecule = {
  name: "Bromine",
  formula: "Br₂",
  atoms: [
    { element: 'Br', position: [0, 0, 0] },
    { element: 'Br', position: [2.28, 0, 0] } // typical Br-Br bond length ~2.28 Å
  ],
  bonds: [[0, 1]],
  info: {
    description: "Bromine gas (Br₂) is a reddish-brown diatomic halogen that is liquid at room temperature. It's highly reactive and toxic.",
    molecularWeight: "159.808 g/mol",
    bondLength: "2.28 Å",
    boilingPoint: "58.8°C",
    meltingPoint: "-7.3°C",
    color: "Reddish-brown liquid/vapor",
    uses: "Flame retardants, pharmaceuticals, pesticides, water treatment"
  }
};
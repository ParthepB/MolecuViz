from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
import json
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
import io
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Azure OpenAI
openai.api_type = "azure"
openai.api_base = os.getenv("AZURE_OPENAI_ENDPOINT")
openai.api_version = os.getenv("AZURE_OPENAI_API_VERSION")
openai.api_key = os.getenv("AZURE_OPENAI_API_KEY")

# Molecule database for AI context
MOLECULES_CONTEXT = """
Available molecules in MolecuViz:

SIMPLE MOLECULES:
1. Water (H₂O) - Polar molecule, bent geometry, 104.5° bond angle
2. Methane (CH₄) - Nonpolar, tetrahedral geometry, 109.5° bond angle
3. Ammonia (NH₃) - Polar, trigonal pyramidal geometry, 107° bond angle
4. Carbon Dioxide (CO₂) - Nonpolar, linear geometry, 180° bond angle
5. Hydrogen Gas (H₂) - Nonpolar diatomic molecule
6. Oxygen Gas (O₂) - Nonpolar diatomic molecule, paramagnetic
7. Nitrogen Gas (N₂) - Nonpolar, strong triple bond
8. Hydrogen Chloride (HCl) - Polar, strong acid when dissolved
9. Carbon Monoxide (CO) - Polar, toxic gas with triple bond
10. Nitric Oxide (NO) - Radical molecule, biological signaling

ALCOHOLS & PHENOLS:
11. Ethanol (C₂H₅OH) - Polar alcohol molecule, drinking alcohol
12. Methanol (CH₃OH) - Simplest alcohol, toxic
13. Isopropanol (C₃H₈O) - Rubbing alcohol, antiseptic
14. Ethylene Glycol (C₂H₆O₂) - Antifreeze, diol
15. Glycerol (C₃H₈O₃) - Triol, used in cosmetics
16. Phenol (C₆H₅OH) - Aromatic alcohol, antiseptic

AROMATICS:
17. Benzene (C₆H₆) - Nonpolar aromatic compound, 120° bond angles
18. Toluene (C₇H₈) - Benzene with methyl group, solvent
19. Xylene (C₈H₁₀) - Dimethylbenzene isomers
20. Naphthalene (C₁₀H₈) - Two fused benzene rings, mothballs
21. Anthracene (C₁₄H₁₀) - Three fused benzene rings
22. Phenanthrene (C₁₄H₁₀) - Isomer of anthracene

ALKANES:
23. Ethane (C₂H₆) - Simple two-carbon alkane
24. Propane (C₃H₈) - Three-carbon alkane, fuel
25. Butane (C₄H₁₀) - Four-carbon alkane, lighter fuel
26. Pentane (C₅H₁₂) - Five-carbon alkane
27. Hexane (C₆H₁₄) - Six-carbon alkane, solvent
28. Octane (C₈H₁₈) - Eight-carbon alkane, gasoline component
29. Cyclopropane (C₃H₆) - Three-membered ring, strained
30. Cyclohexane (C₆H₁₂) - Six-membered ring, chair conformation

ALKENES & ALKYNES:
31. Ethylene (C₂H₄) - Simplest alkene with C=C double bond
32. Propene (C₃H₆) - Three-carbon alkene
33. Butene (C₄H₈) - Four-carbon alkene
34. Acetylene (C₂H₂) - Simplest alkyne, welding gas
35. Propyne (C₃H₄) - Three-carbon alkyne
36. Isoprene (C₅H₈) - Building block of rubber

CARBOXYLIC ACIDS:
37. Acetic Acid (CH₃COOH) - Weak acid, main component of vinegar
38. Formic Acid (HCOOH) - Simplest carboxylic acid, ant venom
39. Propionic Acid (C₃H₆O₂) - Food preservative
40. Butyric Acid (C₄H₈O₂) - Rancid butter smell
41. Oxalic Acid (C₂H₂O₄) - Dicarboxylic acid, found in spinach
42. Citric Acid (C₆H₈O₇) - Tricarboxylic acid, citrus fruits

ESTERS:
43. Methyl Acetate (C₃H₆O₂) - Sweet smelling ester
44. Ethyl Acetate (C₄H₈O₂) - Nail polish remover
45. Aspirin (C₉H₈O₄) - Acetylsalicylic acid, pain reliever

KETONES & ALDEHYDES:
46. Acetone (C₃H₆O) - Common ketone solvent
47. Formaldehyde (CH₂O) - Simplest aldehyde, preservative
48. Acetaldehyde (C₂H₄O) - Alcohol metabolism product
49. Benzaldehyde (C₇H₆O) - Almond scent
50. Cyclohexanone (C₆H₁₀O) - Industrial solvent

ETHERS:
51. Diethyl Ether (C₄H₁₀O) - Anesthetic, solvent
52. Methyl tert-Butyl Ether (C₅H₁₂O) - Gasoline additive
53. Tetrahydrofuran (C₄H₈O) - Cyclic ether, solvent

NITROGEN COMPOUNDS:
54. Methylamine (CH₃NH₂) - Primary amine
55. Dimethylamine (C₂H₇N) - Secondary amine
56. Trimethylamine (C₃H₉N) - Tertiary amine, fishy smell
57. Aniline (C₆H₅NH₂) - Aromatic amine, dye precursor
58. Pyridine (C₅H₅N) - Aromatic nitrogen heterocycle
59. Pyrrole (C₄H₅N) - Five-membered nitrogen ring
60. Imidazole (C₃H₄N₂) - Histidine component
61. Nitrobenzene (C₆H₅NO₂) - Explosive precursor
62. Urea (CH₄N₂O) - Nitrogen waste product
63. Hydrazine (N₂H₄) - Rocket fuel

SULFUR COMPOUNDS:
64. Hydrogen Sulfide (H₂S) - Toxic gas, rotten egg smell
65. Sulfur Dioxide (SO₂) - Toxic gas, causes acid rain
66. Dimethyl Sulfide (C₂H₆S) - Ocean smell
67. Methanethiol (CH₄S) - Skunk spray component
68. Thiophene (C₄H₄S) - Sulfur heterocycle

PHOSPHORUS COMPOUNDS:
69. Phosphine (PH₃) - Toxic gas used in semiconductors
70. Trimethyl Phosphate (C₃H₉O₄P) - Flame retardant
71. Phosphoric Acid (H₃PO₄) - Food additive, fertilizer

HALOGEN COMPOUNDS:
72. Hydrogen Fluoride (HF) - Highly corrosive acid
73. Methyl Fluoride (CH₃F) - Simple organofluorine compound
74. Chloroform (CHCl₃) - Former anesthetic, solvent
75. Carbon Tetrachloride (CCl₄) - Ozone-depleting solvent
76. Dichloromethane (CH₂Cl₂) - Paint stripper
77. Freon-12 (CCl₂F₂) - Refrigerant, CFC
78. Teflon Monomer (C₂F₄) - Tetrafluoroethylene

BIOLOGICAL MOLECULES:
79. Glucose (C₆H₁₂O₆) - Simple sugar, primary energy source
80. Fructose (C₆H₁₂O₆) - Fruit sugar
81. Sucrose (C₁₂H₂₂O₁₁) - Table sugar
82. Cholesterol (C₂₇H₄₆O) - Steroid, cell membrane component
83. Caffeine (C₈H₁₀N₄O₂) - Stimulant alkaloid
84. Nicotine (C₁₀H₁₄N₂) - Tobacco alkaloid
85. Adrenaline (C₉H₁₃NO₃) - Epinephrine hormone
86. Dopamine (C₈H₁₁NO₂) - Neurotransmitter
87. Serotonin (C₁₀H₁₂N₂O) - Neurotransmitter
88. Vitamin C (C₆H₈O₆) - Ascorbic acid
89. DNA Base Adenine (C₅H₅N₅) - Purine base
90. DNA Base Thymine (C₅H₆N₂O₂) - Pyrimidine base

DRUGS & PHARMACEUTICALS:
91. Ibuprofen (C₁₃H₁₈O₂) - Anti-inflammatory drug
92. Paracetamol (C₈H₉NO₂) - Acetaminophen, pain reliever
93. Morphine (C₁₇H₁₉NO₃) - Opioid pain medication
94. Penicillin G (C₁₆H₁₈N₂O₄S) - Antibiotic
95. Lidocaine (C₁₄H₂₂N₂O) - Local anesthetic

POLYMERS & MATERIALS:
96. Ethylene Oxide (C₂H₄O) - Epoxide, sterilant
97. Styrene (C₈H₈) - Polystyrene monomer
98. Vinyl Chloride (C₂H₃Cl) - PVC monomer
99. Bisphenol A (C₁₅H₁₆O₂) - Plastic component
100. Formaldehyde Polymer - Bakelite precursor

ENVIRONMENTAL & INDUSTRIAL:
101. DDT (C₁₄H₉Cl₅) - Banned pesticide
102. PCB (C₁₂H₁₀₋ₓClₓ) - Toxic industrial compound
103. Dioxin (C₁₂H₄Cl₄O₂) - Extremely toxic pollutant
104. TNT (C₇H₅N₃O₆) - Explosive compound
105. Nitroglycerin (C₃H₅N₃O₉) - Explosive and heart medication
"""

# Store recent AI interactions
recent_interactions = {}

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files (CSS, JS, etc.)"""
    return send_from_directory('.', filename)

@app.route('/api/ask-ai', methods=['POST'])
def ask_ai():
    """Handle AI questions about molecules"""
    try:
        data = request.get_json()
        user_question = data.get('question', '')
        current_molecule = data.get('current_molecule', '')
        
        if not user_question:
            return jsonify({'error': 'No question provided'}), 400
        
        # Prepare the system message with context
        system_message = f"""You are MolecuViz AI Assistant, an expert in chemistry and molecular structures. 
        You help users understand molecules, their properties, structures, and chemistry concepts.
        
        {MOLECULES_CONTEXT}
        
        Currently viewing molecule: {current_molecule}
        
        Provide clear, educational explanations about molecular structures, chemical properties, 
        bonding, polarity, geometry, and related chemistry concepts. Keep responses concise but informative.
        If asked about molecules not in the database, provide general chemistry knowledge.
        """
        
        # Mock AI responses for testing (replace with actual OpenAI call when configured)
        mock_responses = {
            'water': "Water (H₂O) is a polar molecule with a bent geometry and 104.5° bond angle. The oxygen atom has two lone pairs, creating the bent shape. Water is essential for life and has unique properties like high boiling point due to hydrogen bonding.",
            'methane': "Methane (CH₄) is a tetrahedral molecule with 109.5° bond angles. It's nonpolar due to its symmetrical structure. Methane is the main component of natural gas and the simplest alkane.",
            'benzene': "Benzene (C₆H₆) is an aromatic compound with a hexagonal ring structure. All bond angles are 120°, and it exhibits resonance. Benzene is nonpolar and serves as the basis for many organic compounds.",
            'default': f"I can help explain molecular structures, bonding, polarity, and chemical properties. The molecule {current_molecule} has interesting chemical characteristics that relate to its structure and electron arrangement. What specific aspect would you like to know more about?"
        }
        
        # Simple keyword matching for mock response
        question_lower = user_question.lower()
        response_text = mock_responses.get('default')
        
        for keyword, response in mock_responses.items():
            if keyword in question_lower or (current_molecule and keyword in current_molecule.lower()):
                response_text = response
                break
        
        interaction_id = str(datetime.now().timestamp())
        recent_interactions[interaction_id] = {
            'question': user_question,
            'answer': response_text,
            'molecule': current_molecule,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'answer': response_text,
            'interaction_id': interaction_id
        })
        
    except Exception as e:
        print(f"AI Error: {str(e)}")
        return jsonify({'error': f'AI service error: {str(e)}'}), 500

@app.route('/api/explain-molecule', methods=['POST'])
def explain_molecule():
    """Get AI explanation for a specific molecule"""
    try:
        data = request.get_json()
        molecule_name = data.get('molecule_name', '')
        molecule_formula = data.get('molecule_formula', '')
        
        if not molecule_name:
            return jsonify({'error': 'No molecule specified'}), 400
        
        # Mock explanation responses
        explanations = {
            'Water': "Water is a bent polar molecule with hydrogen bonding capabilities, making it an excellent solvent.",
            'Methane': "Methane is a tetrahedral nonpolar molecule, the simplest alkane and main component of natural gas.",
            'Benzene': "Benzene is an aromatic compound with delocalized electrons, showing resonance and planar geometry."
        }
        
        explanation = explanations.get(molecule_name, f"{molecule_name} is an important chemical compound with unique structural and chemical properties.")
        
        return jsonify({
            'explanation': explanation
        })
        
    except Exception as e:
        print(f"Explanation Error: {str(e)}")
        return jsonify({'error': f'Explanation service error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

from flask import Flask, request, jsonify, render_template, send_from_directory, send_file
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

ALCOHOLS:
9. Ethanol (C₂H₅OH) - Polar alcohol molecule
10. Methanol (CH₃OH) - Simplest alcohol, toxic

AROMATICS:
11. Benzene (C₆H₆) - Nonpolar aromatic compound, 120° bond angles
12. Toluene (C₇H₈) - Benzene with methyl group

ALKANES:
13. Ethane (C₂H₆) - Simple two-carbon alkane
14. Propane (C₃H₈) - Three-carbon alkane, fuel

ALKENES:
15. Ethylene (C₂H₄) - Simplest alkene with C=C double bond

ACIDS:
16. Acetic Acid (CH₃COOH) - Weak acid, main component of vinegar
17. Formic Acid (HCOOH) - Simplest carboxylic acid

KETONES & ALDEHYDES:
18. Acetone (C₃H₆O) - Common ketone solvent
19. Formaldehyde (CH₂O) - Simplest aldehyde

NITROGEN COMPOUNDS:
20. Methylamine (CH₃NH₂) - Primary amine

SULFUR COMPOUNDS:
21. Hydrogen Sulfide (H₂S) - Toxic gas, rotten egg smell
22. Sulfur Dioxide (SO₂) - Toxic gas, causes acid rain

PHOSPHORUS COMPOUNDS:
23. Phosphine (PH₃) - Toxic gas used in semiconductors

FLUORINE COMPOUNDS:
24. Hydrogen Fluoride (HF) - Highly corrosive acid
25. Methyl Fluoride (CH₃F) - Simple organofluorine compound

BIOLOGICAL MOLECULES:
26. Glucose (C₆H₁₂O₆) - Simple sugar, primary energy source
"""

# Store recent AI interactions for PDF generation
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
        
        # Call Azure OpenAI
        response = openai.ChatCompletion.create(
            engine=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_question}
            ],
            max_tokens=500,
            temperature=0.7,
            top_p=0.9
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        # Store the interaction for PDF generation
        if current_molecule:
            recent_interactions[current_molecule] = {
                'question': user_question,
                'answer': ai_response,
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        
        return jsonify({
            'response': ai_response,
            'success': True
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': f'AI service error: {str(e)}',
            'success': False
        }), 500

@app.route('/api/explain-molecule', methods=['POST'])
def explain_molecule():
    """Get AI explanation for a specific molecule"""
    try:
        data = request.get_json()
        molecule_name = data.get('molecule_name', '')
        molecule_formula = data.get('molecule_formula', '')
        
        if not molecule_name:
            return jsonify({'error': 'No molecule name provided'}), 400
        
        prompt = f"""Explain the molecule {molecule_name} ({molecule_formula}). 
        Cover its molecular structure, geometry, bonding, polarity, and key chemical properties. 
        Also mention its significance and real-world applications. Keep it educational and concise."""
        
        system_message = """You are a chemistry expert providing educational explanations about molecules. 
        Focus on molecular structure, chemical properties, and practical applications."""
        
        response = openai.ChatCompletion.create(
            engine=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.7
        )
        
        explanation = response.choices[0].message.content.strip()
        
        return jsonify({
            'explanation': explanation,
            'success': True
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': f'AI service error: {str(e)}',
            'success': False
        }), 500

@app.route('/api/compare-molecules', methods=['POST'])
def compare_molecules():
    """Compare two molecules using AI"""
    try:
        data = request.get_json()
        molecule1 = data.get('molecule1', '')
        molecule2 = data.get('molecule2', '')
        
        if not molecule1 or not molecule2:
            return jsonify({'error': 'Two molecule names required'}), 400
        
        prompt = f"""Compare and contrast {molecule1} and {molecule2}. 
        Discuss differences in their molecular geometry, polarity, bonding, 
        physical properties, and chemical behavior. Highlight key similarities and differences."""
        
        system_message = """You are a chemistry expert comparing molecular structures and properties. 
        Provide clear, educational comparisons focusing on structural and chemical differences."""
        
        response = openai.ChatCompletion.create(
            engine=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        comparison = response.choices[0].message.content.strip()
        
        return jsonify({
            'comparison': comparison,
            'success': True
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': f'AI service error: {str(e)}',
            'success': False
        }), 500

@app.route('/api/predict-properties', methods=['POST'])
def predict_properties():
    """Predict molecular properties using AI"""
    try:
        data = request.get_json()
        molecular_formula = data.get('formula', '')
        
        if not molecular_formula:
            return jsonify({'error': 'Molecular formula required'}), 400
        
        prompt = f"""Given the molecular formula {molecular_formula}, predict and explain:
        1. Likely molecular geometry
        2. Polarity
        3. Intermolecular forces
        4. Physical properties (boiling point trends, solubility)
        5. Chemical reactivity patterns
        
        Provide reasoning for each prediction based on molecular structure principles."""
        
        system_message = """You are a chemistry expert predicting molecular properties based on chemical formulas. 
        Use your knowledge of VSEPR theory, electronegativity, and molecular interactions."""
        
        response = openai.ChatCompletion.create(
            engine=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            max_tokens=600,
            temperature=0.7
        )
        
        predictions = response.choices[0].message.content.strip()
        
        return jsonify({
            'predictions': predictions,
            'success': True
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': f'AI service error: {str(e)}',
            'success': False
        }), 500

def generate_molecule_pdf(molecule_name, molecule_formula, molecule_info, recent_qa=None):
    """Generate PDF for a molecule"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=1*inch)
    styles = getSampleStyleSheet()
    story = []
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=HexColor('#4a5d8a'),
        spaceAfter=20,
        alignment=1  # Center alignment
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=HexColor('#667eea'),
        spaceAfter=10
    )
    
    # Title
    story.append(Paragraph(f"MolecuViz Report: {molecule_name}", title_style))
    story.append(Paragraph(f"Formula: {molecule_formula}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Basic Information
    story.append(Paragraph("Basic Information", heading_style))
    story.append(Paragraph(f"<b>Molecular Weight:</b> {molecule_info.get('molecularWeight', 'N/A')}", styles['Normal']))
    story.append(Paragraph(f"<b>Bond Angle:</b> {molecule_info.get('bondAngle', 'N/A')}", styles['Normal']))
    story.append(Paragraph(f"<b>Polarity:</b> {molecule_info.get('polarity', 'N/A')}", styles['Normal']))
    story.append(Spacer(1, 15))
    
    # Description
    story.append(Paragraph("Description", heading_style))
    story.append(Paragraph(molecule_info.get('description', 'No description available.'), styles['Normal']))
    story.append(Spacer(1, 15))
    
    # Uses
    story.append(Paragraph("Applications", heading_style))
    story.append(Paragraph(molecule_info.get('uses', 'No uses listed.'), styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Recent AI Interaction
    if recent_qa:
        story.append(Paragraph("Recent AI Interaction", heading_style))
        story.append(Paragraph(f"<b>Question asked on {recent_qa['timestamp']}:</b>", styles['Normal']))
        story.append(Paragraph(recent_qa['question'], styles['Italic']))
        story.append(Spacer(1, 10))
        story.append(Paragraph("<b>AI Response:</b>", styles['Normal']))
        story.append(Paragraph(recent_qa['answer'], styles['Normal']))
    else:
        story.append(Paragraph("Recent AI Interaction", heading_style))
        story.append(Paragraph("No recent AI interactions for this molecule.", styles['Italic']))
    
    # Footer
    story.append(Spacer(1, 30))
    story.append(Paragraph(f"Generated by MolecuViz on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer

@app.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    """Generate PDF for a molecule"""
    try:
        data = request.get_json()
        molecule_name = data.get('molecule_name', '')
        molecule_formula = data.get('molecule_formula', '')
        molecule_info = data.get('molecule_info', {})
        
        if not molecule_name:
            return jsonify({'error': 'No molecule name provided'}), 400
        
        # Get recent AI interaction for this molecule
        molecule_key = f"{molecule_name} ({molecule_formula})"
        recent_qa = recent_interactions.get(molecule_key)
        
        # Generate PDF
        pdf_buffer = generate_molecule_pdf(molecule_name, molecule_formula, molecule_info, recent_qa)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"{molecule_name.replace(' ', '_')}_report.pdf"
        )
        
    except Exception as e:
        print(f"PDF Generation Error: {str(e)}")
        return jsonify({
            'error': f'PDF generation error: {str(e)}',
            'success': False
        }), 500

@app.route('/api/preview-pdf', methods=['POST'])
def preview_pdf():
    """Preview PDF for a molecule (display in browser)"""
    try:
        data = request.get_json()
        molecule_name = data.get('molecule_name', '')
        molecule_formula = data.get('molecule_formula', '')
        molecule_info = data.get('molecule_info', {})
        
        if not molecule_name:
            return jsonify({'error': 'No molecule name provided'}), 400
        
        # Get recent AI interaction for this molecule
        molecule_key = f"{molecule_name} ({molecule_formula})"
        recent_qa = recent_interactions.get(molecule_key)
        
        # Generate PDF
        pdf_buffer = generate_molecule_pdf(molecule_name, molecule_formula, molecule_info, recent_qa)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=False,  # Display in browser instead of download
            download_name=f"{molecule_name.replace(' ', '_')}_preview.pdf"
        )
        
    except Exception as e:
        print(f"PDF Preview Error: {str(e)}")
        return jsonify({
            'error': f'PDF preview error: {str(e)}',
            'success': False
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'ai_service': 'Azure OpenAI',
        'deployment': os.getenv("AZURE_OPENAI_DEPLOYMENT")
    })

if __name__ == '__main__':
    print("🧪 MolecuViz Server Starting...")
    print("📡 AI Backend: Azure OpenAI")
    print("🌐 Website: http://localhost:5000")
    print("⚡ API: http://localhost:5000/api/")
    print("🤖 AI Status: http://localhost:5000/api/health")
    print("\n🚀 Open your browser and go to: http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0')

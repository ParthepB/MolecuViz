# MolecuViz with AI Assistant

An enhanced 3D molecular visualization tool with AI-powered chemistry assistance using Azure OpenAI.

## Features

### 3D Molecular Visualization
- Interactive 3D models of common molecules
- Multiple display modes (Ball & Stick, Space Fill, Wireframe)
- Mouse controls for rotation and zooming
- Auto-rotation functionality

### AI Assistant
- **Ask Questions**: Get answers about molecular structures, properties, and chemistry concepts
- **Explain Molecules**: Get detailed explanations of the currently selected molecule
- **Compare Molecules**: Compare two different molecules and their properties
- **Predict Properties**: Analyze molecular formulas and predict their properties

## Setup Instructions

### 1. Python Environment Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Azure OpenAI:**
   Make sure your `.env` file contains:
   ```
   AZURE_OPENAI_API_KEY=your_api_key_here
   AZURE_OPENAI_ENDPOINT=your_endpoint_here
   AZURE_OPENAI_API_VERSION=2024-05-01-preview
   AZURE_OPENAI_DEPLOYMENT=your_deployment_name
   ```

### 2. Start the Application

**Option 1: Use the batch file**
```bash
start_ai_server.bat
```

**Option 2: Run directly**
```bash
python app.py
```

**Option 3: Use Python virtual environment**
```bash
"C:/Users/ParthoBiswas/OneDrive - MS Summer Mentorship/Desktop/MolecuViz/.venv/Scripts/python.exe" app.py
```

### 3. Access the Website

1. **Open your browser and go to:** `http://localhost:5000`
2. **Check AI Status:** Look for green "● Online" in the AI Assistant section
3. **Start exploring:** Select molecules and ask the AI questions!

The server now serves both the website and the AI API from the same port (5000).

## Using the AI Features

### Quick Actions
- **Explain Molecule**: Click to get AI explanation of the current molecule
- **Compare**: Compare the current molecule with another one
- **Predict Properties**: Enter a molecular formula to predict its properties

### Chat Interface
- Type any chemistry question in the input box
- Press Enter or click the ▶ button to ask
- The AI has context about the currently selected molecule

### Example Questions
- "Why is water polar?"
- "What makes benzene aromatic?"
- "How do intermolecular forces affect boiling point?"
- "Explain VSEPR theory for this molecule"
- "What are the applications of this compound?"

## AI Capabilities

The AI assistant can help with:
- Molecular geometry and bonding
- Chemical properties and reactivity
- Intermolecular forces
- Polarity and electronegativity
- Real-world applications
- Comparisons between molecules
- Property predictions from molecular formulas

## Troubleshooting

### AI shows "Offline"
- Make sure the Python backend is running (`python app.py`)
- Check that your Azure OpenAI credentials are correct in `.env`
- Verify the backend is accessible at `http://localhost:5000`

### CORS Issues
- The Flask backend includes CORS headers for localhost
- If running from a different domain, update the CORS settings in `app.py`

### API Errors
- Check your Azure OpenAI quota and deployment status
- Verify the deployment name matches your Azure configuration
- Ensure your API key has the necessary permissions

## Development

### Backend API Endpoints
- `GET /api/health` - Check service status
- `POST /api/ask-ai` - General AI questions
- `POST /api/explain-molecule` - Molecule explanations
- `POST /api/compare-molecules` - Molecule comparisons
- `POST /api/predict-properties` - Property predictions

### Adding New Molecules
1. Add molecule data to `moleculeDatabase` in the HTML file
2. Include atoms positions, bonds, and info object
3. The AI will automatically have context about new molecules

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript, Three.js
- **Backend**: Python, Flask, Flask-CORS
- **AI**: Azure OpenAI (GPT-3.5-turbo)
- **3D Graphics**: Three.js WebGL

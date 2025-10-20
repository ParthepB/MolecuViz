// Wait for both the DOM and script.js to be ready
        let isScriptLoaded = false;
        let isDOMReady = false;
        
        function checkAndInitialize() {
            if (isScriptLoaded && isDOMReady) {
                // Override the populateMoleculeList function to use categories
                window.populateMoleculeList = function() {
                    const categoriesContainer = document.getElementById('moleculeCategories');
                    if (!categoriesContainer) return; // Safety check
                    categoriesContainer.innerHTML = '';
                    
                    // Define molecule categories
                    const categories = {
                        'Simple Molecules': [0, 1, 2, 3, 4, 5, 6, 7], // Water, Methane, Ammonia, CO2, H2, O2, N2, HCl
                        'Alcohols': [8, 9], // Ethanol, Methanol
                        'Aromatics': [10, 11], // Benzene, Toluene
                        'Alkanes': [12, 13], // Ethane, Propane
                        'Alkenes': [14], // Ethylene
                        'Acids': [15, 16], // Acetic Acid, Formic Acid
                        'Ketones & Aldehydes': [17, 18], // Acetone, Formaldehyde
                        'Nitrogen Compounds': [19], // Methylamine
                        'Sulfur Compounds': [20, 21], // H2S, SO2
                        'Phosphorus Compounds': [22], // Phosphine
                        'Fluorine Compounds': [23, 24], // HF, CH3F
                        'Biological Molecules': [25] // Glucose
                    };
                    
                    Object.entries(categories).forEach(([categoryName, moleculeIndices]) => {
                        // Create category header
                        const categoryHeader = document.createElement('div');
                        categoryHeader.className = 'category-header';
                        categoryHeader.innerHTML = `
                            <span>${categoryName}</span>
                            <span class="category-icon">▼</span>
                        `;
                        
                        // Create category content
                        const categoryContent = document.createElement('div');
                        categoryContent.className = 'category-content';
                        
                        // Add molecules to category
                        moleculeIndices.forEach(index => {
                            if (index < moleculeDatabase.length) {
                                const molecule = moleculeDatabase[index];
                                const item = document.createElement('div');
                                item.className = 'molecule-item';
                                item.innerHTML = `
                                    <div class="molecule-name">${molecule.name}</div>
                                    <div class="molecule-formula">${molecule.formula}</div>
                                `;
                                item.addEventListener('click', () => loadMolecule(index));
                                categoryContent.appendChild(item);
                            }
                        });
                        
                        // Add click handler for category toggle
                        categoryHeader.addEventListener('click', () => {
                            const isCollapsed = categoryContent.classList.contains('collapsed');
                            categoryContent.classList.toggle('collapsed', !isCollapsed);
                            categoryHeader.classList.toggle('collapsed', !isCollapsed);
                        });
                        
                        categoriesContainer.appendChild(categoryHeader);
                        categoriesContainer.appendChild(categoryContent);
                    });
                };
                
                // Now reinitialize the app with our custom function
                if (typeof init === 'function') {
                    init();
                }
                
                // Expose necessary variables for export functionality
                setTimeout(() => {
                    // Give script.js time to create the scene and variables
                    if (typeof scene !== 'undefined') window.scene = scene;
                    if (typeof moleculeGroup !== 'undefined') window.moleculeGroup = moleculeGroup;
                    if (typeof camera !== 'undefined') window.camera = camera;
                    if (typeof renderer !== 'undefined') window.renderer = renderer;
                }, 1000);
            }
        }
        
        // Check if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                isDOMReady = true;
                checkAndInitialize();
            });
        } else {
            isDOMReady = true;
        }
        
        // Check when script.js is loaded
        window.addEventListener('load', function() {
            isScriptLoaded = true;
            checkAndInitialize();
        });

        // Chatbot Popup Functions
        function openChatbotPopup() {
            document.getElementById('chatbotPopup').style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
        
        function closeChatbotPopup() {
            document.getElementById('chatbotPopup').style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
        
        // Close popup when clicking outside of it
        window.onclick = function(event) {
            const popup = document.getElementById('chatbotPopup');
            if (event.target === popup) {
                closeChatbotPopup();
            }
        }
        
        // Handle Enter key in popup chat
        function handlePopupEnterKey(event) {
            if (event.key === 'Enter') {
                sendPopupMessage();
            }
        }
        
        // Send message in popup
        async function sendPopupMessage() {
            const input = document.getElementById('popupChatInput');
            const question = input.value.trim();
            
            if (!question) return;
            
            // Add user message to chat
            addPopupMessage('You', question, 'user');
            input.value = '';
            
            showPopupAILoading(true);
            
            try {
                const currentMolecule = getCurrentMolecule();
                const response = await fetch(`${AI_BASE_URL}/ask-ai`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        question: question,
                        current_molecule: currentMolecule ? `${currentMolecule.name} (${currentMolecule.formula})` : 'None'
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    addPopupMessage('AI Assistant', data.response, 'ai');
                } else {
                    addPopupMessage('AI Assistant', `Error: ${data.error}`, 'error');
                }
                
            } catch (error) {
                addPopupMessage('AI Assistant', 'Sorry, I couldn\'t connect to the AI service. Please make sure the Python backend is running.', 'error');
            }
            
            showPopupAILoading(false);
        }
        
        // Add message to popup chat
        function addPopupMessage(sender, message, type) {
            const messagesContainer = document.getElementById('popupChatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message';
            
            let senderColor = '#4a5d8a';
            let senderIcon = '👤';
            
            if (type === 'ai') {
                senderColor = '#667eea';
                senderIcon = '🤖';
            } else if (type === 'error') {
                senderColor = '#dc3545';
                senderIcon = '⚠️';
            }
            
            messageDiv.innerHTML = `
                <div class="chat-message-question" style="color: ${senderColor};">
                    ${senderIcon} ${sender}
                </div>
                <div class="chat-message-answer">${message}</div>
            `;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Show/hide popup AI loading
        function showPopupAILoading(show) {
            document.getElementById('popupAiLoading').style.display = show ? 'block' : 'none';
        }
        
        // Clear popup chat
        function clearPopupChat() {
            const messagesContainer = document.getElementById('popupChatMessages');
            messagesContainer.innerHTML = `
                <div style="text-align: center; color: #999; padding: 20px;">
                    Welcome to the AI Chemistry Assistant! Ask me anything about molecules, chemistry, or use the quick action buttons above.
                </div>
            `;
        }
        
        // Popup AI Functions
        async function popupExplainCurrentMolecule() {
            const molecule = getCurrentMolecule();
            if (!molecule) {
                addPopupMessage('System', 'Please select a molecule first!', 'error');
                return;
            }
            
            addPopupMessage('You', `Explain ${molecule.name}`, 'user');
            showPopupAILoading(true);
            
            try {
                const response = await fetch(`${AI_BASE_URL}/explain-molecule`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        molecule_name: molecule.name,
                        molecule_formula: molecule.formula
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    addPopupMessage('AI Assistant', data.explanation, 'ai');
                } else {
                    addPopupMessage('AI Assistant', `Error: ${data.error}`, 'error');
                }
                
            } catch (error) {
                addPopupMessage('AI Assistant', 'Sorry, I couldn\'t connect to the AI service.', 'error');
            }
            
            showPopupAILoading(false);
        }
        
        async function popupCompareMolecules() {
            const current = getCurrentMolecule();
            if (!current) {
                addPopupMessage('System', 'Please select a molecule first!', 'error');
                return;
            }
            
            const molecule2 = prompt(`Compare ${current.name} with which molecule?\n\nAvailable: Water, Methane, Ammonia, Carbon Dioxide, Ethanol, Benzene, and 20 more...`);
            if (!molecule2) return;
            
            addPopupMessage('You', `Compare ${current.name} with ${molecule2}`, 'user');
            showPopupAILoading(true);
            
            try {
                const response = await fetch(`${AI_BASE_URL}/compare-molecules`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        molecule1: current.name,
                        molecule2: molecule2
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    addPopupMessage('AI Assistant', data.comparison, 'ai');
                } else {
                    addPopupMessage('AI Assistant', `Error: ${data.error}`, 'error');
                }
                
            } catch (error) {
                addPopupMessage('AI Assistant', 'Sorry, I couldn\'t connect to the AI service.', 'error');
            }
            
            showPopupAILoading(false);
        }
        
        async function popupPredictProperties() {
            const formula = prompt('Enter a molecular formula to predict its properties (e.g., H2O, CH4, NH3):');
            if (!formula) return;
            
            addPopupMessage('You', `Predict properties of ${formula}`, 'user');
            showPopupAILoading(true);
            
            try {
                const response = await fetch(`${AI_BASE_URL}/predict-properties`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        formula: formula
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    addPopupMessage('AI Assistant', data.predictions, 'ai');
                } else {
                    addPopupMessage('AI Assistant', `Error: ${data.error}`, 'error');
                }
                
            } catch (error) {
                addPopupMessage('AI Assistant', 'Sorry, I couldn\'t connect to the AI service.', 'error');
            }
            
            showPopupAILoading(false);
        }

        // AI Integration Functions (keeping existing AI code)
        const AI_BASE_URL = 'http://localhost:5000/api';
        let currentMoleculeData = null;
        
        // Check AI service status on load
        checkAIStatus();
        
        async function checkAIStatus() {
            try {
                const response = await fetch(`${AI_BASE_URL}/health`);
                if (response.ok) {
                    document.getElementById('aiStatus').textContent = '● Online';
                    document.getElementById('aiStatus').style.color = '#22c55e';
                } else {
                    throw new Error('Service unavailable');
                }
            } catch (error) {
                document.getElementById('aiStatus').textContent = '● Offline';
                document.getElementById('aiStatus').style.color = '#ef4444';
                console.warn('AI service is not available. Please start the Python backend.');
            }
        }
        
        // Handle Enter key in chat input
        function handleEnterKey(event) {
            if (event.key === 'Enter') {
                askAI();
            }
        }
        
        // Ask AI a question
        async function askAI() {
            const input = document.getElementById('aiQuestionInput');
            const question = input.value.trim();
            
            if (!question) return;
            
            showAILoading(true);
            clearAIResponse();
            
            try {
                const currentMolecule = getCurrentMolecule();
                const response = await fetch(`${AI_BASE_URL}/ask-ai`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        question: question,
                        current_molecule: currentMolecule ? `${currentMolecule.name} (${currentMolecule.formula})` : 'None'
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAIResponse(data.response, question);
                } else {
                    showAIResponse(`Error: ${data.error}`, question);
                }
                
            } catch (error) {
                showAIResponse('Sorry, I couldn\'t connect to the AI service. Please make sure the Python backend is running.', question);
            }
            
            showAILoading(false);
            input.value = '';
        }
        
        // Explain current molecule
        async function explainCurrentMolecule() {
            const molecule = getCurrentMolecule();
            if (!molecule) {
                alert('Please select a molecule first!');
                return;
            }
            
            showAILoading(true);
            clearAIResponse();
            
            try {
                const response = await fetch(`${AI_BASE_URL}/explain-molecule`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        molecule_name: molecule.name,
                        molecule_formula: molecule.formula
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAIResponse(data.explanation, `Explain ${molecule.name}`);
                } else {
                    showAIResponse(`Error: ${data.error}`, `Explain ${molecule.name}`);
                }
                
            } catch (error) {
                showAIResponse('Sorry, I couldn\'t connect to the AI service.', `Explain ${molecule.name}`);
            }
            
            showAILoading(false);
        }
        
        // Compare molecules
        async function compareMolecules() {
            const current = getCurrentMolecule();
            if (!current) {
                alert('Please select a molecule first!');
                return;
            }
            
            const molecule2 = prompt(`Compare ${current.name} with which molecule?\\n\\nAvailable: Water, Methane, Ammonia, Carbon Dioxide, Ethanol, Benzene, and 20 more...`);
            if (!molecule2) return;
            
            showAILoading(true);
            clearAIResponse();
            
            try {
                const response = await fetch(`${AI_BASE_URL}/compare-molecules`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        molecule1: current.name,
                        molecule2: molecule2
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAIResponse(data.comparison, `Compare ${current.name} vs ${molecule2}`);
                } else {
                    showAIResponse(`Error: ${data.error}`, `Compare ${current.name} vs ${molecule2}`);
                }
                
            } catch (error) {
                showAIResponse('Sorry, I couldn\'t connect to the AI service.', `Compare ${current.name} vs ${molecule2}`);
            }
            
            showAILoading(false);
        }
        
        // Predict properties
        async function predictProperties() {
            const formula = prompt('Enter a molecular formula to predict its properties (e.g., H2O, CH4, NH3):');
            if (!formula) return;
            
            showAILoading(true);
            clearAIResponse();
            
            try {
                const response = await fetch(`${AI_BASE_URL}/predict-properties`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        formula: formula
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAIResponse(data.predictions, `Predict properties of ${formula}`);
                } else {
                    showAIResponse(`Error: ${data.error}`, `Predict properties of ${formula}`);
                }
                
            } catch (error) {
                showAIResponse('Sorry, I couldn\'t connect to the AI service.', `Predict properties of ${formula}`);
            }
            
            showAILoading(false);
        }
        
        // expose common variables (adjust names if your scene/model variables differ)
        if (typeof scene !== 'undefined') window.scene = scene;
        if (typeof camera !== 'undefined') window.camera = camera;
        if (typeof renderer !== 'undefined') window.renderer = renderer;
        // if your current molecule is stored in a group/variable, expose it too:
        // e.g. window.currentModel = moleculeGroup;

        function getExportObject() {
            // First, try to get the current molecule group from script.js
            if (typeof window.moleculeGroup !== 'undefined' && window.moleculeGroup) {
                return window.moleculeGroup;
            }
            
            // Try other common global names
            const candidates = [
                window.currentModel,
                window.modelGroup,
                window.molecule,
                window.mesh,
            ];
            
            for (const c of candidates) {
                if (c && (c.isObject3D || c.type)) return c;
            }
            
            // Fallback: search in the scene for molecule objects
            if (window.scene && window.scene.children) {
                // Look for Groups or Meshes that aren't lights or cameras
                const moleculeObjects = window.scene.children.filter(child => {
                    return child.type !== 'AmbientLight' && 
                           child.type !== 'DirectionalLight' && 
                           child.type !== 'PerspectiveCamera' &&
                           child.type !== 'OrthographicCamera' &&
                           (child.isMesh || child.isGroup || child.type === 'Group' || child.type === 'Mesh');
                });
                
                // Return the first molecule object found
                if (moleculeObjects.length > 0) {
                    return moleculeObjects[0];
                }
            }
            
            return null;
        }

        function downloadBlob(blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        }

        function exportToOBJ() {
            // Debug: log what's available
            console.log('Available objects:', {
                scene: window.scene,
                moleculeGroup: window.moleculeGroup,
                sceneChildren: window.scene ? window.scene.children : 'No scene'
            });
            
            const obj = getExportObject();
            if (!obj) {
                alert('No 3D model found to export. Please select a molecule first.');
                return;
            }
            // clone to avoid mutating scene
            const clone = obj.clone(true);
            const scaleInput = document.getElementById('exportScale');
            const scale = (scaleInput && parseFloat(scaleInput.value)) || 1;
            clone.scale.set(scale, scale, scale);

            // OBJExporter from examples should be loaded
            if (typeof THREE.OBJExporter === 'undefined' && typeof OBJExporter === 'undefined') {
                alert('OBJExporter not loaded.');
                return;
            }
            const exporter = (typeof THREE !== 'undefined' && THREE.OBJExporter) ? new THREE.OBJExporter() : new OBJExporter();
            const result = exporter.parse(clone);
            const blob = new Blob([result], { type: 'text/plain' });
            const nameBase = (document.getElementById('infoTitle')?.innerText || 'molecule').replace(/\s+/g, '_');
            downloadBlob(blob, `${nameBase}.obj`);
        }

        function exportToSTL() {
            // Debug: log what's available
            console.log('Available objects:', {
                scene: window.scene,
                moleculeGroup: window.moleculeGroup,
                sceneChildren: window.scene ? window.scene.children : 'No scene'
            });
            
            const obj = getExportObject();
            if (!obj) {
                alert('No 3D model found to export. Please select a molecule first.');
                return;
            }
            const clone = obj.clone(true);
            const scaleInput = document.getElementById('exportScale');
            const scale = (scaleInput && parseFloat(scaleInput.value)) || 1;
            clone.scale.set(scale, scale, scale);

            if (typeof THREE.STLExporter === 'undefined' && typeof STLExporter === 'undefined') {
                alert('STLExporter not loaded.');
                return;
            }
            const exporter = (typeof THREE !== 'undefined' && THREE.STLExporter) ? new THREE.STLExporter() : new STLExporter();
            // binary false produces ASCII STL, which is broadly compatible
            const result = exporter.parse(clone, { binary: false });
            const blob = (result instanceof ArrayBuffer) ? new Blob([result], { type: 'application/octet-stream' }) : new Blob([result], { type: 'text/plain' });
            const nameBase = (document.getElementById('infoTitle')?.innerText || 'molecule').replace(/\s+/g, '_');
            downloadBlob(blob, `${nameBase}.stl`);
        }

        // make functions accessible from HTML buttons
        window.exportToOBJ = exportToOBJ;
        window.exportToSTL = exportToSTL;
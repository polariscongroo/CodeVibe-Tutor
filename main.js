/**
 * CodeVibe Tutor is an educational AI-powered app that teaches JavaScript through natural conversation.
 * Users type English prompts like “Explain how to make a bouncing ball step by step” and receive:

 * a teaching explanation (Teach Mode)
 * a runnable JavaScript example (Code Mode)
 * an optional short quiz to test understanding
 */

// ============== //
// JQUERY LOADING //
// ============== //

if (typeof jQuery === 'undefined') {
    var script = document.createElement('script');
    script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    script.onload = function() {
        initialize();
    };
    document.head.appendChild(script);
} else {
    initialize();
}

// ======================= //
// CONFIGURATION OF MODELS //
// ======================= //

// Available models for benchmarking
const AVAILABLE_MODELS = {
    "gpt-4": {
        name: "GPT-4",
        provider: "openai", 
        url: "https://api.openai.com/v1/chat/completions",
        maxTokens: 8000,
        temperature: 0.7,
        costPer1kTokens: 0.03,
        description: "Most capable OpenAI model, excellent reasoning"
    },
    "claude-3-sonnet": {
        name: "Claude 3 Sonnet",
        provider: "anthropic",
        url: "https://api.anthropic.com/v1/messages",
        maxTokens: 4000,
        temperature: 0.7,
        costPer1kTokens: 0.003,
        description: "Balanced performance and speed from Anthropic"
    }
};

// Predefined spatial physics questions for benchmarking
const SPATIAL_PHYSICS_QUESTIONS = [
    {
        id: 1,
        question: "What is the escape velocity of an object from the surface of Mars?",
        difficulty: "intermediate",
        category: "orbital mechanics",
        expectedElements: ["gravitational constant", "Mars mass", "Mars radius", "11.2 km/s", "5.03 km/s"]
    },
    {
        id: 2,
        question: "How do you calculate a Hohmann transfer orbit between Earth and Mars?",
        difficulty: "advanced",
        category: "orbital mechanics",
        expectedElements: ["semi-major axis", "orbital periods", "transfer time", "delta-v", "aphelion", "perihelion"]
    },
    {
        id: 3,
        question: "Explain the Oberth effect and how it's used in space propulsion.",
        difficulty: "advanced",
        category: "propulsion",
        expectedElements: ["kinetic energy", "velocity", "thrust", "fuel efficiency", "gravitational potential"]
    },
    {
        id: 4,
        question: "What is the difference between apogee and perigee in an elliptical orbit?",
        difficulty: "basic",
        category: "orbital mechanics",
        expectedElements: ["apogee", "perigee", "farthest point", "closest point", "elliptical orbit"]
    },
    {
        id: 5,
        question: "How does ion propulsion work in space and what are its advantages?",
        difficulty: "intermediate",
        category: "propulsion",
        expectedElements: ["ionized particles", "electric field", "high specific impulse", "low thrust", "long duration"]
    },
    {
        id: 6,
        question: "Calculate the orbital period of a satellite at 400 km altitude above Earth.",
        difficulty: "intermediate",
        category: "orbital mechanics",
        expectedElements: ["Kepler's third law", "orbital period", "semi-major axis", "gravitational parameter", "92.5 minutes"]
    },
    {
        id: 7,
        question: "What causes tidal locking and how does it affect planetary moons?",
        difficulty: "intermediate",
        category: "celestial mechanics",
        expectedElements: ["tidal forces", "gravitational gradient", "synchronous rotation", "Moon", "libration"]
    },
    {
        id: 8,
        question: "Explain the concept of Lagrange points and their applications.",
        difficulty: "advanced",
        category: "celestial mechanics",
        expectedElements: ["L1", "L2", "L3", "L4", "L5", "gravitational balance", "James Webb Space Telescope"]
    }
];

// API keys and variables
var openaiApiKey = "";
var anthropicApiKey = "";
var currentModel = "gpt-4";
var currentPrompt = "";
var isBenchmarking = false;
var benchmarkResults = [];

// ============== //
// INITIALIZATION //
// ============== //

function initialize() {
    // Generate the main HTML interface
    generateInterface();
    updateKeyStatus();
    updateModelInfo();
    
    // Add Enter key support for question input
    $(document).ready(function() {
        setTimeout(function() {
            $('#question-input').on('keydown', function(event) {
                if (event.key === 'Enter' && event.ctrlKey) {
                    sendQuestion();
                }
            });
        }, 1000);
    });
}

// == //
// UI //
// == //

function generateInterface() {
    document.write(`
<div class="orion-container">
    <h1>ORION CROSS-CHECK AI</h1>

    <div class="info-section">
        <p>Multi-Model LLM Benchmarking for Spatial Physics</p>
    </div>

    <!-- API Key Configuration Section -->
    <div class="config-section">
        <h3>API Key Configuration</h3>
        <p>You need API keys to communicate with different model providers. This system will never store your keys.</p>
        <center>
        <div class="api-key-inputs">
            <div class="key-input-group">
                <label for="openai-key">OpenAI API Key:</label>
                <input type="password" id="openai-key" placeholder="sk-..." style="width: 300px;">
                <button onclick="setOpenAIKey()" class="btn-primary">Set OpenAI Key</button>
            </div>
            
            <div class="key-input-group">
                <label for="anthropic-key">Anthropic API Key:</label>
                <input type="password" id="anthropic-key" placeholder="sk-ant-..." style="width: 300px;">
                <button onclick="setAnthropicKey()" class="btn-primary">Set Anthropic Key</button>
            </div>
        </div>
        </center>
        
        <div id="key-status"></div>
    </div>

    <!-- Model Selection Section -->
    <div class="model-section">
        <h3>🤖 Model Selection</h3>
        <div class="model-selector">
            <label for="model-select">Choose a model to test:</label>
            <select id="model-select" onchange="changeModel()">
                ${Object.entries(AVAILABLE_MODELS).map(([key, model]) => 
                    `<option value="${key}">${model.name} - ${model.description}</option>`
                ).join('')}
            </select>
        </div>
        
        <div id="model-info">
            <h4>Model Information:</h4>
            <div id="model-details"></div>
        </div>
    </div>

    <!-- Question Input Section -->
    <div class="question-section">
        <h3>❓ Question Input</h3>
        <div class="question-input-container">
            <label for="question-input">Enter your spatial physics question:</label>
            <textarea id="question-input" placeholder="e.g., What is the escape velocity from Mars?" rows="3" style="width: 100%;"></textarea>
            <button onclick="sendQuestion()" class="btn-primary">Send Question</button>
        </div>
        
        <!-- Predefined Questions -->
        <div class="predefined-questions">
            <h4>📚 Predefined Spatial Physics Questions:</h4>
            <div class="question-grid">
                ${SPATIAL_PHYSICS_QUESTIONS.map(q => 
                    `<div class="question-card" onclick="loadQuestion(${q.id})">
                        <div class="question-text">${q.question}</div>
                        <div class="question-meta">
                            <span class="difficulty ${q.difficulty}">${q.difficulty}</span>
                            <span class="category">${q.category}</span>
                        </div>
                    </div>`
                ).join('')}
            </div>
        </div>
    </div>

    <!-- Response Display Section -->
    <div class="response-section">
        <h3>💬 Model Response</h3>
        <div id="response-container" class="response-box">
            <div id="response-content">Select a model and ask a question to see the response here.</div>
        </div>
        
        <!-- Response Analysis -->
        <div class="analysis-section">
            <h4>📊 Response Analysis</h4>
            <div id="analysis-content">
                <p>Response analysis will appear here after you ask a question.</p>
            </div>
        </div>
</div>

    <!-- Benchmarking Section -->
    <div class="benchmark-section">
        <h3>⚡ Multi-Model Benchmarking</h3>
        <p>Test the same question across multiple models simultaneously.</p>
        <button onclick="runBenchmark()" class="btn-secondary" id="benchmark-btn">Run Benchmark Test</button>
        
        <div id="benchmark-results" class="benchmark-results">
            <!-- Benchmark results will be displayed here -->
        </div>
</div>

    <!-- Warning Section -->
    <div class="warning-section">
        <p><strong>⚠️ Important:</strong> LLM responses may contain inaccuracies or "hallucinations". 
        Always verify critical information from reliable sources. 
        <a href="https://www.google.com/search?q=llm+hallucination" target="_blank">Learn more about LLM hallucinations</a>.</p>
    </div>
</div>

<style>

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    margin: 0;
    padding: 0;
    background-color: black;
    min-height: 100vh;
}

.orion-container {
    max-width: 1200px;
    color: white;
    background: black;
    margin: 0 auto;
    text-align: center;
    padding: 75px;
    font-family: Serif, Didone;
}

.config-section, .model-section, .question-section, .response-section, .benchmark-section {
    background: black;
    border: 0px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
}

.info-section {
    background: black;
    border: 0px solid #2196f3;
    border-radius: 8px;
    padding: 15px;
    margin: 20px 0;
}

.api-key-inputs {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
}

.key-input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.btn-primary, .btn-secondary {
    background: black;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 0px;
    cursor: pointer;
    font-size: 14px;
}

.btn-secondary {
    background: black;
}

.btn-primary:hover, .btn-secondary:hover {
    opacity: 0.8;
}

.model-selector {
    margin: 15px 0;
}

.model-selector select {
    width: 100%;
    padding: 8px;
    border: 0px solid #ccc;
    border-radius: 4px;
}

.question-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
    margin-top: 15px;
}

.question-card {
    background: black;
    border: 0px solid #ddd;
    border-radius: 6px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.2s;
}

.question-card:hover {
    border-color: black;
    box-shadow: 0 2px 4px rgba(0,123,255,0.1);
}

.question-meta {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.difficulty {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
}

.difficulty.basic { background: #d4edda; color: #155724; }
.difficulty.intermediate { background: #fff3cd; color: #856404; }
.difficulty.advanced { background: #f8d7da; color: #721c24; }

.category {
    background: black;
    color: #495057;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.response-box {
    background: black;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 20px;
    min-height: 200px;
    white-space: pre-wrap;
}

.benchmark-results {
    margin-top: 20px;
}

.benchmark-result {
    background: black;
    border: 0px solid #ddd;
    border-radius: 6px;
    padding: 15px;
    margin: 10px 0;
}

.warning-section {
    background: black;
    border: 0px solid #ffc107;
    border-radius: 8px;
    padding: 15px;
    margin: 20px 0;
}
</style>
`);
}

// ==== //
// CORE //
// ==== //

/**
 * Set the OpenAI API key
 */
function setOpenAIKey() {
    openaiApiKey = document.getElementById('openai-key').value.trim();
    updateKeyStatus();
}

/**
 * Set the Anthropic API key
 */
function setAnthropicKey() {
    anthropicApiKey = document.getElementById('anthropic-key').value.trim();
    updateKeyStatus();
}

/**
 * Update the API key status display
 */
function updateKeyStatus() {
    const status = document.getElementById('key-status');
    let statusHtml = '<div class="key-status">';
    
    if (openaiApiKey) {
        statusHtml += '<span style="color: white;">✅ OpenAI API key set</span><br>';
    } else {
        statusHtml += '<span style="color: red;">❌ OpenAI API key not set</span><br>';
    }
    
    if (anthropicApiKey) {
        statusHtml += '<span style="color: green;">✅ Anthropic API key set</span><br>';
    } else {
        statusHtml += '<span style="color: red;">❌ Anthropic API key not set</span><br>';
    }
    
    statusHtml += '</div>';
    status.innerHTML = statusHtml;
}

/**
 * Change the currently selected model
 */
function changeModel() {
    currentModel = document.getElementById('model-select').value;
    updateModelInfo();
}

/**
 * Update the model information display
 */
function updateModelInfo() {
    const model = AVAILABLE_MODELS[currentModel];
    const details = document.getElementById('model-details');
    
    details.innerHTML = `
        <p><strong>Provider:</strong> ${model.provider}</p>
        <p><strong>Max Tokens:</strong> ${model.maxTokens.toLocaleString()}</p>
        <p><strong>Cost per 1K tokens:</strong> $${model.costPer1kTokens}</p>
        <p><strong>Description:</strong> ${model.description}</p>
    `;
}

/**
 * Load a predefined question into the input field
 */
function loadQuestion(questionId) {
    const question = SPATIAL_PHYSICS_QUESTIONS.find(q => q.id === questionId);
    if (question) {
        document.getElementById('question-input').value = question.question;
    }
}

/**
 * Send a question to the selected model
 */
function sendQuestion() {
    const questionInput = document.getElementById('question-input');
    currentPrompt = questionInput.value.trim();
    
    if (!currentPrompt) {
        alert('Please enter a question first.');
        return;
    }
    
    const model = AVAILABLE_MODELS[currentModel];
    
    // Check if we have the required API key
    if (model.provider === 'openai' && !openaiApiKey) {
        alert('Please set your OpenAI API key first.');
        return;
    }
    
    if (model.provider === 'anthropic' && !anthropicApiKey) {
        alert('Please set your Anthropic API key first.');
        return;
    }
    
    // Show loading state
    document.getElementById('response-content').innerHTML = '🔄 Processing your question...';
    
    // Send the request based on the provider
    if (model.provider === 'openai') {
        sendToOpenAI();
    } else if (model.provider === 'anthropic') {
        sendToAnthropic();
    }
}

/**
 * Send request to OpenAI API
 */
function sendToOpenAI() {
    const model = AVAILABLE_MODELS[currentModel];
    
    const requestData = {
        model: currentModel,
        messages: [{
            role: "user",
            content: currentPrompt
        }],
        temperature: model.temperature,
        max_tokens: Math.min(model.maxTokens, 2000)
    };
    
    $.ajaxSetup({
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + openaiApiKey
        }
    });
    
    $.ajax({
        type: "POST",
        url: model.url,
        data: JSON.stringify(requestData),
        dataType: "json",
        success: function(data) {
            handleOpenAIResponse(data);
        },
        error: function(xhr, status, error) {
            handleError('OpenAI', xhr.responseText);
        }
    });
}

/**
 * Send request to Anthropic API
 */
function sendToAnthropic() {
    const model = AVAILABLE_MODELS[currentModel];
    
    const requestData = {
        model: currentModel,
        max_tokens: Math.min(model.maxTokens, 2000),
        messages: [{
            role: "user",
            content: currentPrompt
        }]
    };
    
    $.ajaxSetup({
        headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicApiKey,
            "anthropic-version": "2023-06-01"
        }
    });
    
    $.ajax({
        type: "POST",
        url: model.url,
        data: JSON.stringify(requestData),
        dataType: "json",
        success: function(data) {
            handleAnthropicResponse(data);
        },
        error: function(xhr, status, error) {
            handleError('Anthropic', xhr.responseText);
        }
    });
}

/**
 * Handle successful OpenAI response
 */
function handleOpenAIResponse(data) {
    const response = data.choices[0].message.content;
    document.getElementById('response-content').innerHTML = response;
    
    // Analyze the response
    analyzeResponse(response, currentModel);
}

/**
 * Handle successful Anthropic response
 */
function handleAnthropicResponse(data) {
    const response = data.content[0].text;
    document.getElementById('response-content').innerHTML = response;
    
    // Analyze the response
    analyzeResponse(response, currentModel);
}

/**
 * Handle API errors
 */
function handleError(provider, errorMessage) {
    let errorText = `❌ Error from ${provider} API: `;
    
    try {
        const error = JSON.parse(errorMessage);
        errorText += error.error?.message || errorMessage;
    } catch (e) {
        errorText += errorMessage;
    }
    
    document.getElementById('response-content').innerHTML = errorText;
    document.getElementById('analysis-content').innerHTML = '<p>Error occurred - no analysis available.</p>';
}

/**
 * Analyze the model's response for spatial physics content
 */
function analyzeResponse(response, modelName) {
    const analysis = document.getElementById('analysis-content');
    
    // Basic analysis metrics
    const wordCount = response.split(' ').length;
    const hasMath = /[0-9]+\.[0-9]+|[0-9]+ km\/s|[0-9]+ m\/s|velocity|acceleration|force|mass|gravity/i.test(response);
    const hasPhysicsTerms = /orbit|gravitational|propulsion|delta-v|thrust|specific impulse|escape velocity/i.test(response);
    
    let analysisHtml = `
        <div class="analysis-metrics">
            <h5>Response Analysis for ${AVAILABLE_MODELS[modelName].name}:</h5>
            <ul>
                <li><strong>Word Count:</strong> ${wordCount}</li>
                <li><strong>Contains Mathematical Content:</strong> ${hasMath ? '✅ Yes' : '❌ No'}</li>
                <li><strong>Contains Physics Terms:</strong> ${hasPhysicsTerms ? '✅ Yes' : '❌ No'}</li>
            </ul>
        </div>
    `;
    
    analysis.innerHTML = analysisHtml;
}

/**
 * Run benchmark test across multiple models
 */
function runBenchmark() {
    const questionInput = document.getElementById('question-input');
    const question = questionInput.value.trim();
    
    if (!question) {
        alert('Please enter a question first.');
        return;
    }
    
    // Check which models we can test
    const availableModels = Object.keys(AVAILABLE_MODELS).filter(modelKey => {
        const model = AVAILABLE_MODELS[modelKey];
        return (model.provider === 'openai' && openaiApiKey) || 
               (model.provider === 'anthropic' && anthropicApiKey);
    });
    
    if (availableModels.length === 0) {
        alert('Please set at least one API key to run benchmarks.');
        return;
    }
    
    const benchmarkBtn = document.getElementById('benchmark-btn');
    benchmarkBtn.disabled = true;
    benchmarkBtn.textContent = '🔄 Running Benchmark...';
    
    const resultsContainer = document.getElementById('benchmark-results');
    resultsContainer.innerHTML = '<h4>🔄 Running benchmark tests...</h4>';
    
    // Reset benchmark results
    benchmarkResults = [];
    
    // Run tests for each available model
    let completedTests = 0;
    const totalTests = availableModels.length;
    
    availableModels.forEach(modelKey => {
        const model = AVAILABLE_MODELS[modelKey];
        currentModel = modelKey;
        currentPrompt = question;
        
        if (model.provider === 'openai') {
            sendToOpenAIBenchmark(modelKey, () => {
                completedTests++;
                if (completedTests === totalTests) {
                    displayBenchmarkResults();
                    benchmarkBtn.disabled = false;
                    benchmarkBtn.textContent = 'Run Benchmark Test';
                }
            });
        } else if (model.provider === 'anthropic') {
            sendToAnthropicBenchmark(modelKey, () => {
                completedTests++;
                if (completedTests === totalTests) {
                    displayBenchmarkResults();
                    benchmarkBtn.disabled = false;
                    benchmarkBtn.textContent = 'Run Benchmark Test';
                }
            });
        }
    });
}

/**
 * Send benchmark request to OpenAI
 */
function sendToOpenAIBenchmark(modelKey, callback) {
    const model = AVAILABLE_MODELS[modelKey];
    
    const requestData = {
        model: modelKey,
        messages: [{
            role: "user",
            content: currentPrompt
        }],
        temperature: model.temperature,
        max_tokens: Math.min(model.maxTokens, 2000)
    };

$.ajaxSetup({
        headers: {
        "Content-Type": "application/json",
            "Authorization": "Bearer " + openaiApiKey
        }
    });
    
    $.ajax({
        type: "POST",
        url: model.url,
        data: JSON.stringify(requestData),
        dataType: "json",
        success: function(data) {
            const response = data.choices[0].message.content;
            benchmarkResults.push({
                model: modelKey,
                modelName: model.name,
                response: response,
                timestamp: new Date()
            });
            callback();
        },
        error: function(xhr, status, error) {
            benchmarkResults.push({
                model: modelKey,
                modelName: model.name,
                response: `Error: ${xhr.responseText}`,
                timestamp: new Date(),
                error: true
            });
            callback();
        }
    });
}

/**
 * Send benchmark request to Anthropic
 */
function sendToAnthropicBenchmark(modelKey, callback) {
    const model = AVAILABLE_MODELS[modelKey];
    
    const requestData = {
        model: modelKey,
        max_tokens: Math.min(model.maxTokens, 2000),
        messages: [{
            role: "user",
            content: currentPrompt
        }]
    };
    
    $.ajaxSetup({
        headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicApiKey,
            "anthropic-version": "2023-06-01"
        }
    });

 $.ajax({
    type: "POST",
        url: model.url,
        data: JSON.stringify(requestData),
    dataType: "json",
        success: function(data) {
            const response = data.content[0].text;
            benchmarkResults.push({
                model: modelKey,
                modelName: model.name,
                response: response,
                timestamp: new Date()
            });
            callback();
        },
        error: function(xhr, status, error) {
            benchmarkResults.push({
                model: modelKey,
                modelName: model.name,
                response: `Error: ${xhr.responseText}`,
                timestamp: new Date(),
                error: true
            });
            callback();
        }
    });
}

/**
 * Display benchmark results
 */
function displayBenchmarkResults() {
    const container = document.getElementById('benchmark-results');
    
    let html = '<h4>📊 Benchmark Results</h4>';
    
    benchmarkResults.forEach(result => {
        const wordCount = result.response.split(' ').length;
        const hasMath = /[0-9]+\.[0-9]+|[0-9]+ km\/s|[0-9]+ m\/s|velocity|acceleration|force|mass|gravity/i.test(result.response);
        const hasPhysicsTerms = /orbit|gravitational|propulsion|delta-v|thrust|specific impulse|escape velocity/i.test(result.response);
        
        html += `
            <div class="benchmark-result">
                <h5>${result.modelName} ${result.error ? '(Error)' : ''}</h5>
                <div class="response-preview">${result.response.substring(0, 200)}${result.response.length > 200 ? '...' : ''}</div>
                <div class="response-metrics">
                    <span>Words: ${wordCount}</span>
                    <span>Math: ${hasMath ? '✅' : '❌'}</span>
                    <span>Physics: ${hasPhysicsTerms ? '✅' : '❌'}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

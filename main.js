/**
 * CodeVibe Tutor is an educational AI-powered app that teaches JavaScript through natural conversation.
 * Users type English prompts like "Explain how to make a bouncing ball step by step" and receive:
 * - a teaching explanation (Teach Mode)
 * - a runnable JavaScript example (Code Mode)
 * - an optional short quiz to test understanding
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

// =================== //
// MODEL CONFIGURATION //
// =================== //

// 
const MODEL = {
    name: "gpt-3.5-turbo",
    url: "https://api.openai.com/v1/chat/completions",
    maxTokens: 4000,
    temperature: 0.7
};

// Global variables
var openaiApiKey = "";
var conversationHistory = [];
var currentMode = "teach"; // "teach" or "code"
var currentCode = ""; // Stores the latest generated code

// ============== //
// INITIALIZATION //
// ============== //

function initialize() {
    // Generate the main HTML interface
    generateInterface();
    updateKeyStatus();
    
    // Add Enter key support for prompt input (Ctrl+Enter to send)
    $(document).ready(function() {
        setTimeout(function() {
            $('#prompt-input').on('keydown', function(event) {
                if (event.key === 'Enter' && event.ctrlKey) {
                    sendPrompt();
                }
            });
        }, 1000);
    });
}

// ============= //
// UI GENERATION //
// ============= //

function generateInterface() {
    document.write(`
<div class="codevibe-container">
    <!-- Header -->
    <div class="header">
        <h1>CodeVibe Tutor</h1>
    </div>

    <!-- API Key Setup -->
    <div class="api-setup" id="api-setup">
        <div class="api-setup-content">
            <input type="password" id="openai-key" placeholder="Enter your OpenAI API Key">
            <button onclick="setOpenAIKey()" class="btn-set">Set Key</button>
        </div>
        <div id="key-status"></div>
    </div>

    <!-- Conversation Area -->
    <div class="conversation-area" id="conversation-area">
        <div id="messages-container"></div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
        <div class="mode-selector">
            <button onclick="setMode('teach')" id="btn-teach" class="btn-mode active">Teach</button>
            <button onclick="setMode('code')" id="btn-code" class="btn-mode">Code</button>
            <button onclick="runCode()" id="btn-run-code" class="btn-run-code" style="display: none;">
                ▶ Run Code
            </button>
        </div>
        <div class="input-wrapper">
            <textarea id="prompt-input" placeholder="Message CodeVibe Tutor..." rows="1"></textarea>
            <button onclick="sendPrompt()" class="btn-send">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    </div>

    <!-- Code Execution Modal (hidden by default) -->
    <div id="code-modal" class="code-modal" style="display: none;">
        <div class="code-modal-content">
            <div class="code-modal-header">
                <h3>Code Preview</h3>
                <button onclick="closeCodeModal()" class="btn-close">×</button>
            </div>
            <iframe id="code-iframe" sandbox="allow-scripts"></iframe>
        </div>
    </div>
</div>

<!-- CSS -->

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    height: 100%;
    background: #ffffff;
    color: #000000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.codevibe-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 800px;
    margin: 0 auto;
}

/* Header */
.header {
    padding: 20px;
    border-bottom: 1px solid #e5e5e5;
    text-align: center;
}

.header h1 {
    font-size: 1.5em;
    font-weight: 600;
    color: #000;
}

/* API Setup */
.api-setup {
    padding: 15px 20px;
    background: #f7f7f7;
    border-bottom: 1px solid #e5e5e5;
}

.api-setup-content {
    display: flex;
    gap: 10px;
    max-width: 600px;
    margin: 0 auto;
}

#openai-key {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    font-size: 14px;
    background: #fff;
}

.btn-set {
    padding: 10px 20px;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
}

.btn-set:hover {
    background: #333;
}

#key-status {
    margin-top: 10px;
    text-align: center;
    font-size: 13px;
}

/* Conversation Area */
.conversation-area {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

#messages-container {
    max-width: 700px;
    margin: 0 auto;
}

.message {
    margin-bottom: 30px;
    line-height: 1.6;
}

.message.user {
    color: #000;
    font-weight: 500;
}

.message.assistant {
    color: #374151;
}

.message-label {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #666;
}

.message-content {
    white-space: pre-wrap;
}

.message.assistant .message-content {
    padding: 15px;
    background: #f7f7f7;
    border-radius: 8px;
}

/* Input Area */
.input-area {
    border-top: 1px solid #e5e5e5;
    padding: 20px;
    background: #fff;
}

.mode-selector {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    justify-content: center;
}

.btn-mode {
    padding: 6px 16px;
    background: #fff;
    color: #666;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
}

.btn-mode:hover {
    background: #f7f7f7;
}

.btn-mode.active {
    background: #000;
    color: #fff;
    border-color: #000;
}

.btn-run-code {
    padding: 6px 16px;
    background: #10b981;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
    margin-left: auto;
}

.btn-run-code:hover {
    background: #059669;
}

.input-wrapper {
    display: flex;
    gap: 10px;
    max-width: 700px;
    margin: 0 auto;
    align-items: flex-end;
}

#prompt-input {
    flex: 1;
    padding: 12px 15px;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    font-size: 15px;
    font-family: inherit;
    resize: none;
    max-height: 200px;
    overflow-y: auto;
}

#prompt-input:focus {
    outline: none;
    border-color: #000;
}

.btn-send {
    padding: 10px;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
}

.btn-send:hover {
    background: #333;
}

.btn-send:disabled {
    background: #ccc;
    cursor: not-allowed;
}

/* Code Modal */
.code-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.code-modal-content {
    background: #fff;
    width: 90%;
    max-width: 1000px;
    height: 80%;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
}

.code-modal-header {
    padding: 20px;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.code-modal-header h3 {
    font-size: 1.2em;
    font-weight: 600;
}

.btn-close {
    background: none;
    border: none;
    font-size: 30px;
    cursor: pointer;
    color: #666;
    line-height: 1;
    padding: 0;
    width: 30px;
    height: 30px;
}

.btn-close:hover {
    color: #000;
}

#code-iframe {
    flex: 1;
    border: none;
    background: #fff;
}

.loading {
    color: #666;
}
</style>
`);
}

// ================== //
// API KEY MANAGEMENT //
// ================== //

/**
 * Set the OpenAI API key
 */
function setOpenAIKey() {
    openaiApiKey = document.getElementById('openai-key').value.trim();
    updateKeyStatus();
}

/**
 * Update the API key status display
 */
function updateKeyStatus() {
    const status = document.getElementById('key-status');
    if (openaiApiKey) {
        status.innerHTML = '<span style="color: #4caf50;">API key configured</span>';
        // Hide the API setup section after key is set
        document.getElementById('api-setup').style.display = 'none';
    } else {
        status.innerHTML = '<span style="color: #999;">Enter your OpenAI API key to start</span>';
    }
}

// ==== //
// MODE //
// ==== //

/**
 * Set the current mode (teach or code)
 */
function setMode(mode) {
    currentMode = mode;
    
    // Update button states
    document.getElementById('btn-teach').classList.remove('active');
    document.getElementById('btn-code').classList.remove('active');
    
    if (mode === 'teach') {
        document.getElementById('btn-teach').classList.add('active');
    } else {
        document.getElementById('btn-code').classList.add('active');
    }
}

// ============ //
// CONVERSATION //
// ============ //

/**
 * Add a message to the conversation display
 */
function addMessage(role, content) {
    const container = document.getElementById('messages-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = role === 'user' ? 'You' : 'CodeVibe Tutor';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(label);
    messageDiv.appendChild(contentDiv);
    
    // Always check for code in assistant messages (regardless of mode)
    if (role === 'assistant') {
        const codeBlockRegex = /```(?:html|javascript|js)?\n([\s\S]*?)```/g;
        const matches = [...content.matchAll(codeBlockRegex)];
        
        if (matches.length > 0) {
            // Update the code in memory
            currentCode = matches[0][1];
            // Show the Run Code button
            updateRunCodeButton();
        }
    }
    
    container.appendChild(messageDiv);
    
    // Scroll to bottom
    const conversationArea = document.getElementById('conversation-area');
    conversationArea.scrollTop = conversationArea.scrollHeight;
}

/**
 * Update the Run Code button visibility
 */
function updateRunCodeButton() {
    const runBtn = document.getElementById('btn-run-code');
    if (currentCode) {
        runBtn.style.display = 'block';
    } else {
        runBtn.style.display = 'none';
    }
}

/**
 * Show loading indicator
 */
function showLoading() {
    const container = document.getElementById('messages-container');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant loading';
    loadingDiv.id = 'loading-message';
    loadingDiv.innerHTML = '<div class="message-label">CodeVibe Tutor</div><div class="message-content">Thinking...</div>';
    container.appendChild(loadingDiv);
    
    const conversationArea = document.getElementById('conversation-area');
    conversationArea.scrollTop = conversationArea.scrollHeight;
}

/**
 * Remove loading indicator
 */
function removeLoading() {
    const loading = document.getElementById('loading-message');
    if (loading) {
        loading.remove();
    }
}

// ================== //
// AI PROMPT HANDLING //
// ================== //

/**
 * Send a prompt to the AI
 */
function sendPrompt() {
    const promptInput = document.getElementById('prompt-input');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        return;
    }
    
    // Check if we have the API key
    if (!openaiApiKey) {
        alert('Please set your OpenAI API key first.');
        return;
    }
    
    // Add user message to display
    addMessage('user', prompt);
    
    // Clear input
    promptInput.value = '';
    promptInput.style.height = 'auto';
    
    // Show loading
    showLoading();
    
    // Build the full prompt with mode context
    const systemPrompt = buildSystemPrompt();
    const fullPrompt = buildFullPrompt(prompt);
    
    // Send to OpenAI
    sendToOpenAI(systemPrompt, fullPrompt, prompt);
}

/**
 * Build system prompt based on current mode
 */
function buildSystemPrompt() {
    if (currentMode === 'teach') {
        return `You are CodeVibe Tutor, a friendly JavaScript teacher. 
Explain programming concepts step-by-step in a clear, educational way. 
Use simple language and provide examples when helpful. 
Focus on helping the user understand the concepts deeply.`;
    } else {
        return `You are CodeVibe Tutor, a JavaScript code generator. 
Generate clean, runnable JavaScript code based on the user's request. 
Include comments to explain the code. 
If the code uses canvas or DOM, make it self-contained and ready to run in an HTML page.
Always wrap your code in a proper structure with HTML if needed.`;
    }
}

/**
 * Build full prompt with conversation history
 */
function buildFullPrompt(userPrompt) {
    let contextPrompt = '';
    
    // Add recent conversation history (last 3 exchanges)
    const recentHistory = conversationHistory.slice(-3);
    if (recentHistory.length > 0) {
        contextPrompt += 'Previous conversation:\n';
        recentHistory.forEach(item => {
            contextPrompt += `User: ${item.prompt}\nAssistant: ${item.response}\n\n`;
        });
    }
    
    contextPrompt += `User: ${userPrompt}`;
    return contextPrompt;
}

// ========= //
// API CALLS //
// ========= //

/**
 * Send request to OpenAI API
 */
function sendToOpenAI(systemPrompt, userPrompt, originalPrompt) {
    const requestData = {
        model: MODEL.name,
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userPrompt
            }
        ],
        temperature: MODEL.temperature,
        max_tokens: 2000
    };
    
    $.ajaxSetup({
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + openaiApiKey
        }
    });
    
    $.ajax({
        type: "POST",
        url: MODEL.url,
        data: JSON.stringify(requestData),
        dataType: "json",
        success: function(data) {
            removeLoading();
            const response = data.choices[0].message.content;
            
            // Add to conversation history
            conversationHistory.push({
                prompt: originalPrompt,
                response: response,
                mode: currentMode,
                timestamp: new Date()
            });
            
            // Display response
            addMessage('assistant', response);
        },
        error: function(xhr, status, error) {
            removeLoading();
            handleError(xhr.responseText);
        }
    });
}

/**
 * Run the code stored in memory in an iframe modal
 */
function runCode() {
    if (!currentCode) {
        alert('No code to execute. Generate some code first!');
        return;
    }
    
    const modal = document.getElementById('code-modal');
    const iframe = document.getElementById('code-iframe');
    
    // Show modal
    modal.style.display = 'flex';
    
    // Write code to iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(currentCode);
    iframeDoc.close();
}

/**
 * Close the code execution modal
 */
function closeCodeModal() {
    document.getElementById('code-modal').style.display = 'none';
}

/**
 * Handle API errors
 */
function handleError(errorMessage) {
    let errorText = 'Sorry, there was an error:\n\n';
    
    try {
        const error = JSON.parse(errorMessage);
        errorText += error.error?.message || errorMessage;
    } catch (e) {
        errorText += errorMessage;
    }
    
    addMessage('assistant', errorText);
}

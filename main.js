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

const MODEL = {
    name: "llama-3.3-70b-versatile",
    url: "https://api.groq.com/openai/v1/chat/completions",
        maxTokens: 4000,
    temperature: 0.7
};

// Global variables
var apiKey = "";
var conversationHistory = [];
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
        <p>Get a free API key at <a href="https://console.groq.com" target="_blank">console.groq.com</a></p>
        <div class="input-group">
            <input type="password" id="api-key" placeholder="Enter your Groq API key...">
            <button onclick="setAPIKey()">Set Key</button>
        </div>
    </div>

    <!-- Conversation Area -->
    <div class="conversation-area" id="conversation-area">
        <div id="messages-container"></div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
        <div class="mode-selector">
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
            <iframe id="code-iframe" sandbox="allow-scripts allow-same-origin allow-forms allow-modals"></iframe>
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
    padding: 20px;
    background: #f7f7f7;
    border-bottom: 1px solid #e5e5e5;
    text-align: center;
}

.api-setup p {
    margin-bottom: 15px;
    font-size: 13px;
    color: #666;
}

.api-setup a {
    color: #000;
    text-decoration: underline;
}

.input-group {
    display: flex;
    gap: 10px;
    max-width: 500px;
    margin: 0 auto;
}

#api-key {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    font-size: 14px;
}

#api-key:focus {
    outline: none;
    border-color: #000;
}

.input-group button {
    padding: 10px 20px;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.input-group button:hover {
    background: #333;
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
}

.message-label {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #666;
}

.message-content {
    white-space: pre-wrap;
    line-height: 1.6;
}

.message.assistant .message-content {
    padding: 15px;
    background: #f7f7f7;
    border-radius: 6px;
}

/* Input Area */
.input-area {
    border-top: 1px solid #e5e5e5;
    padding: 20px;
    background: #fff;
}

.mode-selector {
    display: flex;
    margin-bottom: 12px;
    justify-content: flex-end;
}

.btn-run-code {
    padding: 8px 20px;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.btn-run-code:hover {
    background: #333;
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
    border-radius: 6px;
    font-size: 15px;
    font-family: inherit;
    resize: none;
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
    border-radius: 6px;
    cursor: pointer;
    width: 40px;
    height: 40px;
}

.btn-send:hover {
    background: #333;
}

/* Code Modal */
.code-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
}

.code-modal-content {
    background: #fff;
    width: 90%;
    max-width: 1000px;
    height: 80%;
    margin: 5% auto;
    display: flex;
    flex-direction: column;
}

.code-modal-header {
    padding: 20px;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    justify-content: space-between;
}

.btn-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
}

.btn-close:hover {
    color: #000;
}

#code-iframe {
    flex: 1;
    border: none;
}
</style>
`);
}

// ================== //
// API KEY MANAGEMENT //
// ================== //

/**
 * Set the API key
 */
function setAPIKey() {
    apiKey = document.getElementById('api-key').value.trim();
    updateKeyStatus();
}

/**
 * Update the API key status display
 */
function updateKeyStatus() {
    if (apiKey) {
        document.getElementById('api-setup').style.display = 'none';
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
    if (!apiKey) {
        alert('Please set your Groq API key first. Get one free at console.groq.com');
        return;
    }
    
    // Add user message to display
    addMessage('user', prompt);
    
    // Clear input
    promptInput.value = '';
    
    // Show loading
    showLoading();
    
    // Build the full prompt with mode context
    const systemPrompt = buildSystemPrompt();
    const fullPrompt = buildFullPrompt(prompt);
    
    // Send to Groq
    sendToGroq(systemPrompt, fullPrompt, prompt);
}

/**
 * Build system prompt
 */
function buildSystemPrompt() {
    return `You are CodeVibe Tutor, a friendly JavaScript teacher and code assistant.

When the user asks for explanations, explain programming concepts step-by-step in a clear way.
When the user asks for code, generate clean, runnable JavaScript/HTML code.

If you provide code:
- Wrap it in markdown code blocks with \`\`\`html or \`\`\`javascript
- Make it self-contained and ready to run
- Include helpful comments
- If using canvas or DOM, provide a complete HTML page

Be conversational, helpful, and adapt to what the user needs.`;
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
 * Send request to Groq API
 */
function sendToGroq(systemPrompt, userPrompt, originalPrompt) {
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
        max_tokens: MODEL.maxTokens
    };
    
    $.ajaxSetup({
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + apiKey
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
    
    // Clear previous content by recreating the iframe
    const newIframe = document.createElement('iframe');
    newIframe.id = 'code-iframe';
    newIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals');
    iframe.parentNode.replaceChild(newIframe, iframe);
    
    // Show modal
    modal.style.display = 'block';
    
    // Wait a bit for iframe to be ready, then write code
    setTimeout(() => {
        try {
            const iframeDoc = newIframe.contentDocument || newIframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(currentCode);
            iframeDoc.close();
        } catch (error) {
            alert('Error executing code: ' + error.message);
        }
    }, 100);
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
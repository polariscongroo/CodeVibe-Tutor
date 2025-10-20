# CodeVibe Tutor
Learn to code through conversation. CodeVibe Tutor turns your English prompts into clear explanations and runnable JavaScript examples.

## 🎯 Concept
**CodeVibe Tutor** is an educational AI-powered app that teaches JavaScript through natural conversation.  
Users type English prompts like _“Explain how to make a bouncing ball step by step”_ and receive:
- a **teaching explanation** (Teach Mode)
- a **runnable JavaScript example** (Code Mode)
- an optional short quiz to **test understanding**

The app runs as a JavaScript World on **Ancient Brain**, allowing immediate execution of generated examples.

## 💻 Features
- **Teach Mode** – The AI explains programming concepts step-by-step.
- **Code Mode** – The AI generates runnable JavaScript snippets.
- **Run Example** – Execute the generated code in an isolated iframe.
- **Conversation History** – Context is kept and reused for follow-ups.
- **Versioning** – Save and restore code examples using `AB.saveData()`.
- **Test My Understanding** – Optional quiz generation by the AI.

## ⚙️ Technical Overview
- **Platform:** Ancient Brain (JavaScript World)
- **Languages:** JavaScript, HTML (embedded via iframe), CSS
- **AI API:** Replace the stub `callAIAPI` with your preferred API (OpenAI, Hugging Face, AI21, etc.)
- **Storage:** `AB.saveData()` for conversation and saved examples

## 🧩 Core Flow
1. User selects **Teach** or **Code** mode.  
2. User sends an English prompt.  
3. The app builds a structured prompt including conversation history and mode.
4. The AI returns text (explanation and/or code).  
5. The app displays the explanation and, if present, extracts & executes code in an iframe.  
6. User can save the example, refine it, or ask the AI to quiz them.

## 🚀 How to run (developer)
1. Open Ancient Brain and create a new World.  
2. Paste `vibe_sensei_world.js` into the World editor.  
3. Replace the `callAIAPI` stub with a real API implementation and API key handling.  
4. Test with prompts like:
   - “Explain how to draw a bouncing ball with gravity”
   - “Generate a simple Pong game using canvas”
   - “Quiz me about the bouncing ball code”

## 🧪 Example prompts
- “Explain how to make a bouncing ball step by step.”
- “Write runnable JavaScript code that draws a bouncing ball on canvas.”
- “Make the ball red and faster, and add collision sound.”

## 📚 Extensions (ideas)
- Multi-language explanations (EN)
- Two-AI pipeline: generator + sceptic/debugger
- Challenge Mode: AI creates small exercises and evaluates answers
- Share / Gallery of saved generated examples

## 👨‍💻 Author
**Chadi — Télécom SudParis & Dublin City University**
**Nathan — Télécom SudParis & Dublin City University**

Advanced Algorithms & AI Search (CSC1047) — Practical Project (2025)

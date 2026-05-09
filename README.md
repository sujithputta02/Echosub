# 🎬 EchoSub

**Understand every word. Feel every scene.**  
EchoSub is a next-generation browser extension that transforms your streaming experience with interactive, AI-powered subtitles. Designed for language learners and cinephiles alike, it brings context, clarity, and intelligence to every frame.

---

## ✨ Key Features

- **🧠 Contextual AI Explanations**: Stuck on a complex line or a cultural reference? Click "Explain Line" to get a concise, AI-generated breakdown of the context.
- **🖱️ Click-to-Define**: Every word in the subtitle is interactive. Click any word to instantly see its meaning, pronunciation (coming soon), and usage examples.
- **🪄 Text Simplification**: Turn complex dialogue into easy-to-understand English with one click. Perfect for language learners.
- **🎙️ Voice Overlays**: Enable AI-driven Text-to-Speech (TTS) to hear the dialogue clearly over the original audio.
- **🌍 Multi-Language Support**: Choose from a wide range of voice languages including Hindi, Telugu, Tamil, Malayalam, Spanish, French, Japanese, and more for the Voice Overlay.
- **📺 Universal Compatibility**: Works seamlessly on **YouTube**, **Netflix**, and most web-based video players.
- **⚡ Performance Modes**: Toggle between Low Power, Balanced AI, and High Context modes to suit your hardware and learning needs.
- **📏 Customizable Overlay**: Adjust subtitle size and position to fit your screen and preferences.
- **🎨 Premium UI**: A beautiful, blurred glassmorphism overlay that replaces clunky native subtitles with a modern, responsive interface.
- **🛡️ Local-First Privacy**: Powered by your own local AI engine (Ollama), ensuring your data stays on your machine.

---

## 🛠️ Architecture

EchoSub consists of two main components:
1.  **Browser Extension**: The frontend that injects the interactive overlay and captures subtitles.
2.  **AI Bridge (Backend)**: A local Node.js server that connects the extension to your local LLM (Ollama).

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Ollama**: Download and install from [ollama.com](https://ollama.com).
  - Once installed, pull the Llama 3 model:
    ```bash
    ollama pull llama3
    ```

### 2. Setup the AI Bridge
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the bridge
npm start
```
The bridge will run at `http://localhost:3000`.

### 3. Install the Extension
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer mode** (top right toggle).
3.  Click **Load unpacked**.
4.  Select the root folder of the EchoSub project.

---

## 🛠️ Tech Stack

- **Frontend**: JavaScript (ES6+), Shadow DOM, CSS3 (Glassmorphism), Chrome Extension API.
- **Backend**: Node.js, Express.js.
- **AI Engine**: Ollama (Llama 3).
- **Styling**: Vanilla CSS with a focus on modern typography (Inter).

---

## 🗺️ Roadmap

- [ ] **Coqui TTS Integration**: High-quality, local neural text-to-speech.
- [ ] **Multi-Language Support**: Real-time translation and explanation for non-English content.
- [ ] **Word Bank**: Save clicked words to a personal vocabulary list for later review.
- [ ] **Mobile Support**: Extending the experience to mobile browsers.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help make EchoSub the ultimate companion for video content.

---

## ⚖️ License

MIT License. See `LICENSE` for details.

---
*Created with ❤️ for the global learner.*

// src/content/universal.js

class UniversalEchoSub {
  constructor() {
    this.shadow = null;
    this.subtitleBox = null;
    this.explainBtn = null;
    this.currentText = "";
    this.settings = { enableSubtitles: true, simplifiedMode: false, perfMode: 'balanced', enableVoice: false, voiceVolume: 0.5 };
    
    this.init();
  }

  init() {
    console.log("EchoSub: Initializing Universal Observer...");
    this.injectOverlay();
    this.startDetection();
  }

  injectOverlay() {
    const target = document.body;
    const host = document.createElement('div');
    host.id = 'echosub-host';
    host.style.cssText = 'position: fixed; width: 100vw; height: 100vh; top: 0; left: 0; pointer-events: none; z-index: 2147483647;';
    
    const shadow = host.attachShadow({ mode: 'open' });
    
    const style = document.createElement('style');
    style.textContent = `
      #echosub-overlay-container {
        position: absolute;
        bottom: 15%;
        left: 50%;
        transform: translateX(-50%) scale(var(--echosub-scale, 1.0));
        width: 85%;
        pointer-events: none;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        transition: bottom 0.5s ease;
      }
      #echosub-overlay-container.is-fullscreen {
        bottom: 5%;
      }
      .echosub-subtitle-box {
        display: none;
        padding: 14px 28px;
        background: rgba(10, 10, 10, 0.75);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
        color: #ffffff;
        font-size: clamp(20px, 4vw, 32px);
        line-height: 1.5;
        pointer-events: auto;
        user-select: none;
        transition: all 0.3s ease;
      }
      .echosub-word {
        display: inline-block;
        cursor: pointer;
        padding: 0 4px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }
      .echosub-word:hover {
        background: rgba(255, 255, 255, 0.1);
        border-bottom: 2px solid #3b82f6;
        transform: translateY(-2px);
      }
      .echosub-action-btn {
        display: none;
        padding: 8px 16px;
        background: rgba(59, 130, 246, 0.2);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 20px;
        color: #60a5fa;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        pointer-events: auto;
        transition: all 0.2s ease;
        font-family: inherit;
      }
      .echosub-action-btn:hover {
        background: rgba(59, 130, 246, 0.4);
        transform: scale(1.05);
      }
      .echosub-controls {
        display: none;
        margin-top: 8px;
        background: rgba(15, 23, 42, 0.8);
        padding: 5px 12px;
        border-radius: 20px;
        gap: 12px;
        pointer-events: auto;
        border: 1px solid rgba(255,255,255,0.1);
      }
      #echosub-overlay-container:hover .echosub-controls {
        display: flex;
      }
      .echosub-ctrl-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: color 0.2s;
        text-transform: uppercase;
      }
      .echosub-ctrl-btn:hover { color: #3b82f6; }
      .echosub-popup {
        position: absolute;
        padding: 24px;
        background: rgba(15, 23, 42, 0.98);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        width: 300px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        z-index: 2147483647;
        color: #f1f5f9;
        font-family: inherit;
        pointer-events: auto;
        animation: popUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes popUp {
        from { opacity: 0; transform: translateY(15px) scale(0.9); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .echosub-popup-word { font-size: 24px; font-weight: 800; color: #3b82f6; margin-bottom: 6px; }
      .echosub-popup-meaning { font-size: 15px; line-height: 1.6; margin-bottom: 14px; color: #cbd5e1; }
      .echosub-popup-example { font-size: 14px; font-style: italic; color: #94a3b8; padding-left: 12px; border-left: 4px solid #3b82f6; }
      .echosub-close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
        padding: 5px;
        line-height: 1;
        transition: color 0.2s;
      }
      .echosub-close-btn:hover { color: #f1f5f9; }
    `;
    shadow.appendChild(style);

    const container = document.createElement('div');
    container.id = 'echosub-overlay-container';
    
    const box = document.createElement('div');
    box.className = 'echosub-subtitle-box';
    
    const explainBtn = document.createElement('button');
    explainBtn.className = 'echosub-action-btn';
    explainBtn.innerText = '✨ Explain Line';
    explainBtn.onclick = (e) => {
      e.stopPropagation();
      this.handleExplainRequest();
    };

    const controls = document.createElement('div');
    controls.className = 'echosub-controls';
    
    const powerBtn = this.createControlBtn('⏻ Off', () => {
      host.style.display = 'none';
      this.settings.enableSubtitles = false;
    });

    const replayBtn = this.createControlBtn('↺ Replay', () => this.replayLast());
    const slowBtn = this.createControlBtn('0.75x', () => this.setPlaybackSpeed(0.75));
    const normalBtn = this.createControlBtn('1x', () => this.setPlaybackSpeed(1));
    
    controls.appendChild(powerBtn);
    controls.appendChild(replayBtn);
    controls.appendChild(slowBtn);
    controls.appendChild(normalBtn);
    
    container.appendChild(box);
    container.appendChild(explainBtn);
    container.appendChild(controls);
    shadow.appendChild(container);
    target.appendChild(host);
    
    this.shadow = shadow;
    this.subtitleBox = box;
    this.explainBtn = explainBtn;
    this.controls = controls;

    // Settings Sync
    chrome.storage.sync.get(['enableSubtitles', 'simplifiedMode', 'perfMode', 'enableVoice', 'voiceVolume'], (data) => {
      this.settings = { ...this.settings, ...data };
    });

    // Listen for settings updates
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "SETTINGS_UPDATE") {
        this.settings = { ...this.settings, ...msg.settings };
        if (this.currentText) this.updateSubtitles(this.currentText);
      }
    });
  }

  createControlBtn(text, onclick) {
    const btn = document.createElement('button');
    btn.className = 'echosub-ctrl-btn';
    btn.innerText = text;
    btn.onclick = (e) => { e.stopPropagation(); onclick(); };
    return btn;
  }

  replayLast() {
    const video = document.querySelector('video');
    if (video) video.currentTime -= 5;
  }

  setPlaybackSpeed(speed) {
    const video = document.querySelector('video');
    if (video) video.playbackRate = speed;
  }

  startDetection() {
    const hostname = window.location.hostname;
    
    // Aggressively hide native subtitles (Kill Switch)
    const hideNative = () => {
      const nativeSubs = [
        '.ytp-caption-window-container', // YouTube
        '.player-timedtext',             // Netflix
        '.vjs-text-track-display',       // Video.js
        '.jw-captions'                   // JW Player
      ];
      nativeSubs.forEach(selector => {
        const el = document.querySelector(selector);
        if (el && this.settings.enableSubtitles) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.style.visibility = 'hidden';
        } else if (el) {
          el.style.opacity = '1';
          el.style.visibility = 'visible';
        }
      });
    };
    setInterval(hideNative, 500);

    if (hostname.includes('youtube.com')) {
      this.initYouTube();
    } else if (hostname.includes('netflix.com')) {
      this.initNetflix();
    } else {
      this.initGeneric();
    }
  }

  // --- Platform Specifics ---
  initYouTube() {
    const observer = new MutationObserver(() => {
      const container = document.querySelector('.ytp-caption-window-container');
      if (container) this.observeSubtitlesDOM(container, '.ytp-caption-segment');
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  initNetflix() {
    const observer = new MutationObserver(() => {
      const container = document.querySelector('.player-timedtext');
      if (container) this.observeSubtitlesDOM(container, '.player-timedtext-text-container span');
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  initGeneric() {
    const checkVideos = () => {
      document.querySelectorAll('video').forEach(video => {
        if (!video.dataset.echosubObserved) {
          video.dataset.echosubObserved = 'true';
          this.observeVideoTracks(video);
        }
      });
    };
    setInterval(checkVideos, 2000);

    const commonSelectors = ['.vjs-text-track-display', '.jw-captions', '.mejs-captions-container'];
    const observer = new MutationObserver(() => {
      commonSelectors.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) this.observeSubtitlesDOM(el);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  observeVideoTracks(video) {
    const tracks = video.textTracks;
    const handleCues = (e) => {
      const cues = e.target.activeCues;
      if (cues && cues.length > 0) this.updateSubtitles(cues[0].text);
      else this.hideSubtitles();
    };
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].addEventListener('cuechange', handleCues);
    }
  }

  observeSubtitlesDOM(container, segmentSelector = null) {
    if (container.dataset.echosubActive) return;
    container.dataset.echosubActive = 'true';

    const callback = () => {
      let text = "";
      if (segmentSelector) {
        const segments = container.querySelectorAll(segmentSelector);
        // Only take the last 2 segments to prevent screen coverage
        const lastSegments = Array.from(segments).slice(-2);
        text = lastSegments.map(s => s.innerText).join(' ');
      } else {
        text = container.innerText;
      }
      
      text = text.trim().replace(/\n/g, ' ');
      if (text && text !== this.currentText) {
        this.updateSubtitles(text);
      } else if (!text) {
        this.hideSubtitles();
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(container, { childList: true, subtree: true, characterData: true });
  }

  async updateSubtitles(text) {
    const video = document.querySelector('video');
    if (!text || !this.settings.enableSubtitles || (video && video.paused)) {
      if (video && video.paused && text === this.currentText) return; 
      this.hideSubtitles();
      return;
    }
    
    // STRICT: Only take the single latest dialogue line
    const segments = text.split('\n');
    const cleanText = segments[segments.length - 1].trim();
    
    if (cleanText === this.currentText) return;
    this.currentText = cleanText;
    
    // CLEAR EVERYTHING - Fresh start for every new sentence
    this.subtitleBox.innerHTML = '';
    let displayLines = [cleanText];

    if (this.settings.simplifiedMode) {
      try {
        if (!chrome.runtime?.id) throw new Error("Context invalidated");
        const response = await chrome.runtime.sendMessage({ type: "SIMPLIFY_TEXT", text: cleanText });
        if (response && response.success) displayLines = [response.data.simplified];
      } catch (e) { 
        console.warn("EchoSub: Simplification failed.");
        return; 
      }
    }

    displayLines.forEach(lineText => {
      // Clear again just to be 100% sure no history remains
      this.subtitleBox.innerHTML = '';
      // Character Detection Logic (Multi-Voice)
      let speaker = "Narrator";
      let speechContent = lineText;
      
      const charMatch = lineText.match(/^([^:]+):/);
      if (charMatch) {
        speaker = charMatch[1].trim();
        speechContent = lineText.replace(/^[^:]+:/, '').trim();
      }

      const lineDiv = document.createElement('div');
      speechContent.split(/\s+/).forEach(word => {
        if (!word.trim()) return;
        const span = document.createElement('span');
        span.className = 'echosub-word';
        span.innerText = word + ' ';
        span.onclick = (e) => this.handleWordClick(e, word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""));
        lineDiv.appendChild(span);
      });
      this.subtitleBox.appendChild(lineDiv);

      // Trigger Voice Overlay if enabled
      if (this.settings.enableVoice) {
        this.playVoiceOverlay(speechContent, speaker);
      }
    });

    this.subtitleBox.style.display = 'inline-block';
    this.explainBtn.style.display = 'inline-block';
    this.explainBtn.innerText = '✨ Explain Line';
  }

  playVoiceOverlay(text, speaker) {
    if (!chrome.runtime?.id) return;
    console.log(`Voice Overlay [${speaker}]: ${text}`);
    chrome.runtime.sendMessage({ 
      type: "TTS_REQUEST", 
      text: text, 
      speaker: speaker, 
      lang: this.settings.voiceLanguage || 'en-US' 
    });
  }

  hideSubtitles() {
    if (this.subtitleBox) {
      this.subtitleBox.style.display = 'none';
      this.explainBtn.style.display = 'none';
      this.currentText = "";
    }
  }

  handleWordClick(event, word) {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    if (!chrome.runtime?.id) return;
    chrome.runtime.sendMessage({ type: "FETCH_MEANING", word: word }, (response) => {
      if (response && response.success) this.showPopup(rect, response.data);
    });
  }

  handleExplainRequest() {
    if (!chrome.runtime?.id) return;
    
    // Auto-Pause the video for focused learning
    const video = document.querySelector('video');
    if (video) video.pause();
    
    this.explainBtn.innerText = '🌀 Thinking...';
    
    chrome.runtime.sendMessage({ type: "EXPLAIN_TEXT", text: this.currentText }, (response) => {
      this.explainBtn.innerText = '✨ Explain Line';
      if (response && response.success) {
        const rect = this.subtitleBox.getBoundingClientRect();
        this.showPopup({ 
          left: rect.left + rect.width/2 - 5, 
          top: rect.top, 
          width: 10 
        }, {
          word: "Context",
          meaning: response.data.explanation,
          example: "Original: " + this.currentText
        });
      }
    });
  }

  showPopup(wordRect, data) {
    const existing = this.shadow.querySelector('.echosub-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.className = 'echosub-popup';
    
    // Position logic
    const containerRect = this.shadow.querySelector('#echosub-overlay-container').getBoundingClientRect();
    const left = wordRect.left - (300 / 2) + (wordRect.width / 2);
    const bottom = window.innerHeight - wordRect.top + 15;

    popup.style.left = `${Math.max(20, Math.min(window.innerWidth - 320, left))}px`;
    popup.style.bottom = `${bottom}px`;

    popup.innerHTML = `
      <button class="echosub-close-btn">×</button>
      <div class="echosub-popup-word">${data.word}</div>
      <div class="echosub-popup-meaning">${data.meaning}</div>
      <div class="echosub-popup-example">${data.example}</div>
    `;

    this.shadow.appendChild(popup);

    // Close button logic
    popup.querySelector('.echosub-close-btn').onclick = (e) => {
      e.stopPropagation();
      popup.remove();
    };

    const closePopup = (e) => {
      if (!popup.contains(e.composedPath()[0])) {
        popup.remove();
        document.removeEventListener('mousedown', closePopup);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', closePopup), 10);
  }
}

new UniversalEchoSub();

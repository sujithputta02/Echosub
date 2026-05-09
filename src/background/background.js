// src/background/background.js

console.log("EchoSub Background Service Worker Initialized");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "FETCH_MEANING":
      fetchMeaning(request.word)
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case "SIMPLIFY_TEXT":
      callBackend("/simplify", { text: request.text })
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case "EXPLAIN_TEXT":
      callBackend("/explain", { text: request.text })
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case "TTS_REQUEST":
      console.log("Speaking:", request.text, request.lang);
      chrome.tts.stop(); // Clear the queue immediately
      chrome.tts.speak(request.text, {
        lang: request.lang,
        pitch: request.speaker === "Narrator" ? 1.0 : 1.2,
        rate: 1.0
      });
      break;
    
    case "SETTINGS_UPDATE":
      // Broadcast to other tabs if needed, but for now just log
      console.log("Settings Updated:", request.settings);
      break;
  }
});

async function callBackend(endpoint, body) {
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error("Backend not reachable");
    return await response.json();
  } catch (e) {
    throw e;
  }
}

async function fetchMeaning(word) {
  try {
    const response = await fetch(`http://localhost:3000/dictionary?word=${encodeURIComponent(word)}`);
    if (!response.ok) throw new Error("Backend not reachable");
    return await response.json();
  } catch (e) {
    return {
      word: word,
      meaning: "AI definition loading...",
      explanation: "Contextual meaning will appear here once AI processing is complete.",
      example: "Connecting to local AI engine..."
    };
  }
}

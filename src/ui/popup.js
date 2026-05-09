// src/ui/popup.js

document.addEventListener('DOMContentLoaded', () => {
  const toggles = ['enableSubtitles', 'simplifiedMode', 'perfMode', 'enableVoice', 'voiceLanguage', 'voiceVolume', 'subSize'];
  
  // Load settings
  chrome.storage.sync.get(toggles, (data) => {
    toggles.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === 'checkbox') {
        el.checked = !!data[id];
      } else {
        el.value = data[id] || (id === 'perfMode' ? 'balanced' : (id === 'voiceLanguage' ? 'en-US' : 0.5));
      }
    });
  });

  // Save settings on change
  toggles.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    
    el.addEventListener('change', (e) => {
      const value = (el.type === 'checkbox') ? e.target.checked : e.target.value;
      
      chrome.storage.sync.set({ [id]: value }, () => {
        console.log(`Setting ${id} saved:`, value);
        
        // Notify content script of changes
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "SETTINGS_UPDATE", settings: { [id]: value } });
          }
        });
      });
    });
  });
});

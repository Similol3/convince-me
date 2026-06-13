// ─── LOCAL STORAGE HELPERS ─────────────────────────────────
// Settings and Connect history are stored locally on device.

const KEYS = {
    SOUND:   'cm_sound',
    HAPTIC:  'cm_haptic',
    CONNECT_HISTORY: 'cm_connect_history',
  };
  
  // ── Settings ──────────────────────────────────────────────
  export function getSetting(key, defaultVal) {
    const val = localStorage.getItem(key);
    if (val === null) return defaultVal;
    return val === 'true';
  }
  
  export function setSetting(key, value) {
    localStorage.setItem(key, value.toString());
  }
  
  // ── Sound effect player ──────────────────────────────────
  export function playSound(type) {
    if (!getSetting(KEYS.SOUND, true)) return;
  
    // Simple beep using Web Audio API — no files needed
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
  
    osc.connect(gain);
    gain.connect(ctx.destination);
  
    const freqs = {
      click: 600,
      win:   880,
      error: 300,
    };
  
    osc.frequency.value = freqs[type] || 600;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }
  
  // ── Haptic feedback ───────────────────────────────────────
  export function vibrate(pattern = 10) {
    if (!getSetting(KEYS.HAPTIC, true)) return;
    if (navigator.vibrate) navigator.vibrate(pattern);
  }
  
  // ── Connect history ───────────────────────────────────────
  export function getConnectHistory() {
    const raw = localStorage.getItem(KEYS.CONNECT_HISTORY);
    return raw ? JSON.parse(raw) : [];
  }
  
  export function addConnectHistory(entry) {
    const history = getConnectHistory();
    history.unshift({
      ...entry,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    });
    // Keep last 30 only
    const trimmed = history.slice(0, 30);
    localStorage.setItem(KEYS.CONNECT_HISTORY, JSON.stringify(trimmed));
  }
  
  export function clearConnectHistory() {
    localStorage.removeItem(KEYS.CONNECT_HISTORY);
  }
  
  export { KEYS };
  
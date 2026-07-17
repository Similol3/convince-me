import { useState, useEffect } from 'react';
import { C, gr } from '../tokens';

export default function InstallBanner() {
  const [show,        setShow]        = useState(false);
  const [platform,    setPlatform]    = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showGuide,   setShowGuide]   = useState(false);
  const [installed,   setInstalled]   = useState(false);

  useEffect(() => {
    // Already installed as PWA — don't show
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone) return;

    // Already dismissed recently
    const dismissed = localStorage.getItem('cm_install_dismissed');
    if (dismissed) {
      const daysSince = (Date.now() - parseInt(dismissed)) / 86400000;
      if (daysSince < 3) return; // Don't show again for 3 days
    }

    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
      setTimeout(() => setShow(true), 4000); // Show after 4s on iOS
    } else if (/android/.test(ua)) {
      setPlatform('android');
      // Android: wait for browser's beforeinstallprompt event
    }

    // Android Chrome install prompt
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform('android');
      setTimeout(() => setShow(true), 4000);
    });

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShow(false);
      localStorage.removeItem('cm_install_dismissed');
    });
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem('cm_install_dismissed', Date.now().toString());
  }

  async function handleInstall() {
    if (platform === 'android' && deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
        setInstalled(true);
      }
    } else {
      setShowGuide(true);
    }
  }

  if (!show) return null;

  return (
    <>
      {/* Main banner */}
      {!showGuide && (
        <div style={{
          position: 'fixed', bottom: 88, left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 24px)', maxWidth: 406,
          background: 'rgba(20,18,32,0.97)',
          border: `1px solid rgba(139,92,246,0.4)`,
          borderRadius: 20, padding: '16px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 400,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          animation: 'slideUp 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12,
              background: gr(), display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 22, flexShrink: 0,
            }}>🎲</div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 2 }}>
                Add to Home Screen
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
                {platform === 'ios'
                  ? 'Install like a real app — works offline too'
                  : 'Install Convince Me on your device for the best experience'}
              </div>
            </div>

            <button onClick={dismiss} style={{
              background: 'transparent', border: 'none',
              color: C.muted, fontSize: 18, cursor: 'pointer',
              padding: 4, flexShrink: 0,
            }}>✕</button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={handleInstall} style={{
              flex: 1, background: gr(), border: 'none',
              borderRadius: 12, padding: '11px',
              color: 'white', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {platform === 'android' ? 'Install App' : 'Show me how'}
            </button>
            <button onClick={dismiss} style={{
              flex: 1, background: C.glass,
              border: `1px solid ${C.glassBdr}`,
              borderRadius: 12, padding: '11px',
              color: C.sub, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Not now
            </button>
          </div>
        </div>
      )}

      {/* iOS step-by-step guide */}
      {showGuide && platform === 'ios' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div style={{
            width: '100%', maxWidth: 430, margin: '0 auto',
            background: C.bg, borderRadius: '24px 24px 0 0',
            padding: '28px 20px 44px',
            border: `1px solid ${C.glassBdr}`,
            animation: 'slideUp 0.4s ease',
          }}>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📱</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'white', marginBottom: 4 }}>
                Add to Home Screen
              </div>
              <div style={{ fontSize: 13, color: C.sub }}>
                3 quick steps — takes 10 seconds
              </div>
            </div>

            {[
              {
                step: 1,
                icon: '⬆️',
                title: 'Tap the Share button',
                desc:  'The share icon at the bottom of Safari (the box with the arrow pointing up)',
              },
              {
                step: 2,
                icon: '➕',
                title: 'Tap "Add to Home Screen"',
                desc:  'Scroll down in the share sheet until you see this option',
              },
              {
                step: 3,
                icon: '✅',
                title: 'Tap "Add" to confirm',
                desc:  'The app will appear on your home screen like a real app',
              },
            ].map(item => (
              <div key={item.step} style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                marginBottom: 18,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: gr(), display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20, flexShrink: 0,
                }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}

            {/* Visual arrow pointing down to Safari bar */}
            <div style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: 14, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
            }}>
              <span style={{ fontSize: 16 }}>👇</span>
              <span style={{ fontSize: 12, color: C.sub, lineHeight: 1.4 }}>
                Look for the share icon at the bottom of your Safari browser bar
              </span>
            </div>

            <button onClick={() => { setShowGuide(false); dismiss(); }} style={{
              background: gr(), border: 'none', borderRadius: 14,
              padding: '16px', color: 'white', fontSize: 15,
              fontWeight: 700, cursor: 'pointer', width: '100%',
              fontFamily: 'inherit',
            }}>
              Got it!
            </button>

          </div>
        </div>
      )}

      {/* Android guide (fallback if no prompt event) */}
      {showGuide && platform === 'android' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div style={{
            width: '100%', maxWidth: 430, margin: '0 auto',
            background: C.bg, borderRadius: '24px 24px 0 0',
            padding: '28px 20px 44px',
            border: `1px solid ${C.glassBdr}`,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📱</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'white', marginBottom: 4 }}>
                Install Convince Me
              </div>
              <div style={{ fontSize: 13, color: C.sub }}>
                Add to your home screen in 3 steps
              </div>
            </div>

            {[
              {
                step: 1,
                icon: '⋮',
                title: 'Tap the menu (⋮)',
                desc:  'The three dots in the top right corner of Chrome',
              },
              {
                step: 2,
                icon: '➕',
                title: 'Tap "Add to Home screen"',
                desc:  'Or "Install app" if you see that option',
              },
              {
                step: 3,
                icon: '✅',
                title: 'Tap "Add" to confirm',
                desc:  'Convince Me will appear on your home screen',
              },
            ].map(item => (
              <div key={item.step} style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                marginBottom: 18,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: gr(), display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20, flexShrink: 0,
                  fontWeight: 900, color: 'white',
                }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => { setShowGuide(false); dismiss(); }} style={{
              background: gr(), border: 'none', borderRadius: 14,
              padding: '16px', color: 'white', fontSize: 15,
              fontWeight: 700, cursor: 'pointer', width: '100%',
              fontFamily: 'inherit',
            }}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

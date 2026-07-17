// ── Request notification permission ───────────────────────
export async function requestNotificationPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
  
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  
  // ── Schedule streak reminder ──────────────────────────────
  // Called every time user opens the app
  export function scheduleStreakReminder(streak) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
  
    // Clear any existing reminder
    const existing = localStorage.getItem('cm_reminder_timeout');
    if (existing) clearTimeout(parseInt(existing));
  
    // Calculate time until 10pm tonight
    const now       = new Date();
    const tonight   = new Date();
    tonight.setHours(22, 0, 0, 0); // 10pm
  
    const msUntil10pm = tonight.getTime() - now.getTime();
  
    // Only schedule if 10pm hasn't passed yet today
    if (msUntil10pm <= 0) return;
  
    const timeoutId = setTimeout(() => {
      showStreakReminder(streak);
    }, msUntil10pm);
  
    localStorage.setItem('cm_reminder_timeout', timeoutId.toString());
  }
  
  // ── Show the actual notification ─────────────────────────
  function showStreakReminder(streak) {
    if (Notification.permission !== 'granted') return;
  
    const messages = [
      { title: `🔥 ${streak}-day streak at risk!`, body: "Your streak resets at midnight. Make a decision now to keep it alive!" },
      { title: `⚡ Don't break your ${streak}-day streak!`, body: "2 hours left to keep your streak going. Open Convince Me now!" },
      { title: `🎯 Streak reminder!`, body: `You're on a ${streak}-day streak. Don't let it end tonight!` },
    ];
  
    const picked = messages[Math.floor(Math.random() * messages.length)];
  
    new Notification(picked.title, {
      body:    picked.body,
      icon:    '/icon-192.png',
      badge:   '/icon-192.png',
      tag:     'streak-reminder',
      renotify: false,
    });
  }
  
  // ── Ask user to enable notifications ─────────────────────
  export async function promptNotifications() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
  
    const granted = await requestNotificationPermission();
    return granted;
  }
  
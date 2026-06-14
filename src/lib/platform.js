export function getPlatform() {
    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) return 'android';
    return 'ios'; // default to iOS style (also covers desktop testing)
  }
  
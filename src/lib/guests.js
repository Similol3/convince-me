// ─── GUEST USER SYSTEM ────────────────────────────────────
// Users can use the app without signing up.
// Their data is saved locally.
// When they create an account, data can be transferred.

const KEY = 'cm_guest_user';

export function getGuestUser() {
  const stored = localStorage.getItem(KEY);
  if (stored) return JSON.parse(stored);

  // Create a new guest user
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  const guest = {
    id:              `guest_${randomNum}`,
    username:        `user${randomNum}`,
    avatar:          '🎲',
    avatar_image:    null,
    is_guest:        true,
    is_pro:          false,
    xp:              0,
    coins:           0,
    streak:          0,
    total_decisions: 0,
  };

  localStorage.setItem(KEY, JSON.stringify(guest));
  return guest;
}

export function updateGuestUser(updates) {
  const current = getGuestUser();
  const updated = { ...current, ...updates };
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function clearGuestUser() {
  localStorage.removeItem(KEY);
}

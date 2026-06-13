// ─── RANDOM DEFAULT USERNAME ──────────────────────────────
// Generates a username like "user28389337" if the person
// hasn't set their own yet. Stored locally so it persists.

export function getOrCreateUsername() {
    let username = localStorage.getItem('cm_username');
  
    if (!username) {
      const randomNum = Math.floor(10000000 + Math.random() * 90000000);
      username = `user${randomNum}`;
      localStorage.setItem('cm_username', username);
    }
  
    return username;
  }
  
  export function setUsername(newName) {
    localStorage.setItem('cm_username', newName);
  }
  
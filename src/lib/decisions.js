const FREE_DAILY_LIMIT = 3;

// ── Get today's decision count from localStorage ──────────
export function getTodayDecisionCount() {
  const today  = new Date().toISOString().split('T')[0];
  const stored = JSON.parse(localStorage.getItem('cm_decisions') || '{}');
  return stored.date === today ? (stored.count || 0) : 0;
}

// ── Increment count ───────────────────────────────────────
export function incrementDecisionCount() {
  const today   = new Date().toISOString().split('T')[0];
  const current = getTodayDecisionCount();
  localStorage.setItem('cm_decisions', JSON.stringify({
    date:  today,
    count: current + 1,
  }));
}

// ── Check if limit reached ────────────────────────────────
export function isDecisionLimitReached(isPro) {
  if (isPro) return false;
  return getTodayDecisionCount() >= FREE_DAILY_LIMIT;
}

export function getRemainingDecisions(isPro) {
  if (isPro) return Infinity;
  return Math.max(0, FREE_DAILY_LIMIT - getTodayDecisionCount());
}

export { FREE_DAILY_LIMIT };

// ── Streak logic ──────────────────────────────────────────
export function updateStreak(user, supabase) {
  if (!user || user.is_guest) return;

  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const lastDate  = user.last_streak_date;

  let newStreak = user.streak || 0;

  if (lastDate === today) {
    // Already used app today — no change
    return;
  } else if (lastDate === yesterday) {
    // Consecutive day — increment
    newStreak = newStreak + 1;
  } else {
    // Missed a day — reset
    newStreak = 1;
  }

  const longestStreak = Math.max(newStreak, user.longest_streak || 0);

  supabase.from('users').update({
    streak:           newStreak,
    last_streak_date: today,
    longest_streak:   longestStreak,
  }).eq('id', user.id);

  return newStreak;
}

// ── Streak milestone messages (Duolingo style) ────────────
export function getStreakMessage(streak) {
  if (streak === 1)  return { emoji: '🔥', msg: "You're on a streak! Come back tomorrow to keep it going." };
  if (streak === 3)  return { emoji: '🔥', msg: "3-day streak! You're building a habit." };
  if (streak === 7)  return { emoji: '⚡', msg: "One week streak! You're unstoppable." };
  if (streak === 14) return { emoji: '💎', msg: "Two weeks straight! Legendary." };
  if (streak === 30) return { emoji: '👑', msg: "30-day streak! You're the Decider." };
  if (streak % 10 === 0) return { emoji: '🏆', msg: `${streak}-day streak! Keep it going.` };
  return null;
}

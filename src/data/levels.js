// ─── XP & LEVEL SYSTEM ────────────────────────────────────
// Every decision earns XP. XP unlocks levels and badges.

export const LEVELS = [
    { level: 1,  xp: 0,    title: 'Rookie',       emoji: '🌱' },
    { level: 2,  xp: 50,   title: 'Decider',      emoji: '🎯' },
    { level: 3,  xp: 150,  title: 'Strategist',   emoji: '🧠' },
    { level: 4,  xp: 300,  title: 'Competitor',   emoji: '⚔️' },
    { level: 5,  xp: 500,  title: 'Champion',     emoji: '🏆' },
    { level: 6,  xp: 800,  title: 'Legend',       emoji: '👑' },
    { level: 7,  xp: 1200, title: 'Mythic',       emoji: '🌟' },
    { level: 8,  xp: 1800, title: 'Immortal',     emoji: '⚡' },
    { level: 9,  xp: 2500, title: 'Godlike',      emoji: '🔥' },
    { level: 10, xp: 3500, title: 'The Decider',  emoji: '🎲' },
  ];
  
  // XP earned per action
  export const XP = {
    decision:   10,
    share:       5,
    streak:     20,
    draw_win:   15,   // Won a coin flip draw
    close_call:  5,   // Won/lost by 1-2 votes
  };
  
  // Pass in total XP → get back level info
  export function getLevelInfo(totalXP) {
    let current = LEVELS[0];
    for (const lvl of LEVELS) {
      if (totalXP >= lvl.xp) current = lvl;
      else break;
    }
    const nextIndex = LEVELS.indexOf(current) + 1;
    const next = LEVELS[nextIndex] || null;
    return {
      ...current,
      nextXP:   next ? next.xp : null,
      progress: next
        ? ((totalXP - current.xp) / (next.xp - current.xp)) * 100
        : 100,
    };
  }
  
  // ─── BADGES ───────────────────────────────────────────────
  export const BADGES = [
    {
      id:      'first_decision',
      name:    'First Choice',
      emoji:   '🎯',
      desc:    'Made your first decision',
      rarity:  'common',
      check:   (s) => s.totalDecisions >= 1,
    },
    {
      id:      'ten_decisions',
      name:    'Decider',
      emoji:   '🏆',
      desc:    'Made 10 decisions',
      rarity:  'common',
      check:   (s) => s.totalDecisions >= 10,
    },
    {
      id:      'fifty_decisions',
      name:    'Indecisive No More',
      emoji:   '⚡',
      desc:    'Made 50 decisions',
      rarity:  'rare',
      check:   (s) => s.totalDecisions >= 50,
    },
    {
      id:      'streak_3',
      name:    'Warming Up',
      emoji:   '🔥',
      desc:    '3 day streak',
      rarity:  'common',
      check:   (s) => s.streak >= 3,
    },
    {
      id:      'streak_7',
      name:    'On Fire',
      emoji:   '🌋',
      desc:    '7 day streak',
      rarity:  'rare',
      check:   (s) => s.streak >= 7,
    },
    {
      id:      'streak_30',
      name:    'Unstoppable',
      emoji:   '👑',
      desc:    '30 day streak',
      rarity:  'legendary',
      check:   (s) => s.streak >= 30,
    },
    {
      id:      'coin_lord',
      name:    'Coin Lord',
      emoji:   '🪙',
      desc:    'Won a coin flip draw',
      rarity:  'rare',
      check:   (s) => s.coinFlipWins >= 1,
    },
    {
      id:      'sharer',
      name:    'Spread the Word',
      emoji:   '📢',
      desc:    'Shared 5 results',
      rarity:  'common',
      check:   (s) => s.shares >= 5,
    },
  ];
  
  // Rarity badge border colors
  export const RARITY = {
    common:    '#9CA3AF',
    rare:      '#8B5CF6',
    legendary: '#F59E0B',
  };
  
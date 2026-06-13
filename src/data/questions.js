// ─── QUESTION SETS BY CATEGORY ────────────────────────────
// Each category has its own 3 questions tailored to that decision type.

export const CATEGORIES = {
    food: {
      emoji: '🍕',
      label: 'Food',
      placeholderA: 'e.g. Pizza Night',
      placeholderB: 'e.g. Sushi Bar',
      questions: [
        {
          q: 'Setting the mood...',
          opts: [
            { e: '🧊', l: 'Chill'  },
            { e: '🔥', l: 'Party'  },
            { e: '🧠', l: 'Focus'  },
            { e: '🌪️', l: 'Chaos'  },
          ],
        },
        {
          q: 'How hungry are you?',
          opts: [
            { e: '🫙', l: 'Not really' },
            { e: '😐', l: 'A little'   },
            { e: '😋', l: 'Hungry'     },
            { e: '🔥', l: 'STARVING'   },
          ],
        },
        {
          q: 'Time you have?',
          opts: [
            { e: '⚡', l: 'Fast'      },
            { e: '⏰', l: 'Moderate'  },
            { e: '🍿', l: 'Plenty'    },
            { e: '🌙', l: 'All night' },
          ],
        },
      ],
    },
  
    watch: {
      emoji: '🎬',
      label: 'Watch',
      placeholderA: 'e.g. Inception',
      placeholderB: 'e.g. Tenet',
      questions: [
        {
          q: 'What mood are you in?',
          opts: [
            { e: '😌', l: 'Relaxed'  },
            { e: '😱', l: 'Thrilled' },
            { e: '😂', l: 'Laughing' },
            { e: '😢', l: 'Emotional'},
          ],
        },
        {
          q: 'How much time do you have?',
          opts: [
            { e: '⚡', l: 'Quick ep'   },
            { e: '🍿', l: 'Movie time'},
            { e: '📺', l: 'Binge mode'},
            { e: '🌙', l: 'All night'  },
          ],
        },
        {
          q: 'Who are you watching with?',
          opts: [
            { e: '🧍', l: 'Solo'    },
            { e: '👫', l: 'Partner' },
            { e: '👨‍👩‍👧', l: 'Family' },
            { e: '👯', l: 'Friends' },
          ],
        },
      ],
    },
  
    general: {
      emoji: '🎲',
      label: 'Anything Else',
      placeholderA: 'e.g. Option A',
      placeholderB: 'e.g. Option B',
      questions: [
        {
          q: "What's your vibe right now?",
          opts: [
            { e: '😌', l: 'Relaxed'  },
            { e: '🤩', l: 'Excited'  },
            { e: '😴', l: 'Tired'    },
            { e: '😤', l: 'Restless' },
          ],
        },
        {
          q: 'How much effort do you want to put in?',
          opts: [
            { e: '🛋️', l: 'None'    },
            { e: '🙂', l: 'A little' },
            { e: '💪', l: 'Some'     },
            { e: '🔥', l: 'A lot'    },
          ],
        },
        {
          q: 'How much time do you have?',
          opts: [
            { e: '⚡', l: 'Minutes'  },
            { e: '⏰', l: 'An hour'  },
            { e: '🌅', l: 'Half day' },
            { e: '🌙', l: 'All day'  },
          ],
        },
      ],
    },
  };
  
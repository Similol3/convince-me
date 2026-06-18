export const CATEGORIES = {
  food: {
    emoji:        '🍕',
    label:        'Food',
    placeholderA: 'e.g. Jollof Rice',
    placeholderB: 'e.g. Fried Rice',
    inputHint:    'Any food or drink from anywhere in the world',
    questions: [
      {
        q: 'What time of day is this for?',
        opts: [
          { e: '🌅', l: 'Breakfast' },
          { e: '☀️', l: 'Lunch'     },
          { e: '🌙', l: 'Dinner'    },
          { e: '🌃', l: 'Late night'},
        ],
      },
      {
        q: 'How hungry are you right now?',
        opts: [
          { e: '🫙', l: 'Not really'    },
          { e: '😐', l: 'A little'      },
          { e: '😋', l: 'Pretty hungry' },
          { e: '🔥', l: 'STARVING'      },
        ],
      },
      {
        q: "What's your current vibe?",
        opts: [
          { e: '🧊', l: 'Something light'    },
          { e: '🍖', l: 'Heavy and filling'  },
          { e: '🌶️', l: 'Spicy please'       },
          { e: '🍫', l: 'Comfort food'       },
        ],
      },
      {
        q: 'How much time do you have?',
        opts: [
          { e: '⚡', l: 'Very fast' },
          { e: '⏰', l: 'Moderate'  },
          { e: '🍿', l: 'Plenty'    },
          { e: '🌙', l: 'All night' },
        ],
      },
      {
        q: 'Are you eating alone or with others?',
        opts: [
          { e: '🧍', l: 'Just me'      },
          { e: '👫', l: 'With someone' },
          { e: '👨‍👩‍👧', l: 'Family'       },
          { e: '👯', l: 'Group'        },
        ],
      },
    ],
  },

  watch: {
    emoji:        '🎬',
    label:        'Watch',
    placeholderA: 'e.g. Inception',
    placeholderB: 'e.g. Interstellar',
    inputHint:    'Any movie, show, or series from anywhere in the world',
    questions: [
      {
        q: "What's your mood right now?",
        opts: [
          { e: '😌', l: 'Relaxed'    },
          { e: '😱', l: 'Thrilled'   },
          { e: '😂', l: 'Want laughs'},
          { e: '😢', l: 'Emotional'  },
        ],
      },
      {
        q: 'How much time do you have?',
        opts: [
          { e: '⚡', l: 'Quick episode' },
          { e: '🎬', l: 'One movie'     },
          { e: '📺', l: 'Binge mode'    },
          { e: '🌙', l: 'All night'     },
        ],
      },
      {
        q: 'Who are you watching with?',
        opts: [
          { e: '🧍', l: 'Solo'    },
          { e: '👫', l: 'Partner' },
          { e: '👨‍👩‍👧', l: 'Family'  },
          { e: '👯', l: 'Friends' },
        ],
      },
      {
        q: 'What genre are you feeling?',
        opts: [
          { e: '💥', l: 'Action'   },
          { e: '❤️', l: 'Romance'  },
          { e: '👻', l: 'Horror'   },
          { e: '🧠', l: 'Thriller' },
        ],
      },
      {
        q: 'How much brain power do you want to use?',
        opts: [
          { e: '🛋️', l: 'Zero — just chill'    },
          { e: '🙂', l: 'A little effort'       },
          { e: '🧩', l: 'Keep me thinking'      },
          { e: '🤯', l: 'Mind-blowing please'   },
        ],
      },
    ],
  },

  general: {
    emoji:        '🎲',
    label:        'Help Me Decide',
    placeholderA: 'e.g. Go to the gym',
    placeholderB: 'e.g. Stay home and rest',
    inputHint:    'Anything you need help deciding — no limits',
    questions: [
      {
        q: "What's your energy level right now?",
        opts: [
          { e: '😴', l: 'Very low' },
          { e: '😌', l: 'Relaxed'  },
          { e: '🙂', l: 'Decent'   },
          { e: '🔥', l: 'Hyped'    },
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
      {
        q: 'How much effort are you willing to put in?',
        opts: [
          { e: '🛋️', l: 'Minimal'  },
          { e: '🙂', l: 'A little' },
          { e: '💪', l: 'Some'     },
          { e: '🔥', l: 'A lot'    },
        ],
      },
      {
        q: 'How important is this decision?',
        opts: [
          { e: '🤷', l: 'Not really'        },
          { e: '😐', l: 'Somewhat'          },
          { e: '😟', l: 'Pretty important'  },
          { e: '😰', l: 'Very important'    },
        ],
      },
      {
        q: 'How are you feeling overall?',
        opts: [
          { e: '😔', l: 'Not great' },
          { e: '😌', l: 'Okay'      },
          { e: '😊', l: 'Good'      },
          { e: '🤩', l: 'Amazing'   },
        ],
      },
    ],
  },
};

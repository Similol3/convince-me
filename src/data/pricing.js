export const PRO_FEATURES = [
  {
    id:    'unlimited_connect',
    emoji: '💬',
    label: 'Unlimited AI messages',
    desc:  'No daily limit on Connect generations',
  },
  {
    id:    'custom_photo',
    emoji: '🖼️',
    label: 'Custom photo avatar',
    desc:  'Upload your own profile picture from your gallery',
  },
  {
    id:    'exclusive_avatars',
    emoji: '✨',
    label: 'Exclusive Pro avatars',
    desc:  '12 premium avatars only available to Pro members',
  },
  {
    id:    'pro_badge',
    emoji: '👑',
    label: 'Pro badge on profile',
    desc:  'Show off your Pro status everywhere',
  },
  {
    id:    'no_ads',
    emoji: '🚫',
    label: 'Ad-free forever',
    desc:  'Skip any future ads',
  },
];

export const PRICING = {
  monthly: { price: '$2.50', period: '/month'     },
  yearly:  { price: '$14.99', period: '/year', badge: 'Save 58%' },
};

export const FREE_DAILY_CONNECT_LIMIT = 5;

// Free avatars — available to everyone
export const FREE_AVATARS = [
  '🎲', '😎', '🦊', '🐱', '🐼', '🦁',
  '🐸', '🦄', '👽', '🤖', '🌟', '🔥',
];

// Pro-only avatars — only unlocked after subscription
export const PRO_AVATARS = [
  '💎', '🌙', '⚡', '🎯', '👑', '🔮',
  '🌺', '🦋', '🐉', '🦅', '🌈', '💫',
];

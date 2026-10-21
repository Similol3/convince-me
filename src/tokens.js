export const C = {
  bg:      '#0A0A12',
  card:    '#16141F',
  card2:   '#1D1B29',
  glass:   'rgba(255,255,255,0.045)',
  glassBdr:'rgba(255,255,255,0.09)',

  grape:   '#9165F6',
  pink:    '#F15BA5',
  teal:    '#17C6D9',
  gold:    '#F7B737',
  emerald: '#19C98A',
  red:     '#F1556C',

  text:    '#FFFFFF',
  sub:     'rgba(255,255,255,0.64)',
  muted:   'rgba(255,255,255,0.38)',
  border:  'rgba(255,255,255,0.09)',
};

export const gr = (deg = 100) =>
  `linear-gradient(${deg}deg, #9165F6 0%, #F15BA5 100%)`;

export const grGold = (deg = 100) =>
  `linear-gradient(${deg}deg, #F7B737 0%, #FCD56B 100%)`;

export const grTeal = (deg = 100) =>
  `linear-gradient(${deg}deg, #17C6D9 0%, #38E1D0 100%)`;

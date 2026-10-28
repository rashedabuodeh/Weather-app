export const colors = {
  background: '#1e3a5f',
  card: 'rgba(255,255,255,0.1)',
  border: 'rgba(255,255,255,0.2)',
  text: '#ffffff',
  textSecondary: '#cfe0f5',
  textMuted: '#9fb6d1',
  accent: '#8ec5ff',
  warning: '#ffd27a',
  danger: '#ff8a8a',
  barTrack: 'rgba(0,0,0,0.25)',
};

/** Fill colours for temperature bars, from cold to hot (°C thresholds). */
export const temperatureScale = [
  { upTo: 0, color: '#a5d8ff' },
  { upTo: 10, color: '#4dabf7' },
  { upTo: 20, color: '#69db7c' },
  { upTo: 30, color: '#ffc078' },
  { upTo: Infinity, color: '#ff6b6b' },
];

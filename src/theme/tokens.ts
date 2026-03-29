/**
 * Cohesive palette: cool off-whites + forest greens + yarn teal + blue-teal accents.
 * Avoids unrelated purples/oranges; earth tones stay muted.
 */
export const colors = {
  /** Slightly cool canvas (harmonizes with teal UI) */
  background: '#F6F9F8',
  surface: '#FFFFFF',

  /** Body text — near-black with a hint of green */
  text: '#1A2220',
  /** Labels, secondary copy — sage gray */
  textMuted: '#5C6D68',

  /** Hairlines, cards */
  border: '#DFE8E4',

  /** Yarn ball + wordmarks */
  brandTeal: '#2AA89A',
  brandTealDark: '#1E7A70',

  /** Primary actions, active tab, nav emphasis (forest green) */
  accent: '#2A5E52',
  accentMuted: '#4A7D6A',

  /** Errors / destructive */
  danger: '#B85C4A',

  /** Score dots — high / mid / low */
  scoreHigh: '#2A5E52',
  scoreMid: '#A67C2A',
  scoreLow: '#A85A4A',
  /** Hero score band on results when overall is low */
  scoreBandLowBg: '#F5EBE8',

  /** Results “What this means” — all in teal / blue-green / forest family */
  explainerBrand: '#2A6A72',
  explainerBrandBg: '#EEF6F6',
  explainerMaterials: '#0D9488',
  explainerMaterialsBg: '#E6F7F4',
  explainerCountry: '#3D6B5C',
  explainerCountryBg: '#EDF4F1',
  explainerWarn: '#8A6B2E',
  explainerWarnBg: '#FAF6E8',
  explainerTag: '#4A6670',
  explainerTagBg: '#EEF3F3',

  /** Top tabs / segment pills */
  tabPill: '#E2EAE7',
  tabPillBorder: '#D0DCD8',
  tabBarSelectedBg: '#D4E0DC',
  tabBarSelectedBorder: '#B8C9C3',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
};

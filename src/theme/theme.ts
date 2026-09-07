// Design tokens ported from the Claude Design handoff (project/TestMandi App.dc.html).
// Warm paper ground, ink-black chrome, marigold accent.

export const colors = {
  ground: '#EDE7DA',
  paper: '#F6F1E7',
  paperCard: '#FFFDF8',
  ink: '#17150F',
  inkSoft: 'rgba(23,21,15,0.55)',
  inkFaint: 'rgba(23,21,15,0.45)',
  inkFainter: 'rgba(23,21,15,0.4)',
  border: 'rgba(23,21,15,0.12)',
  borderSoft: 'rgba(23,21,15,0.09)',
  borderStrong: 'rgba(23,21,15,0.2)',
  onInk: '#F6F1E7',
  onInkSoft: 'rgba(246,241,231,0.6)',
  onInkFaint: 'rgba(246,241,231,0.5)',
  marigold: '#E3A857',
  amber: '#B0611A',
  amberDeep: '#8A4A11',
  teal: '#2B5560',
  brown: '#7A3B2E',
  red: '#9B2C21',
  white: '#FFFFFF',
} as const;

// Rough performance-color scale used across topic bars / percentages.
export function perfColor(pct: number): string {
  if (pct < 50) return colors.red;
  if (pct < 70) return colors.amber;
  return colors.teal;
}

export const fonts = {
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  devanagari: 'NotoSerifDevanagari_600SemiBold',
  sans: 'FamiljenGrotesk_400Regular',
  sansMedium: 'FamiljenGrotesk_500Medium',
  sansSemiBold: 'FamiljenGrotesk_600SemiBold',
  sansBold: 'FamiljenGrotesk_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  monoSemiBold: 'JetBrainsMono_600SemiBold',
} as const;

export const radius = {
  sm: 7,
  md: 9,
  lg: 13,
  xl: 16,
  xxl: 22,
  pill: 999,
} as const;

export const spacing = (n: number) => n * 4;

export const Colors = {
  crema: '#F6F3ED',
  salvia: '#BFD2D2',
  carbon: '#262626',
  greige: '#B7ADA2',
  oliva: '#5E7154',
  coral: '#F06A4B',
  piedra: '#6F6A64',
  blanco: '#FAFAF8',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
} as const;

export const Shadow = {
  shadowColor: '#B7ADA2',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
} as const;

export const FontFamily = {
  playfairRegular: 'PlayfairDisplay_400Regular',
  playfairSemiBold: 'PlayfairDisplay_600SemiBold',
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
} as const;

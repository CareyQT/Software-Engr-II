export const TERM_SEASONS = ['Fall', 'Winter', 'Spring', 'Summer'] as const

export type TermSeason = (typeof TERM_SEASONS)[number]

export function parseTermSeason(value: string): TermSeason | null {
  const normalized = value.trim().toLowerCase()

  switch (normalized) {
    case 'fall':
      return 'Fall'
    case 'winter':
      return 'Winter'
    case 'spring':
      return 'Spring'
    case 'summer':
      return 'Summer'
    default:
      return null
  }
}

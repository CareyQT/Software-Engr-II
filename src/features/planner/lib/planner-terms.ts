import { PlannedTerm } from '@/features/plans/interfaces/plan'
import { TERM_SEASONS } from '@/interfaces/academic-term'

export function createDefaultTerms(baseYear = new Date().getFullYear()): PlannedTerm[] {
  return [
    {
      id: `fall-${baseYear}`,
      label: `Fall ${baseYear}`,
      season: 'Fall',
      year: baseYear,
      courses: [],
    },
    {
      id: `winter-${baseYear + 1}`,
      label: `Winter ${baseYear + 1}`,
      season: 'Winter',
      year: baseYear + 1,
      courses: [],
    },
    {
      id: `spring-${baseYear + 1}`,
      label: `Spring ${baseYear + 1}`,
      season: 'Spring',
      year: baseYear + 1,
      courses: [],
    },
    {
      id: `summer-${baseYear + 1}`,
      label: `Summer ${baseYear + 1}`,
      season: 'Summer',
      year: baseYear + 1,
      courses: [],
    },
    {
      id: `fall-${baseYear + 1}`,
      label: `Fall ${baseYear + 1}`,
      season: 'Fall',
      year: baseYear + 1,
      courses: [],
    },
    {
      id: `winter-${baseYear + 2}`,
      label: `Winter ${baseYear + 2}`,
      season: 'Winter',
      year: baseYear + 2,
      courses: [],
    },
    {
      id: `spring-${baseYear + 2}`,
      label: `Spring ${baseYear + 2}`,
      season: 'Spring',
      year: baseYear + 2,
      courses: [],
    },
    {
      id: `summer-${baseYear + 2}`,
      label: `Summer ${baseYear + 2}`,
      season: 'Summer',
      year: baseYear + 2,
      courses: [],
    },
  ]
}

export function createNextTerm(terms: PlannedTerm[]): PlannedTerm {
  const lastTerm = terms.at(-1)

  if (!lastTerm) {
    return {
      id: 'fall-2026',
      label: 'Fall 2026',
      season: 'Fall',
      year: 2026,
      courses: [],
    }
  }

  const seasonIndex = TERM_SEASONS.indexOf(lastTerm.season)
  const nextSeasonIndex = (seasonIndex + 1) % TERM_SEASONS.length
  const nextSeason = TERM_SEASONS[nextSeasonIndex]
  const nextYear = nextSeason === 'Fall' ? lastTerm.year + 1 : lastTerm.year

  return {
    id: `${nextSeason.toLowerCase()}-${nextYear}-${terms.length + 1}`,
    label: `${nextSeason} ${nextYear}`,
    season: nextSeason,
    year: nextYear,
    courses: [],
  }
}

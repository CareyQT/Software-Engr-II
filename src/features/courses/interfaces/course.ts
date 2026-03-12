import { TermSeason } from '@/interfaces/academic-term'

export interface PrerequisiteRule {
  allOf?: string[]
  oneOf?: string[]
  minimumCompletedCredits?: number
}

export interface Course {
  code: string
  subject: string
  number: string
  title: string
  credits: number
  description: string
  offeredTerms: TermSeason[]
  prerequisiteText?: string
  prerequisiteRule?: PrerequisiteRule
  requiresManualCheck?: boolean
}

export interface CourseSearchFilters {
  query?: string
  department?: string
  term?: string
  minCredits?: number
  maxCredits?: number
}

export interface CourseRecord {
  id: number
  title: string
  code: string
  credits: number
  description: string | null
}

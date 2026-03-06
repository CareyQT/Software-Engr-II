export const TERM_SEASONS = ['Fall', 'Winter', 'Spring', 'Summer'] as const

export type TermSeason = (typeof TERM_SEASONS)[number]

export const GRADE_OPTIONS = [
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'C-',
  'D+',
  'D',
  'D-',
  'F',
] as const

export type GradeOption = (typeof GRADE_OPTIONS)[number]

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

export interface PlannedTerm {
  id: string
  label: string
  season: TermSeason
  year: number
  courses: string[]
}

export interface PlanDraft {
  terms: PlannedTerm[]
  completedCourses: string[]
  expectedGrades: Record<string, GradeOption | ''>
}

export interface PlanValidationRequest {
  terms: PlannedTerm[]
  completedCourses: string[]
  allowConcurrentEnrollment: boolean
}

export type ValidationStatus = 'eligible' | 'ineligible' | 'manual_check'

export interface CourseValidationResult {
  code: string
  termId: string
  termLabel: string
  status: ValidationStatus
  reasons: string[]
  earliestEligibleTermLabel: string | null
}

export interface PlanValidationResponse {
  byTerm: Record<string, CourseValidationResult[]>
  byCourseAndTerm: Record<string, CourseValidationResult>
}

export interface SavedPlan {
  id: string
  name: string
  savedAt: string
  plan: PlanDraft
}

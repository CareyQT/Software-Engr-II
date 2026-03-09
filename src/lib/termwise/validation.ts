import { COURSE_MAP, normalizeCourseCode } from '@/src/lib/termwise/data'
import {
  Course,
  CourseValidationResult,
  GradeOption,
  PlanValidationRequest,
  PlanValidationResponse,
  PlannedTerm,
  TermSeason,
} from '@/src/lib/termwise/types'

const GRADE_POINTS: Record<GradeOption, number> = {
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  'D-': 0.7,
  F: 0.0,
}

interface PrerequisiteCheck {
  missingAllOf: string[]
  oneOfOptions: string[]
  hasOneOfMatch: boolean
  missingMinimumCredits: number
}

interface AvailabilitySnapshot {
  completedCodes: Set<string>
  completedCredits: number
}

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

export function validatePlan(request: PlanValidationRequest): PlanValidationResponse {
  const normalizedCompleted = new Set(request.completedCourses.map(normalizeCourseCode))

  const snapshots: AvailabilitySnapshot[] = []
  const eligibleCompleted = new Set<string>(normalizedCompleted)
  let completedCredits = sumCredits(Array.from(eligibleCompleted))

  const byTerm: Record<string, CourseValidationResult[]> = {}
  const byCourseAndTerm: Record<string, CourseValidationResult> = {}
  const resultsInOrder: Array<{ index: number; result: CourseValidationResult }> = []

  request.terms.forEach((term, termIndex) => {
    snapshots[termIndex] = {
      completedCodes: new Set(eligibleCompleted),
      completedCredits,
    }

    const currentTermCodes = new Set(term.courses.map(normalizeCourseCode))
    const termResults: CourseValidationResult[] = []
    const eligibleThisTerm: string[] = []

    term.courses.forEach(rawCode => {
      const code = normalizeCourseCode(rawCode)
      const course = COURSE_MAP.get(code)

      let status: CourseValidationResult['status'] = 'eligible'
      const reasons: string[] = []

      if (!course) {
        status = 'ineligible'
        reasons.push('Course does not exist in the supported catalog subset.')
      } else if (course.requiresManualCheck) {
        status = 'manual_check'
        reasons.push('Prerequisite format is not fully supported; manual advisor check required.')
      } else {
        if (!course.offeredTerms.includes(term.season)) {
          status = 'ineligible'
          reasons.push(`Not typically offered in ${term.season}.`)
        }

        const prerequisiteCheck = checkPrerequisites(
          course,
          snapshots[termIndex],
          currentTermCodes,
          request.allowConcurrentEnrollment
        )
        reasons.push(...buildPrerequisiteReasons(prerequisiteCheck))

        if (reasons.length > 0) {
          status = 'ineligible'
        }
      }

      const result: CourseValidationResult = {
        code,
        termId: term.id,
        termLabel: term.label,
        status,
        reasons,
        earliestEligibleTermLabel: null,
      }

      termResults.push(result)
      byCourseAndTerm[buildCourseKey(term.id, code)] = result
      resultsInOrder.push({ index: termIndex, result })

      if (status === 'eligible') {
        eligibleThisTerm.push(code)
      }
    })

    byTerm[term.id] = termResults
    eligibleThisTerm.forEach(code => eligibleCompleted.add(code))
    completedCredits = sumCredits(Array.from(eligibleCompleted))
  })

  resultsInOrder.forEach(({ index, result }) => {
    if (result.status === 'eligible') {
      return
    }

    const earliest = findEarliestEligibleTermLabel(
      result.code,
      index,
      request.terms,
      snapshots,
      request.allowConcurrentEnrollment
    )

    result.earliestEligibleTermLabel = earliest
  })

  return {
    byTerm,
    byCourseAndTerm,
  }
}

function findEarliestEligibleTermLabel(
  courseCode: string,
  startIndex: number,
  terms: PlannedTerm[],
  snapshots: AvailabilitySnapshot[],
  allowConcurrentEnrollment: boolean
): string | null {
  const course = COURSE_MAP.get(courseCode)
  if (!course || course.requiresManualCheck) {
    return null
  }

  for (let index = startIndex; index < terms.length; index += 1) {
    const term = terms[index]
    if (!course.offeredTerms.includes(term.season)) {
      continue
    }

    const currentTermCodes = new Set(term.courses.map(normalizeCourseCode))
    currentTermCodes.add(courseCode)

    const prerequisiteCheck = checkPrerequisites(
      course,
      snapshots[index],
      currentTermCodes,
      allowConcurrentEnrollment
    )
    const hasPrerequisiteBlockers =
      prerequisiteCheck.missingAllOf.length > 0 ||
      prerequisiteCheck.missingMinimumCredits > 0 ||
      (prerequisiteCheck.oneOfOptions.length > 0 && !prerequisiteCheck.hasOneOfMatch)

    if (!hasPrerequisiteBlockers) {
      return term.label
    }
  }

  return null
}

function checkPrerequisites(
  course: Course,
  snapshot: AvailabilitySnapshot,
  currentTermCodes: Set<string>,
  allowConcurrentEnrollment: boolean
): PrerequisiteCheck {
  const rule = course.prerequisiteRule
  if (!rule) {
    return {
      missingAllOf: [],
      oneOfOptions: [],
      hasOneOfMatch: true,
      missingMinimumCredits: 0,
    }
  }

  const availableCodes = new Set(snapshot.completedCodes)
  if (allowConcurrentEnrollment) {
    currentTermCodes.forEach(code => availableCodes.add(code))
  }

  const requiredAllOf = (rule.allOf ?? []).map(normalizeCourseCode)
  const missingAllOf = requiredAllOf.filter(code => !availableCodes.has(code))

  const oneOfOptions = (rule.oneOf ?? []).map(normalizeCourseCode)
  const hasOneOfMatch =
    oneOfOptions.length === 0 || oneOfOptions.some(code => availableCodes.has(code))

  const minimumCompletedCredits = rule.minimumCompletedCredits ?? 0
  const missingMinimumCredits = Math.max(0, minimumCompletedCredits - snapshot.completedCredits)

  return {
    missingAllOf,
    oneOfOptions,
    hasOneOfMatch,
    missingMinimumCredits,
  }
}

function buildPrerequisiteReasons(check: PrerequisiteCheck): string[] {
  const reasons: string[] = []

  if (check.missingAllOf.length > 0) {
    reasons.push(`Missing prerequisites: ${check.missingAllOf.join(', ')}.`)
  }

  if (check.oneOfOptions.length > 0 && !check.hasOneOfMatch) {
    reasons.push(`Need one of: ${check.oneOfOptions.join(', ')}.`)
  }

  if (check.missingMinimumCredits > 0) {
    reasons.push(`Need ${check.missingMinimumCredits} more completed credits.`)
  }

  return reasons
}

function sumCredits(codes: string[]): number {
  return codes.reduce((total, code) => total + (COURSE_MAP.get(code)?.credits ?? 0), 0)
}

function buildCourseKey(termId: string, code: string): string {
  return `${termId}::${code}`
}

interface GpaComputation {
  gpa: number | null
  totalCredits: number
  gradedCourses: number
}

export function calculateTermGpa(
  term: PlannedTerm,
  expectedGrades: Record<string, GradeOption | ''>
): GpaComputation {
  const entries = term.courses
    .map(code => {
      const normalizedCode = normalizeCourseCode(code)
      const course = COURSE_MAP.get(normalizedCode)
      const grade = expectedGrades[normalizedCode]
      if (!course || !grade) {
        return null
      }
      return {
        credits: course.credits,
        points: GRADE_POINTS[grade],
      }
    })
    .filter(entry => entry !== null)

  return calculateGpa(entries)
}

export function calculateCumulativeGpa(
  terms: PlannedTerm[],
  completedCourses: string[],
  expectedGrades: Record<string, GradeOption | ''>
): GpaComputation {
  const plannedCodes = terms.flatMap(term => term.courses)
  const uniqueCodes = new Set([...completedCourses, ...plannedCodes].map(normalizeCourseCode))

  const entries = Array.from(uniqueCodes)
    .map(code => {
      const course = COURSE_MAP.get(code)
      const grade = expectedGrades[code]
      if (!course || !grade) {
        return null
      }
      return {
        credits: course.credits,
        points: GRADE_POINTS[grade],
      }
    })
    .filter(entry => entry !== null)

  return calculateGpa(entries)
}

function calculateGpa(
  entries: Array<{
    credits: number
    points: number
  } | null>
): GpaComputation {
  const validEntries = entries.filter(entry => entry !== null)
  const totals = validEntries.reduce(
    (acc, entry) => {
      const nextCredits = acc.totalCredits + entry.credits
      const nextPoints = acc.totalPoints + entry.credits * entry.points
      return {
        totalCredits: nextCredits,
        totalPoints: nextPoints,
      }
    },
    { totalCredits: 0, totalPoints: 0 }
  )

  if (totals.totalCredits === 0) {
    return {
      gpa: null,
      totalCredits: 0,
      gradedCourses: 0,
    }
  }

  return {
    gpa: Number((totals.totalPoints / totals.totalCredits).toFixed(2)),
    totalCredits: totals.totalCredits,
    gradedCourses: validEntries.length,
  }
}

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

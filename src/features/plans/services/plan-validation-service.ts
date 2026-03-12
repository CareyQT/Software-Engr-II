import { Course } from '@/features/courses/interfaces/course'
import { COURSE_MAP } from '@/features/courses/lib/course-catalog'
import { normalizeCourseCode } from '@/features/courses/utils/normalize-course-code'
import {
  CourseValidationResult,
  GradeOption,
  PlanValidationRequest,
  PlanValidationResponse,
  PlannedTerm,
} from '@/features/plans/interfaces/plan'

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

export function isPlanValidationRequest(
  payload: Partial<PlanValidationRequest> | null | undefined
): payload is PlanValidationRequest {
  try {
    return Boolean(
      payload && Array.isArray(payload.terms) && Array.isArray(payload.completedCourses)
    )
  } catch (error) {
    console.error('Error in isPlanValidationRequest:', error)
    return false
  }
}

export function validateStudentPlan(payload: PlanValidationRequest) {
  try {
    return validatePlan(payload)
  } catch (error) {
    console.error('Error in validateStudentPlan:', error)
    throw error
  }
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

    result.earliestEligibleTermLabel = findEarliestEligibleTermLabel(
      result.code,
      index,
      request.terms,
      snapshots,
      request.allowConcurrentEnrollment
    )
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

export function isLetterGrade(value: string | undefined): value is GradeOption {
  return ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'].includes(value ?? '')
}

import { COURSE_MAP } from '@/features/courses/lib/course-catalog'
import { normalizeCourseCode } from '@/features/courses/utils/normalize-course-code'
import { GradeOption, PlannedTerm } from '@/features/plans/interfaces/plan'

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

export interface GpaComputation {
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

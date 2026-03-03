import { COURSE_CATALOG, normalizeCourseCode } from '@/src/lib/termwise/data'
import { Course } from '@/src/lib/termwise/types'
import { parseTermSeason } from '@/src/lib/termwise/validation'

export interface CourseSearchFilters {
  query?: string
  term?: string
  minCredits?: number
  maxCredits?: number
}

export function searchCourses(filters: CourseSearchFilters): { courses: Course[]; total: number } {
  const query = filters.query?.trim().toLowerCase() ?? ''
  const season = filters.term ? parseTermSeason(filters.term) : null

  const courses = COURSE_CATALOG.filter(course => {
    if (query.length > 0) {
      const haystack = `${course.code} ${course.title} ${course.description}`.toLowerCase()
      if (!haystack.includes(query)) {
        return false
      }
    }

    if (season && !course.offeredTerms.includes(season)) {
      return false
    }

    if (typeof filters.minCredits === 'number' && !Number.isNaN(filters.minCredits)) {
      if (course.credits < filters.minCredits) {
        return false
      }
    }

    if (typeof filters.maxCredits === 'number' && !Number.isNaN(filters.maxCredits)) {
      if (course.credits > filters.maxCredits) {
        return false
      }
    }

    return true
  }).sort((a, b) => a.code.localeCompare(b.code))

  return {
    courses,
    total: courses.length,
  }
}

export function listCoursePrerequisites() {
  return COURSE_CATALOG.map(course => ({
    code: course.code,
    prerequisiteText: course.prerequisiteText ?? null,
    prerequisiteRule: course.prerequisiteRule ?? null,
    requiresManualCheck: Boolean(course.requiresManualCheck),
  }))
}

export function getCoursePrerequisites(code: string) {
  const normalizedCode = normalizeCourseCode(code)
  const course = COURSE_CATALOG.find(item => item.code === normalizedCode)
  if (!course) {
    return null
  }

  return {
    code: course.code,
    prerequisiteText: course.prerequisiteText ?? null,
    prerequisiteRule: course.prerequisiteRule ?? null,
    requiresManualCheck: Boolean(course.requiresManualCheck),
  }
}

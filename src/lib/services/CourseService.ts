import pool from '@/src/db/db'
import { COURSE_CATALOG, normalizeCourseCode } from '@/src/lib/termwise/data'
import { Course } from '@/src/lib/termwise/types'
import { parseTermSeason } from '@/src/lib/termwise/validation'

export interface CourseSearchFilters {
  query?: string
  term?: string
  minCredits?: number
  maxCredits?: number
}

export interface CourseInterface {
  id: number
  title: string
  code: string
  credits: number
  description: string | null
}

/**
 * Course Service
 *
 * Handles all database operations for the Course table.
 * Provides functions to retrieve all courses, find a course by ID or code,
 * create a new course, update course fields, and delete a course.
 *
 * Used by: /api/courses/route.ts
 */
export async function getAllCourses() {
  try {
    const result = await pool.query('SELECT * FROM Course ORDER BY code')
    return result.rows as CourseInterface[]
  } catch (error) {
    console.error('Error in getAllCourses:', error)
    throw error
  }
}

export async function getCourseById(id: number) {
  try {
    const result = await pool.query('SELECT * FROM Course WHERE id = $1', [id])
    return (result.rows[0] as CourseInterface) ?? null
  } catch (error) {
    console.error('Error in getCourseById:', error)
    throw error
  }
}

export async function getCourseByCode(code: string) {
  try {
    const result = await pool.query('SELECT * FROM Course WHERE code = $1', [code])
    return (result.rows[0] as CourseInterface) ?? null
  } catch (error) {
    console.error('Error in getCourseByCode:', error)
    throw error
  }
}

export async function createCourse(
  title: string,
  code: string,
  credits: number,
  description?: string
) {
  try {
    const result = await pool.query(
      'INSERT INTO Course (title, code, credits, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, code, credits, description ?? null]
    )
    return result.rows[0] as CourseInterface
  } catch (error) {
    console.error('Error in createCourse:', error)
    throw error
  }
}

export async function updateCourse(
  id: number,
  title?: string,
  code?: string,
  credits?: number,
  description?: string
) {
  try {
    const result = await pool.query(
      `UPDATE Course SET
        title = COALESCE($1, title),
        code = COALESCE($2, code),
        credits = COALESCE($3, credits),
        description = COALESCE($4, description)
       WHERE id = $5 RETURNING *`,
      [title ?? null, code ?? null, credits ?? null, description ?? null, id]
    )
    return (result.rows[0] as CourseInterface) ?? null
  } catch (error) {
    console.error('Error in updateCourse:', error)
    throw error
  }
}

export async function deleteCourse(id: number) {
  try {
    const result = await pool.query('DELETE FROM Course WHERE id = $1', [id])
    return result.rowCount
  } catch (error) {
    console.error('Error in deleteCourse:', error)
    throw error
  }
}

export function searchCourses(filters: CourseSearchFilters): { courses: Course[]; total: number } {
  try {
    const query = filters.query?.trim().toLowerCase() ?? ''
    const season = filters.term ? parseTermSeason(filters.term) : null

    const courses = COURSE_CATALOG.filter(course => {
      if (query.length > 0) {
        const haystack = `${course.code} ${course.title} ${course.description}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      if (season && !course.offeredTerms.includes(season)) return false
      if (typeof filters.minCredits === 'number' && !Number.isNaN(filters.minCredits)) {
        if (course.credits < filters.minCredits) return false
      }
      if (typeof filters.maxCredits === 'number' && !Number.isNaN(filters.maxCredits)) {
        if (course.credits > filters.maxCredits) return false
      }
      return true
    }).sort((a, b) => a.code.localeCompare(b.code))

    return { courses, total: courses.length }
  } catch (error) {
    console.error('Error in searchCourses:', error)
    throw error
  }
}

export function listCoursePrerequisites() {
  try {
    return COURSE_CATALOG.map(course => ({
      code: course.code,
      prerequisiteText: course.prerequisiteText ?? null,
      prerequisiteRule: course.prerequisiteRule ?? null,
      requiresManualCheck: Boolean(course.requiresManualCheck),
    }))
  } catch (error) {
    console.error('Error in listCoursePrerequisites:', error)
    throw error
  }
}

export function getCoursePrerequisites(code: string) {
  try {
    const normalizedCode = normalizeCourseCode(code)
    const course = COURSE_CATALOG.find(item => item.code === normalizedCode)
    if (!course) return null

    return {
      code: course.code,
      prerequisiteText: course.prerequisiteText ?? null,
      prerequisiteRule: course.prerequisiteRule ?? null,
      requiresManualCheck: Boolean(course.requiresManualCheck),
    }
  } catch (error) {
    console.error('Error in getCoursePrerequisites:', error)
    throw error
  }
}

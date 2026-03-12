import { randomUUID } from 'crypto'

import { normalizeCourseCode } from '@/features/courses/utils/normalize-course-code'
import { PlanDraft, SavedPlan } from '@/features/plans/interfaces/plan'
import pool from '@/lib/postgres'

interface PlanRow {
  id: number
  public_id: string
  plan_name: string
  owner_key: string | null
  term_layout: unknown
  completed_courses: unknown
  expected_grades: unknown
  saved_at: Date | string
}

interface CourseRow {
  id: number
  code: string
}

export interface SavePlanInput {
  id?: string
  name: string
  ownerKey?: string | null
  plan: PlanDraft
}

export async function listPlans(ownerKey?: string | null) {
  try {
    const values: unknown[] = []
    const whereClause = ownerKey
      ? (() => {
          values.push(ownerKey)
          return 'WHERE owner_key = $1'
        })()
      : ''

    const result = await pool.query(
      `SELECT id, public_id, plan_name, owner_key, term_layout, completed_courses, expected_grades, saved_at
       FROM Plan
       ${whereClause}
       ORDER BY saved_at DESC`,
      values
    )

    return result.rows.map(row => {
      const plan = mapPlanRow(row as PlanRow)
      return {
        id: plan.id,
        name: plan.name,
        savedAt: plan.savedAt,
      }
    })
  } catch (error) {
    console.error('Error in listPlans:', error)
    throw error
  }
}

export async function getPlanById(id: string, ownerKey?: string | null): Promise<SavedPlan | null> {
  try {
    const values: unknown[] = [id]
    const ownerFilter = ownerKey
      ? (() => {
          values.push(ownerKey)
          return 'AND owner_key = $2'
        })()
      : ''

    const result = await pool.query(
      `SELECT id, public_id, plan_name, owner_key, term_layout, completed_courses, expected_grades, saved_at
       FROM Plan
       WHERE public_id = $1 ${ownerFilter}
       LIMIT 1`,
      values
    )

    if (result.rows.length === 0) {
      return null
    }

    return mapPlanRow(result.rows[0] as PlanRow)
  } catch (error) {
    console.error('Error in getPlanById:', error)
    throw error
  }
}

export async function savePlan(input: SavePlanInput): Promise<SavedPlan> {
  try {
    const publicId = input.id ?? randomUUID()
    const result = await pool.query(
      `INSERT INTO Plan (
         public_id,
         owner_key,
         plan_name,
         term_layout,
         completed_courses,
         expected_grades,
         saved_at,
         last_modified
       )
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (public_id) DO UPDATE SET
         owner_key = COALESCE(EXCLUDED.owner_key, Plan.owner_key),
         plan_name = EXCLUDED.plan_name,
         term_layout = EXCLUDED.term_layout,
         completed_courses = EXCLUDED.completed_courses,
         expected_grades = EXCLUDED.expected_grades,
         saved_at = CURRENT_TIMESTAMP,
         last_modified = CURRENT_TIMESTAMP
       RETURNING id, public_id, plan_name, owner_key, term_layout, completed_courses, expected_grades, saved_at`,
      [
        publicId,
        input.ownerKey ?? null,
        input.name.trim() || 'Untitled Plan',
        JSON.stringify(input.plan.terms),
        JSON.stringify(input.plan.completedCourses),
        JSON.stringify(input.plan.expectedGrades),
      ]
    )

    const row = result.rows[0] as PlanRow
    await syncPlanEntries(row.id, input.plan)
    return mapPlanRow(row)
  } catch (error) {
    console.error('Error in savePlan:', error)
    throw error
  }
}

export async function deletePlan(id: string, ownerKey?: string | null): Promise<boolean> {
  try {
    const values: unknown[] = [id]
    const ownerFilter = ownerKey
      ? (() => {
          values.push(ownerKey)
          return 'AND owner_key = $2'
        })()
      : ''

    const result = await pool.query(`DELETE FROM Plan WHERE public_id = $1 ${ownerFilter}`, values)

    return (result.rowCount ?? 0) > 0
  } catch (error) {
    console.error('Error in deletePlan:', error)
    throw error
  }
}

export function isValidPlanDraft(plan: PlanDraft): boolean {
  try {
    if (!Array.isArray(plan.terms) || !Array.isArray(plan.completedCourses)) {
      return false
    }

    return plan.terms.every(term => {
      return (
        typeof term.id === 'string' &&
        typeof term.label === 'string' &&
        typeof term.season === 'string' &&
        typeof term.year === 'number' &&
        Array.isArray(term.courses) &&
        term.courses.every(code => typeof code === 'string')
      )
    })
  } catch (error) {
    console.error('Error in isValidPlanDraft:', error)
    return false
  }
}

async function syncPlanEntries(planId: number, plan: PlanDraft) {
  const desiredCodes = Array.from(
    new Set(plan.terms.flatMap(term => term.courses.map(normalizeCourseCode)))
  )

  if (desiredCodes.length === 0) {
    await pool.query('DELETE FROM Plan_Entry WHERE plan_id = $1', [planId])
    return
  }

  const courseResult = await pool.query(
    'SELECT id, code FROM Course WHERE code = ANY($1::text[])',
    [desiredCodes]
  )
  const courseRows = courseResult.rows as CourseRow[]
  const courseIdByCode = new Map(courseRows.map(row => [normalizeCourseCode(row.code), row.id]))

  await pool.query('DELETE FROM Plan_Entry WHERE plan_id = $1', [planId])

  for (const term of plan.terms) {
    for (const rawCode of term.courses) {
      const code = normalizeCourseCode(rawCode)
      const courseId = courseIdByCode.get(code)

      if (!courseId) {
        continue
      }

      await pool.query(
        `INSERT INTO Plan_Entry (plan_id, course_id, term, academic_year)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (plan_id, course_id) DO UPDATE SET
           term = EXCLUDED.term,
           academic_year = EXCLUDED.academic_year`,
        [planId, courseId, term.season, term.year]
      )
    }
  }
}

function mapPlanRow(row: PlanRow): SavedPlan {
  return {
    id: row.public_id,
    name: row.plan_name,
    savedAt: new Date(row.saved_at).toISOString(),
    plan: {
      terms: parseJsonArray(row.term_layout),
      completedCourses: parseJsonArray(row.completed_courses),
      expectedGrades: parseJsonRecord(row.expected_grades),
    },
  }
}

function parseJsonArray<T>(value: unknown): T[] {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value
  return Array.isArray(parsed) ? (parsed as T[]) : []
}

function parseJsonRecord<T extends Record<string, unknown>>(value: unknown): T {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as T) : ({} as T)
}

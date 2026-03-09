import pool from '@/src/db/db'

export interface PlanEntry {
  id: number
  plan_id: number
  course_id: number
  term: string
  academic_year: number
}

export async function getPlanEntries(plan_id: number) {
  try {
    const result = await pool.query(
      `SELECT id, plan_id, course_id, term, academic_year
       FROM Plan_Entry
       WHERE plan_id = $1
       ORDER BY academic_year, term`,
      [plan_id]
    )
    return result.rows as PlanEntry[]
  } catch (error) {
    console.error('Error in getPlanEntries:', error)
    throw error
  }
}

export async function addPlanEntry(
  plan_id: number,
  course_id: number,
  term: string,
  academic_year: number
) {
  try {
    const result = await pool.query(
      `INSERT INTO Plan_Entry (plan_id, course_id, term, academic_year)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (plan_id, course_id) DO NOTHING
       RETURNING *`,
      [plan_id, course_id, term, academic_year]
    )
    return (result.rows[0] as PlanEntry) ?? null
  } catch (error) {
    console.error('Error in addPlanEntry:', error)
    throw error
  }
}

export async function updatePlanEntry(id: number, term?: string, academic_year?: number) {
  try {
    const result = await pool.query(
      `UPDATE Plan_Entry SET
        term = COALESCE($1, term),
        academic_year = COALESCE($2, academic_year)
       WHERE id = $3 RETURNING *`,
      [term ?? null, academic_year ?? null, id]
    )
    return (result.rows[0] as PlanEntry) ?? null
  } catch (error) {
    console.error('Error in updatePlanEntry:', error)
    throw error
  }
}

export async function deletePlanEntry(id: number) {
  try {
    const result = await pool.query('DELETE FROM Plan_Entry WHERE id = $1', [id])
    return result.rowCount
  } catch (error) {
    console.error('Error in deletePlanEntry:', error)
    throw error
  }
}

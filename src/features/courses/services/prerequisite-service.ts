import pool from '@/lib/postgres'

export async function getPrerequisitesByCourse(course_id: number) {
  try {
    const result = await pool.query('SELECT * FROM Prerequisites WHERE course_id = $1', [course_id])
    return result.rows
  } catch (error) {
    console.error('Error in getPrerequisitesByCourse:', error)
    throw error
  }
}

export async function createPrerequisite(
  course_id: number,
  rule_type: string,
  rule_json: object,
  raw_text?: string
) {
  try {
    const result = await pool.query(
      'INSERT INTO Prerequisites (course_id, rule_type, rule_json, raw_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [course_id, rule_type, JSON.stringify(rule_json), raw_text ?? null]
    )
    return result.rows[0]
  } catch (error) {
    console.error('Error in createPrerequisite:', error)
    throw error
  }
}

export async function deletePrerequisite(course_id: number) {
  try {
    const result = await pool.query('DELETE FROM Prerequisites WHERE course_id = $1', [course_id])
    return result.rowCount
  } catch (error) {
    console.error('Error in deletePrerequisite:', error)
    throw error
  }
}

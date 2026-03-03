import pool from '@/src/db/db'

export async function getAllCourses() {
  const result = await pool.query('SELECT * FROM Course ORDER BY code')
  return result.rows
}

export async function getCourseById(id: number) {
  const result = await pool.query('SELECT * FROM Course WHERE id = $1', [id])
  return result.rows[0] ?? null
}

export async function getCourseByCode(code: string) {
  const result = await pool.query('SELECT * FROM Course WHERE code = $1', [code])
  return result.rows[0] ?? null
}

export async function createCourse(
  title: string,
  code: string,
  credits: number,
  description?: string
) {
  const result = await pool.query(
    'INSERT INTO Course (title, code, credits, description) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, code, credits, description ?? null]
  )
  return result.rows[0]
}

export async function updateCourse(
  id: number,
  title?: string,
  code?: string,
  credits?: number,
  description?: string
) {
  const result = await pool.query(
    `UPDATE Course SET
      title = COALESCE($1, title),
      code = COALESCE($2, code),
      credits = COALESCE($3, credits),
      description = COALESCE($4, description)
     WHERE id = $5 RETURNING *`,
    [title ?? null, code ?? null, credits ?? null, description ?? null, id]
  )
  return result.rows[0] ?? null
}

export async function deleteCourse(id: number) {
  const result = await pool.query('DELETE FROM Course WHERE id = $1', [id])
  return result.rowCount
}

import pool from '@/src/db/db'

export async function getStudentMajors(user_id?: number) {
  if (user_id) {
    const result = await pool.query(
      `SELECT sm.user_id, sm.major_id, m.name AS major_name, m.department
       FROM Student_Majors sm
       JOIN Major m ON sm.major_id = m.id
       WHERE sm.user_id = $1`,
      [user_id]
    )
    return result.rows
  }

  const result = await pool.query(
    `SELECT sm.user_id, sm.major_id, m.name AS major_name, m.department
     FROM Student_Majors sm
     JOIN Major m ON sm.major_id = m.id`
  )
  return result.rows
}

export async function assignMajorToStudent(user_id: number, major_id: number) {
  const result = await pool.query(
    'INSERT INTO Student_Majors (user_id, major_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
    [user_id, major_id]
  )
  return result.rowCount
}

export async function removeMajorFromStudent(user_id: number, major_id: number) {
  const result = await pool.query(
    'DELETE FROM Student_Majors WHERE user_id = $1 AND major_id = $2',
    [user_id, major_id]
  )
  return result.rowCount
}

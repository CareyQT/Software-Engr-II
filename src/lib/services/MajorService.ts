import pool from '@/src/db/db'

export async function getAllMajors() {
  const result = await pool.query('SELECT * FROM Major ORDER BY name')
  return result.rows
}

export async function getMajorById(id: number) {
  const result = await pool.query('SELECT * FROM Major WHERE id = $1', [id])
  return result.rows[0] ?? null
}

export async function createMajor(name: string, department?: string) {
  const result = await pool.query(
    'INSERT INTO Major (name, department) VALUES ($1, $2) RETURNING *',
    [name, department ?? null]
  )
  return result.rows[0]
}

export async function deleteMajor(id: number) {
  const result = await pool.query('DELETE FROM Major WHERE id = $1', [id])
  return result.rowCount
}

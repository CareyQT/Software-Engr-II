import pool from '@/src/db/db'

export interface Major {
  id: number
  name: string
  department: string | null
}

export async function getAllMajors() {
  const result = await pool.query('SELECT * FROM Major ORDER BY name')
  return result.rows as Major[]
}

export async function getMajorById(id: number) {
  const result = await pool.query('SELECT * FROM Major WHERE id = $1', [id])
  return (result.rows[0] as Major) ?? null
}

export async function createMajor(name: string, department?: string) {
  const result = await pool.query(
    'INSERT INTO Major (name, department) VALUES ($1, $2) RETURNING *',
    [name, department ?? null]
  )
  return result.rows[0] as Major
}

export async function deleteMajor(id: number) {
  const result = await pool.query('DELETE FROM Major WHERE id = $1', [id])
  return result.rowCount
}

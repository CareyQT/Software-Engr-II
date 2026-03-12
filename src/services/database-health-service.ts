import pool from '@/lib/postgres'

export async function checkDatabaseConnection() {
  const result = await pool.query('SELECT NOW()')
  return result.rows[0]
}

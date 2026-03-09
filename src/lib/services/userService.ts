import pool from '@/src/db/db'

// Defines the Map of what a User looks like
export interface User {
  id: number
  onid: string
  email: string
  created_at: string
}

export async function getAllUsers() {
  const result = await pool.query('SELECT id, onid, email, created_at FROM Users ORDER BY id')
  return result.rows as User[]
}

export async function getUserById(id: number) {
  const result = await pool.query('SELECT id, onid, email, created_at FROM Users WHERE id = $1', [
    id,
  ])
  const rows = result.rows as User[]
  return rows[0] ?? null
}

export async function createUser(onid: string, email: string, password_hash: string) {
  const result = await pool.query(
    'INSERT INTO Users (onid, email, password_hash) VALUES ($1, $2, $3) RETURNING id, onid, email, created_at',
    [onid, email, password_hash]
  )
  return result.rows[0] as User
}

export async function deleteUser(id: number) {
  const result = await pool.query('DELETE FROM Users WHERE id = $1', [id])
  return result.rowCount
}

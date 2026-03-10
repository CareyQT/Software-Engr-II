import pool from '@/src/db/db'

export interface User {
  id: number
  onid: string
  email: string
  created_at: string
}
/**
 * User Service
 *
 * Handles all database operations for the Users table.
 * Provides functions to retrieve all users, find a user by ID,
 * create a new user, and delete a user by ID.
 *
 *
 * Used by: /api/users/route.ts
 */

export async function getAllUsers() {
  try {
    const result = await pool.query('SELECT id, onid, email, created_at FROM Users ORDER BY id')
    return result.rows as User[]
  } catch (error) {
    console.error('Error in getAllUsers:', error)
    throw error
  }
}

export async function getUserById(id: number) {
  try {
    const result = await pool.query('SELECT id, onid, email, created_at FROM Users WHERE id = $1', [
      id,
    ])
    const rows = result.rows as User[]
    return rows[0] ?? null
  } catch (error) {
    console.error('Error in getUserById:', error)
    throw error
  }
}

export async function createUser(onid: string, email: string, password_hash: string) {
  try {
    const result = await pool.query(
      'INSERT INTO Users (onid, email, password_hash) VALUES ($1, $2, $3) RETURNING id, onid, email, created_at',
      [onid, email, password_hash]
    )
    return result.rows[0] as User
  } catch (error) {
    console.error('Error in createUser:', error)
    throw error
  }
}

export async function deleteUser(id: number) {
  try {
    const result = await pool.query('DELETE FROM Users WHERE id = $1', [id])
    return result.rowCount
  } catch (error) {
    console.error('Error in deleteUser:', error)
    throw error
  }
}

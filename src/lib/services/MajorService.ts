import pool from '@/src/db/db'

export interface Major {
  id: number
  name: string
  department: string | null
}
/**
 * Major Service
 *
 * Handles all database operations for the Major table.
 * Provides functions to retrieve all majors, find a major by ID,
 * create a new major with an optional department, and delete a major.
 *
 * Used by: /api/majors/route.ts
 */

export async function getAllMajors() {
  try {
    const result = await pool.query('SELECT * FROM Major ORDER BY name')
    return result.rows as Major[]
  } catch (error) {
    console.error('Error in getAllMajors:', error)
    throw error
  }
}

export async function getMajorById(id: number) {
  try {
    const result = await pool.query('SELECT * FROM Major WHERE id = $1', [id])
    return (result.rows[0] as Major) ?? null
  } catch (error) {
    console.error('Error in getMajorById:', error)
    throw error
  }
}

export async function createMajor(name: string, department?: string) {
  try {
    const result = await pool.query(
      'INSERT INTO Major (name, department) VALUES ($1, $2) RETURNING *',
      [name, department ?? null]
    )
    return result.rows[0] as Major
  } catch (error) {
    console.error('Error in createMajor:', error)
    throw error
  }
}

export async function deleteMajor(id: number) {
  try {
    const result = await pool.query('DELETE FROM Major WHERE id = $1', [id])
    return result.rowCount
  } catch (error) {
    console.error('Error in deleteMajor:', error)
    throw error
  }
}

import pool from '@/lib/postgres'

export async function getOfferingsByCourse(course_id: number) {
  try {
    const result = await pool.query(
      'SELECT * FROM Offering WHERE course_id = $1 ORDER BY year, term',
      [course_id]
    )
    return result.rows
  } catch (error) {
    console.error('Error in getOfferingsByCourse:', error)
    throw error
  }
}

export async function createOffering(
  course_id: number,
  term: string,
  year: number,
  campus?: string
) {
  try {
    const result = await pool.query(
      'INSERT INTO Offering (course_id, term, year, campus) VALUES ($1, $2, $3, $4) RETURNING *',
      [course_id, term, year, campus ?? null]
    )
    return result.rows[0]
  } catch (error) {
    console.error('Error in createOffering:', error)
    throw error
  }
}

export async function deleteOffering(course_id: number, term: string, year: number) {
  try {
    const result = await pool.query(
      'DELETE FROM Offering WHERE course_id = $1 AND term = $2 AND year = $3',
      [course_id, term, year]
    )
    return result.rowCount
  } catch (error) {
    console.error('Error in deleteOffering:', error)
    throw error
  }
}

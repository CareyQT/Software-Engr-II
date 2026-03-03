import pool from '@/src/db/db'

export async function getPlans(user_id?: number) {
  if (user_id) {
    const result = await pool.query(
      'SELECT * FROM Plan WHERE user_id = $1 ORDER BY last_modified DESC',
      [user_id]
    )
    return result.rows
  }

  const result = await pool.query('SELECT * FROM Plan ORDER BY last_modified DESC')
  return result.rows
}

export async function getPlanById(id: number) {
  const result = await pool.query('SELECT * FROM Plan WHERE id = $1', [id])
  return result.rows[0] ?? null
}

export async function createPlan(user_id: number, plan_name?: string) {
  const result = await pool.query(
    'INSERT INTO Plan (user_id, plan_name) VALUES ($1, $2) RETURNING *',
    [user_id, plan_name ?? 'My Academic Plan']
  )
  return result.rows[0]
}

export async function updatePlan(id: number, plan_name: string) {
  const result = await pool.query(
    'UPDATE Plan SET plan_name = $1, last_modified = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [plan_name, id]
  )
  return result.rows[0] ?? null
}

export async function deletePlan(id: number) {
  const result = await pool.query('DELETE FROM Plan WHERE id = $1', [id])
  return result.rowCount
}

import { PoolClient } from 'pg'

import pool from '@/lib/postgres'

let client: PoolClient

export async function beginTransaction() {
  client = await pool.connect()
  await client.query('BEGIN')
  return client
}

export async function rollbackTransaction() {
  if (!client) {
    return
  }

  await client.query('ROLLBACK')
  client.release()
}

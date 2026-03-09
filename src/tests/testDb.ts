import { PoolClient } from 'pg'
import pool from '../db/db'

let client: PoolClient

export async function beginTransaction() {
  client = await pool.connect()
  await client.query('BEGIN')
  return client
}

export async function rollbackTransaction() {
  await client.query('ROLLBACK')
  client.release()
}

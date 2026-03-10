import { NextResponse } from 'next/server'
import pool from '@/src/db/db'

export const dynamic = 'force-static' //

export async function GET() {
  try {
    // We ask the DB for the current time. If it answers, the connection is good.
    const result = await pool.query('SELECT NOW()')
    return NextResponse.json({ success: true, time: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Database not connected!' }, { status: 500 })
  }
}

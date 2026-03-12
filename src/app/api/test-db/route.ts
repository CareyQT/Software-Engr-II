import { NextResponse } from 'next/server'
import { checkDatabaseConnection } from '@/services/database-health-service'

export async function GET() {
  try {
    const time = await checkDatabaseConnection()
    return NextResponse.json({ success: true, time })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Database not connected!' }, { status: 500 })
  }
}

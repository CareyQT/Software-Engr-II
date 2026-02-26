import { NextRequest } from 'next/server'
import { getUser_by_id } from '@/lib/services/userService'

export async function GET() {
  try {
    const users = await getUser_by_id()
    return Response.json(users, { status: 200 })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

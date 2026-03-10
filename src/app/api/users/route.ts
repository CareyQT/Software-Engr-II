import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers, createUser } from '../../../lib/services/userService'
/**
 * Users API Route — /api/users
 *
 * GET    — Returns a list of all registered users.
 * POST   — Creates a new user. Requires onid, email, and password_hash.
 *
 * Delegates all database logic to user_service.ts.
 */

export async function GET() {
  try {
    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { onid, email, password_hash } = await req.json()

    if (!onid || !email || !password_hash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await createUser(onid, email, password_hash)
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

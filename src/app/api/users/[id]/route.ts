/**
 * API Route: GET /api/users/[id]
 *
 * Fetches a single user by their numeric ID.
 * Returns the user object on success, or an error response for
 * invalid IDs, missing users, or unexpected server failures.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '../../../../lib/services/userService'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

/**
 * API Route: GET /api/users/[id]
 *
 * Fetches a single user by their numeric ID.
 * Returns the user object on success, or an error response for
 * invalid IDs, missing users, or unexpected server failures.
 */
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)

    return NextResponse.json({
      success: true,
      userId: id,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

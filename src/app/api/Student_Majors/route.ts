import { NextRequest, NextResponse } from 'next/server'
import {
  getStudentMajors,
  assignMajorToStudent,
  removeMajorFromStudent,
} from '../../../lib/services/StudentMajor'

/**
 * Student Majors API Route — /api/student-majors
 *
 * GET    — Returns all major assignments. Accepts optional ?user_id query
 *          parameter to filter by a specific student.
 * POST   — Assigns a major to a student. Requires user_id and major_id.
 * DELETE — Removes a major from a student. Requires user_id and major_id.
 *
 * Delegates all database logic to student_major_service.ts.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')

    const data = await getStudentMajors(user_id ? Number(user_id) : undefined)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch student majors' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user_id, major_id } = await req.json()

    if (!user_id || !major_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, major_id' },
        { status: 400 }
      )
    }

    const rowCount = await assignMajorToStudent(user_id, major_id)
    if (rowCount === 0) {
      return NextResponse.json({ error: 'Major already assigned to student' }, { status: 409 })
    }

    return NextResponse.json({ message: 'Major assigned to student' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign major' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user_id, major_id } = await req.json()

    if (!user_id || !major_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, major_id' },
        { status: 400 }
      )
    }

    await removeMajorFromStudent(user_id, major_id)
    return NextResponse.json({ message: 'Major removed from student' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove major' }, { status: 500 })
  }
}

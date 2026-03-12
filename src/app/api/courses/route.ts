import { NextRequest, NextResponse } from 'next/server'
import {
  searchCourses,
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '@/features/courses/services/course-service'

/**
 * Courses API Route — /api/courses
 *
 * GET    — Returns a list of all courses ordered by course code.
 * POST   — Creates a new course. Requires title, code, and credits.
 *          description is optional.
 * PATCH  — Updates one or more fields of a course. Requires id.
 * DELETE — Deletes a course by ID.
 *
 * Delegates all database logic to course_service.ts.
 */
export async function GET(request: NextRequest) {
  try {
    const useCatalog = request.nextUrl.searchParams.get('catalog') === '1'
    const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''
    const department = request.nextUrl.searchParams.get('department')?.trim() ?? undefined
    const term = request.nextUrl.searchParams.get('term')?.trim() ?? undefined
    const minCredits = Number.parseInt(request.nextUrl.searchParams.get('minCredits') ?? '', 10)
    const maxCredits = Number.parseInt(request.nextUrl.searchParams.get('maxCredits') ?? '', 10)

    const hasSearchParams =
      useCatalog ||
      query ||
      department ||
      term ||
      !Number.isNaN(minCredits) ||
      !Number.isNaN(maxCredits)

    if (hasSearchParams) {
      const result = searchCourses({
        department,
        query,
        term,
        minCredits: Number.isNaN(minCredits) ? undefined : minCredits,
        maxCredits: Number.isNaN(maxCredits) ? undefined : maxCredits,
      })
      return NextResponse.json(result)
    }

    const courses = await getAllCourses()
    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, code, credits, description } = await req.json()
    if (!title || !code || !credits) {
      return NextResponse.json(
        { error: 'Missing required fields: title, code, credits' },
        { status: 400 }
      )
    }
    const course = await createCourse(title, code, credits, description)
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, title, code, credits, description } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 })
    }
    const course = await updateCourse(id, title, code, credits, description)
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 })
    const rowCount = await deleteCourse(id)
    if (rowCount === 0) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    return NextResponse.json({ message: 'Course deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}

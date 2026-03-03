import { NextRequest, NextResponse } from 'next/server'
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../../../lib/services/CourseService'

export async function GET() {
  try {
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

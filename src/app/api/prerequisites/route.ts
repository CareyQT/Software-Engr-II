import { NextRequest, NextResponse } from 'next/server'
import { getCoursePrerequisites, listCoursePrerequisites } from '@/src/lib/services/CourseService'
import {
  getPrerequisitesByCourse,
  createPrerequisite,
  deletePrerequisite,
} from '../../../lib/services/PrereqService'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const course_id = searchParams.get('course_id')
    const code = searchParams.get('code')

    // Handle code-based lookup (from main)
    if (code) {
      const prerequisiteInfo = getCoursePrerequisites(code)
      if (!prerequisiteInfo) {
        return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
      }
      return NextResponse.json(prerequisiteInfo, { status: 200 })
    }

    // Handle course_id-based lookup (from your branch)
    if (!course_id) {
      return NextResponse.json(
        { error: 'Missing required query param: course_id or code' },
        { status: 400 }
      )
    }
    const prereqs = await getPrerequisitesByCourse(Number(course_id))
    return NextResponse.json(prereqs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prerequisites' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { course_id, rule_type, rule_json, raw_text } = await req.json()
    if (!course_id || !rule_type || !rule_json) {
      return NextResponse.json(
        { error: 'Missing required fields: course_id, rule_type, rule_json' },
        { status: 400 }
      )
    }
    const prereq = await createPrerequisite(course_id, rule_type, rule_json, raw_text)
    return NextResponse.json(prereq, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create prerequisite' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { course_id } = await req.json()
    if (!course_id)
      return NextResponse.json({ error: 'Missing required field: course_id' }, { status: 400 })
    await deletePrerequisite(course_id)
    return NextResponse.json({ message: 'Prerequisites deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete prerequisites' }, { status: 500 })
  }
}

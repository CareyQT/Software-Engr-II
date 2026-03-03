import { NextRequest } from 'next/server'

import { getCoursePrerequisites, listCoursePrerequisites } from '@/src/lib/services/courseService'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (code) {
    const prerequisiteInfo = getCoursePrerequisites(code)
    if (!prerequisiteInfo) {
      return Response.json({ error: 'Course not found.' }, { status: 404 })
    }

    return Response.json(prerequisiteInfo, { status: 200 })
  }

  return Response.json(listCoursePrerequisites(), { status: 200 })
}

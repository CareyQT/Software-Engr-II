import { NextRequest } from 'next/server'

import { searchCourses } from '@/src/lib/services/courseService'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  const term = request.nextUrl.searchParams.get('term')?.trim() ?? undefined
  const minCredits = Number.parseInt(request.nextUrl.searchParams.get('minCredits') ?? '', 10)
  const maxCredits = Number.parseInt(request.nextUrl.searchParams.get('maxCredits') ?? '', 10)

  const result = searchCourses({
    query,
    term,
    minCredits: Number.isNaN(minCredits) ? undefined : minCredits,
    maxCredits: Number.isNaN(maxCredits) ? undefined : maxCredits,
  })

  return Response.json(result)
}

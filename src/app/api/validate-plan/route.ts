import { NextRequest } from 'next/server'

import { isPlanValidationRequest, validateStudentPlan } from '@/src/lib/services/validationService'
import { PlanValidationRequest } from '@/src/lib/termwise/types'

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<PlanValidationRequest>

    if (!isPlanValidationRequest(payload)) {
      return Response.json(
        {
          error: 'Invalid payload. Expected terms[] and completedCourses[].',
        },
        { status: 400 }
      )
    }

    const result = validateStudentPlan({
      terms: payload.terms,
      completedCourses: payload.completedCourses,
      allowConcurrentEnrollment: Boolean(payload.allowConcurrentEnrollment),
    })

    return Response.json(result, { status: 200 })
  } catch {
    return Response.json(
      {
        error: 'Failed to validate plan.',
      },
      { status: 500 }
    )
  }
}

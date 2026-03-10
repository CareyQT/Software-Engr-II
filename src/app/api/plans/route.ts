import { NextRequest } from 'next/server'

import {
  deletePlan,
  getPlanById,
  isValidPlanDraft,
  listPlans,
  savePlan,
} from '@/src/lib/services/planService'
import { PlanDraft } from '@/src/lib/termwise/types'

export const dynamic = 'force-static' //

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (id) {
    const plan = getPlanById(id)
    if (!plan) {
      return Response.json({ error: 'Plan not found.' }, { status: 404 })
    }
    return Response.json(plan, { status: 200 })
  }

  return Response.json({ plans: listPlans() }, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as { name?: string; plan?: PlanDraft; id?: string }
    if (!payload || typeof payload.name !== 'string' || !payload.plan) {
      return Response.json(
        {
          error: 'Invalid payload. Expected name and plan.',
        },
        { status: 400 }
      )
    }

    if (!isValidPlanDraft(payload.plan)) {
      return Response.json(
        {
          error: 'Plan format is invalid.',
        },
        { status: 400 }
      )
    }

    const savedPlan = savePlan({
      id: payload.id,
      name: payload.name,
      plan: payload.plan,
    })
    return Response.json(savedPlan, { status: 201 })
  } catch {
    return Response.json({ error: 'Failed to save plan.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return Response.json({ error: 'Missing id query parameter.' }, { status: 400 })
  }

  const deleted = deletePlan(id)
  if (!deleted) {
    return Response.json({ error: 'Plan not found.' }, { status: 404 })
  }

  return Response.json({ success: true }, { status: 200 })
}

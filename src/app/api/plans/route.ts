import { NextRequest } from 'next/server'

import {
  deletePlan,
  getPlanById,
  isValidPlanDraft,
  listPlans,
  savePlan,
} from '@/src/lib/services/planService'
import { PlanDraft } from '@/src/lib/termwise/types'

/**
 * Plans API Route — /api/plans
 *
 * GET    — Returns all plans. Accepts optional ?user_id query parameter
 *          to filter by a specific user.
 * POST   — Creates a new plan. Requires user_id, plan_name is optional.
 * PATCH  — Updates a plan's name. Requires id and plan_name.
 * DELETE — Deletes a plan by ID. Cascades to all associated plan entries.
 *
 * Delegates all database logic to plan_service.ts.
 */
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

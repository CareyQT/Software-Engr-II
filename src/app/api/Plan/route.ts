import { NextRequest, NextResponse } from 'next/server'
import { getPlans, createPlan, updatePlan, deletePlan } from '../../..//lib/services/PlanService'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')

    const plans = await getPlans(user_id ? Number(user_id) : undefined)
    return NextResponse.json(plans)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user_id, plan_name } = await req.json()

    if (!user_id) {
      return NextResponse.json({ error: 'Missing required field: user_id' }, { status: 400 })
    }

    const plan = await createPlan(user_id, plan_name)
    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, plan_name } = await req.json()

    if (!id || !plan_name) {
      return NextResponse.json({ error: 'Missing required fields: id, plan_name' }, { status: 400 })
    }

    const plan = await updatePlan(id, plan_name)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    return NextResponse.json(plan)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 })
    }

    const rowCount = await deletePlan(id)
    if (rowCount === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Plan deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
  }
}

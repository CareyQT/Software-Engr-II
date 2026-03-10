import { NextRequest, NextResponse } from 'next/server'
import {
  getPlanEntries,
  addPlanEntry,
  updatePlanEntry,
  deletePlanEntry,
} from '../../../lib/services/Plan_Entry'

const VALID_TERMS = ['Fall', 'Winter', 'Spring', 'Summer']

export const dynamic = 'force-static'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const plan_id = searchParams.get('plan_id')

    if (!plan_id) {
      return NextResponse.json({ error: 'Missing required query param: plan_id' }, { status: 400 })
    }

    const entries = await getPlanEntries(Number(plan_id))
    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plan entries' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { plan_id, course_id, term, academic_year } = await req.json()

    if (!plan_id || !course_id || !term || !academic_year) {
      return NextResponse.json(
        { error: 'Missing required fields: plan_id, course_id, term, academic_year' },
        { status: 400 }
      )
    }

    if (!VALID_TERMS.includes(term)) {
      return NextResponse.json(
        { error: `Invalid term. Must be one of: ${VALID_TERMS.join(', ')}` },
        { status: 400 }
      )
    }

    const entry = await addPlanEntry(plan_id, course_id, term, academic_year)
    if (!entry) {
      return NextResponse.json({ error: 'Course already exists in this plan' }, { status: 409 })
    }

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add course to plan' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, term, academic_year } = await req.json()

    if (!id || (!term && !academic_year)) {
      return NextResponse.json(
        { error: 'Missing required fields: id and at least one of term or academic_year' },
        { status: 400 }
      )
    }

    if (term && !VALID_TERMS.includes(term)) {
      return NextResponse.json(
        { error: `Invalid term. Must be one of: ${VALID_TERMS.join(', ')}` },
        { status: 400 }
      )
    }

    const entry = await updatePlanEntry(id, term, academic_year)
    if (!entry) {
      return NextResponse.json({ error: 'Plan entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update plan entry' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 })
    }

    const rowCount = await deletePlanEntry(id)
    if (rowCount === 0) {
      return NextResponse.json({ error: 'Plan entry not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Course removed from plan' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove course from plan' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import {
  getOfferingsByCourse,
  createOffering,
  deleteOffering,
} from '../../../lib/services/OfferingService'

/**
 * Offerings API Route — /api/offerings
 *
 * GET    — Returns all offerings for a course. Requires ?course_id query parameter.
 * POST   — Creates a new offering. Requires course_id, term, and year.
 *          campus is optional.
 * DELETE — Deletes an offering. Requires course_id, term, and year.
 *
 * Delegates all database logic to offering_service.ts.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const course_id = searchParams.get('course_id')
    if (!course_id)
      return NextResponse.json(
        { error: 'Missing required query param: course_id' },
        { status: 400 }
      )
    const offerings = await getOfferingsByCourse(Number(course_id))
    return NextResponse.json(offerings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch offerings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { course_id, term, year, campus } = await req.json()
    if (!course_id || !term || !year) {
      return NextResponse.json(
        { error: 'Missing required fields: course_id, term, year' },
        { status: 400 }
      )
    }
    const offering = await createOffering(course_id, term, year, campus)
    return NextResponse.json(offering, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create offering' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { course_id, term, year } = await req.json()
    if (!course_id || !term || !year) {
      return NextResponse.json(
        { error: 'Missing required fields: course_id, term, year' },
        { status: 400 }
      )
    }
    await deleteOffering(course_id, term, year)
    return NextResponse.json({ message: 'Offering deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete offering' }, { status: 500 })
  }
}

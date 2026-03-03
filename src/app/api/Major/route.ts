import { NextRequest, NextResponse } from 'next/server'
import { getAllMajors, createMajor } from '../../../lib/services/MajorService'

export async function GET() {
  try {
    const majors = await getAllMajors()
    return NextResponse.json(majors)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch majors' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, department } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 })
    }

    const major = await createMajor(name, department)
    return NextResponse.json(major, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create major' }, { status: 500 })
  }
}

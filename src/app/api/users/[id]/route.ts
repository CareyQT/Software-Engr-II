import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // In Next.js 15, params is a Promise
) {
  try {
    const { id } = await context.params // You must await it before use

    return NextResponse.json({
      success: true,
      userId: id,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

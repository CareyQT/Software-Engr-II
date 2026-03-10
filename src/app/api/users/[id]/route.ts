import { NextRequest, NextResponse } from 'next/server'

// Forces the route to be treated as static during 'output: export'
export const dynamic = 'force-static'

// Required for dynamic [id] routes when using static export
export function generateStaticParams() {
  // Return an array of IDs you want to pre-render, or an empty array
  // if these are just placeholder routes for now.
  return [{ id: '1' }]
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params
    const id = parseInt(rawId)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      userId: id,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

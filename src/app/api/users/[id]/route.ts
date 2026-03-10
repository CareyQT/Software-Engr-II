import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js 15+ handles dynamic route parameters as Promises.
 * We must define the context with a Promise and await it before accessing the ID.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to extract the user ID safely
    const { id } = await context.params

    // Log for verification in dev mode
    console.log(`[API] Fetching data for user ID: ${id}`)

    // plan to fetch the user profile from Firestore later:
    // const userRef = doc(db, 'users', id);
    // const userSnap = await getDoc(userRef);

    // For now, returning a success response to pass the Husky type-check
    return NextResponse.json({
      success: true,
      userId: id,
      message: 'User route verified and compatible with Next.js 15',
    })
  } catch (error) {
    console.error('Error in User GET route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

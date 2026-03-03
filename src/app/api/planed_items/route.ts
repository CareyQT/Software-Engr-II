export async function GET() {
  return Response.json(
    {
      message: 'Use /api/plans for plan persistence operations.',
    },
    { status: 200 }
  )
}

import { NextRequest } from 'next/server'
import { getAllUsers, createUser } from '../../../lib/services/userService'

export async function GET() {
  try {
    const users = await getAllUsers()
    return Response.json(users, { status: 200 })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ONID, password } = await request.json()

    if (!ONID || !password) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    //implement hash function latter
    const hashedPassword = password
    const user = await createUser() //implement later

    return Response.json(user, { status: 201 })
  } catch (error) {
    return Response.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

import { beginTransaction, rollbackTransaction } from './testDb'
import { createUser, getAllUsers, deleteUser } from '../lib/services/userService'

beforeEach(async () => {
  await beginTransaction()
})

afterEach(async () => {
  await rollbackTransaction()
})

describe('User Service', () => {
  test('creates a user', async () => {
    const user = await createUser('doej', 'doej@oregonstate.edu', 'hashed_pw')
    expect(user.onid).toBe('doej')
    expect(user.email).toBe('doej@oregonstate.edu')
  })

  test('gets all users', async () => {
    await createUser('doej', 'doej@oregonstate.edu', 'hashed_pw')
    const users = await getAllUsers()
    expect(users.length).toBeGreaterThan(0)
  })

  test('deletes a user', async () => {
    const user = await createUser('doej', 'doej@oregonstate.edu', 'hashed_pw')
    const rowCount = await deleteUser(user.id)
    expect(rowCount).toBe(1)
  })
})

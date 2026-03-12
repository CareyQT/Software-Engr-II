const GUEST_ID_KEY = 'termwise:guest-id'

export function getOrCreateGuestSessionId() {
  if (typeof window === 'undefined') {
    return null
  }

  let id = localStorage.getItem(GUEST_ID_KEY)

  if (!id) {
    id = `guest_${crypto.randomUUID()}`
    localStorage.setItem(GUEST_ID_KEY, id)
  }

  return id
}

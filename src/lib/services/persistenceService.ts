import { SavedPlan } from '@/src/lib/termwise/types'
import { savePlanToFirebase, fetchUserPlansFromFirebase } from './plannerService'

const SAVED_PLANS_KEY = 'termwise:saved-plans'

export async function savePlanService(plan: SavedPlan, useCloud: boolean, userId: string | null) {
  try {
    // 1. Always update LocalStorage first as the primary source
    const localPlansRaw = localStorage.getItem(SAVED_PLANS_KEY)
    const localPlans = localPlansRaw ? JSON.parse(localPlansRaw) : []

    // Update or Add the plan in the local array
    const updatedLocal = [plan, ...localPlans.filter((p: any) => p.id !== plan.id)].sort((a, b) =>
      b.savedAt.localeCompare(a.savedAt)
    )

    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updatedLocal))

    // 2. Sync to Firebase if cloud is enabled and we have an ID
    if (useCloud && userId) {
      // We add the userId to the plan object so Firestore knows who owns it
      const planWithUser = { ...plan, userId }
      await savePlanToFirebase(planWithUser)
    }
  } catch (error) {
    console.error('Persistence Error:', error)
    throw error
  }
}

export async function loadPlansService(userId: string | null) {
  // 1. Get Local Plans
  const localPlansRaw = localStorage.getItem(SAVED_PLANS_KEY)
  const localPlans = localPlansRaw ? JSON.parse(localPlansRaw) : []

  // 2. If user is logged in, fetch Cloud Plans
  if (userId) {
    try {
      const cloudPlans = await fetchUserPlansFromFirebase(userId)
      // Merge logic: Combine both, prioritizing the most recently saved
      const combined = [...cloudPlans, ...localPlans]
      return combined.filter((plan, index, self) => index === self.findIndex(p => p.id === plan.id))
    } catch (error) {
      console.error('Cloud fetch failed, using local only.')
    }
  }

  return localPlans
}

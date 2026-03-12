import { SavedPlan } from '@/features/plans/interfaces/plan'

const SAVED_PLANS_KEY = 'termwise:saved-plans'

export async function savePlanService(
  plan: SavedPlan,
  useServer: boolean,
  ownerKey: string | null
) {
  try {
    const localPlans = readLocalPlans()
    const updatedLocalPlans = mergePlans([plan], localPlans)
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updatedLocalPlans))

    if (useServer && ownerKey) {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: plan.id,
          name: plan.name,
          ownerKey,
          plan: plan.plan,
        }),
      })

      if (!response.ok) {
        throw new Error('Plan sync failed.')
      }

      const savedPlan = (await response.json()) as SavedPlan
      const mergedPlans = mergePlans([savedPlan], updatedLocalPlans)
      localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(mergedPlans))
      return savedPlan
    }

    return plan
  } catch (error) {
    console.error('Persistence Error:', error)
    throw error
  }
}

export async function loadPlansService(ownerKey: string | null) {
  const localPlans = readLocalPlans()

  if (!ownerKey) {
    return localPlans
  }

  try {
    const plansResponse = await fetch(`/api/plans?ownerKey=${encodeURIComponent(ownerKey)}`, {
      cache: 'no-store',
    })

    if (!plansResponse.ok) {
      throw new Error('Failed to load remote plan list.')
    }

    const payload = (await plansResponse.json()) as {
      plans: Array<{ id: string; name: string; savedAt: string }>
    }

    const remotePlans = await Promise.all(
      payload.plans.map(async item => {
        const response = await fetch(
          `/api/plans?id=${encodeURIComponent(item.id)}&ownerKey=${encodeURIComponent(ownerKey)}`,
          {
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to load plan ${item.id}.`)
        }

        return (await response.json()) as SavedPlan
      })
    )

    const mergedPlans = mergePlans(remotePlans, localPlans)
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(mergedPlans))
    return mergedPlans
  } catch (error) {
    console.error('Remote load failed, using local plans only.', error)
    return localPlans
  }
}

function readLocalPlans(): SavedPlan[] {
  const rawValue = localStorage.getItem(SAVED_PLANS_KEY)
  return rawValue ? (JSON.parse(rawValue) as SavedPlan[]) : []
}

function mergePlans(primaryPlans: SavedPlan[], secondaryPlans: SavedPlan[]) {
  return [...primaryPlans, ...secondaryPlans]
    .filter(
      (plan, index, plans) => index === plans.findIndex(candidate => candidate.id === plan.id)
    )
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

import { randomUUID } from 'crypto'

import { PlanDraft, SavedPlan } from '@/src/lib/termwise/types'

type PlansStore = Map<string, SavedPlan>

const globalForPlans = globalThis as unknown as {
  termwisePlans?: PlansStore
}

const plansStore: PlansStore = globalForPlans.termwisePlans ?? new Map<string, SavedPlan>()
if (!globalForPlans.termwisePlans) {
  globalForPlans.termwisePlans = plansStore
}

export interface SavePlanInput {
  id?: string
  name: string
  plan: PlanDraft
}

export function listPlans() {
  return Array.from(plansStore.values())
    .map(plan => ({
      id: plan.id,
      name: plan.name,
      savedAt: plan.savedAt,
    }))
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

export function getPlanById(id: string): SavedPlan | null {
  return plansStore.get(id) ?? null
}

export function savePlan(input: SavePlanInput): SavedPlan {
  const id = input.id ?? randomUUID()
  const savedPlan: SavedPlan = {
    id,
    name: input.name.trim() || 'Untitled Plan',
    savedAt: new Date().toISOString(),
    plan: input.plan,
  }

  plansStore.set(id, savedPlan)
  return savedPlan
}

export function deletePlan(id: string): boolean {
  if (!plansStore.has(id)) {
    return false
  }

  plansStore.delete(id)
  return true
}

export function isValidPlanDraft(plan: PlanDraft): boolean {
  if (!Array.isArray(plan.terms) || !Array.isArray(plan.completedCourses)) {
    return false
  }

  return plan.terms.every(term => {
    return (
      typeof term.id === 'string' &&
      typeof term.label === 'string' &&
      typeof term.season === 'string' &&
      typeof term.year === 'number' &&
      Array.isArray(term.courses) &&
      term.courses.every(code => typeof code === 'string')
    )
  })
}

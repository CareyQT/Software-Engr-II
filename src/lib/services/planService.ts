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
/**
 * Plan Service
 *
 * Handles all database operations for the Plan table.
 * Provides functions to retrieve plans (optionally filtered by user),
 * find a plan by ID, create a new academic plan, update a plan name,
 * and delete a plan.

 *
 * Used by: /api/plans/route.ts
 */

export function listPlans() {
  try {
    return Array.from(plansStore.values())
      .map(plan => ({
        id: plan.id,
        name: plan.name,
        savedAt: plan.savedAt,
      }))
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
  } catch (error) {
    console.error('Error in listPlans:', error)
    throw error
  }
}

export function getPlanById(id: string): SavedPlan | null {
  try {
    return plansStore.get(id) ?? null
  } catch (error) {
    console.error('Error in getPlanById:', error)
    throw error
  }
}

export function savePlan(input: SavePlanInput): SavedPlan {
  try {
    const id = input.id ?? randomUUID()
    const savedPlan: SavedPlan = {
      id,
      name: input.name.trim() || 'Untitled Plan',
      savedAt: new Date().toISOString(),
      plan: input.plan,
    }

    plansStore.set(id, savedPlan)
    return savedPlan
  } catch (error) {
    console.error('Error in savePlan:', error)
    throw error
  }
}

export function deletePlan(id: string): boolean {
  try {
    if (!plansStore.has(id)) {
      return false
    }

    plansStore.delete(id)
    return true
  } catch (error) {
    console.error('Error in deletePlan:', error)
    throw error
  }
}

export function isValidPlanDraft(plan: PlanDraft): boolean {
  try {
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
  } catch (error) {
    console.error('Error in isValidPlanDraft:', error)
    return false
  }
}

import { Course } from '@/features/courses/interfaces/course'
import { listCourseSubjects } from '@/features/courses/lib/course-catalog'
import {
  PlanValidationRequest,
  PlanValidationResponse,
  SavedPlan,
} from '@/features/plans/interfaces/plan'
import {
  loadPlansService,
  savePlanService,
} from '@/features/plans/services/plan-persistence-service'

interface PlannerCourseFilters {
  query?: string
  department?: string
  term?: string
  minCredits?: string
  maxCredits?: string
}

export function getPlannerDepartments() {
  return listCourseSubjects()
}

export async function fetchPlannerCourses(filters: PlannerCourseFilters) {
  const searchParams = new URLSearchParams({
    catalog: '1',
  })

  if (filters.query?.trim()) {
    searchParams.set('q', filters.query.trim())
  }

  if (filters.department) {
    searchParams.set('department', filters.department)
  }

  if (filters.term) {
    searchParams.set('term', filters.term)
  }

  if (filters.minCredits?.trim()) {
    searchParams.set('minCredits', filters.minCredits)
  }

  if (filters.maxCredits?.trim()) {
    searchParams.set('maxCredits', filters.maxCredits)
  }

  const response = await fetch(`/api/courses?${searchParams.toString()}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load courses.')
  }

  const payload = (await response.json()) as { courses: Course[]; total: number }
  return payload.courses
}

export async function validatePlannerPlan(payload: PlanValidationRequest) {
  const response = await fetch('/api/validate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Validation failed.')
  }

  return (await response.json()) as PlanValidationResponse
}

export async function loadPlannerPlans(ownerKey: string | null) {
  return loadPlansService(ownerKey)
}

export async function persistPlannerPlan(plan: SavedPlan, ownerKey: string | null) {
  return savePlanService(plan, Boolean(ownerKey), ownerKey)
}

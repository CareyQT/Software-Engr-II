import { PlanValidationRequest } from '@/src/lib/termwise/types'
import { validatePlan } from '@/src/lib/termwise/validation'

export function isPlanValidationRequest(
  payload: Partial<PlanValidationRequest> | null | undefined
): payload is PlanValidationRequest {
  return Boolean(payload && Array.isArray(payload.terms) && Array.isArray(payload.completedCourses))
}

export function validateStudentPlan(payload: PlanValidationRequest) {
  return validatePlan(payload)
}

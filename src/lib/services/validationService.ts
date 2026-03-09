import { PlanValidationRequest } from '@/src/lib/termwise/types'
import { validatePlan } from '@/src/lib/termwise/validation'

export function isPlanValidationRequest(
  payload: Partial<PlanValidationRequest> | null | undefined
): payload is PlanValidationRequest {
  try {
    return Boolean(
      payload && Array.isArray(payload.terms) && Array.isArray(payload.completedCourses)
    )
  } catch (error) {
    console.error('Error in isPlanValidationRequest:', error)
    return false
  }
}

export function validateStudentPlan(payload: PlanValidationRequest) {
  try {
    return validatePlan(payload)
  } catch (error) {
    console.error('Error in validateStudentPlan:', error)
    throw error
  }
}

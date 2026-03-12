export function normalizeCourseCode(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toUpperCase()
}

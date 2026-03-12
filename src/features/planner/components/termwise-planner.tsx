'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  HomeIcon,
  LayoutIcon,
  LoaderCircleIcon,
  PlusIcon,
  RefreshCwIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
  Trash2Icon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Course } from '@/features/courses/interfaces/course'
import { COURSE_MAP } from '@/features/courses/lib/course-catalog'
import { calculateCumulativeGpa } from '@/features/planner/lib/planner-gpa'
import { createDefaultTerms, createNextTerm } from '@/features/planner/lib/planner-terms'
import {
  fetchPlannerCourses,
  getPlannerDepartments,
  loadPlannerPlans,
  persistPlannerPlan,
  validatePlannerPlan,
} from '@/features/planner/services/planner-api'
import {
  CourseValidationResult,
  GRADE_OPTIONS,
  GradeOption,
  PlanDraft,
  PlanValidationResponse,
  SavedPlan,
} from '@/features/plans/interfaces/plan'
import { TermSeason } from '@/interfaces/academic-term'
import { getOrCreateGuestSessionId } from '@/services/guest-session-service'
import { cn } from '@/utils/cn'

const AUTO_SAVE_KEY = 'termwise:autosave-plan'
const DRAFT_PLAN_VALUE = '__draft_plan__'
const ALL_TERMS_FILTER = '__all_terms__'
const ALL_DEPARTMENTS_FILTER = '__all_departments__'
const EMPTY_GRADE = '__no_grade__'

type ViewMode = 'plans' | 'search'

type DragState = {
  fromTermId: string
  code: string
} | null

type StatusTone = 'success' | 'error'

type StatusMessage = {
  tone: StatusTone
  text: string
} | null

export function TermwisePlanner() {
  const [viewMode, setViewMode] = useState<ViewMode>('plans')

  const [terms, setTerms] = useState(() => createDefaultTerms())
  const [completedCourses, setCompletedCourses] = useState<string[]>([])
  const [expectedGrades, setExpectedGrades] = useState<Record<string, GradeOption | ''>>({})
  const [allowConcurrentEnrollment, setAllowConcurrentEnrollment] = useState(false)

  const [query, setQuery] = useState('')
  const [termFilter, setTermFilter] = useState<TermSeason | ''>('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [minimumCredits, setMinimumCredits] = useState('')
  const [maximumCredits, setMaximumCredits] = useState('')
  const [courseResults, setCourseResults] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [coursesRefreshNonce, setCoursesRefreshNonce] = useState(0)

  const [validation, setValidation] = useState<PlanValidationResponse>({
    byTerm: {},
    byCourseAndTerm: {},
  })
  const [isValidating, setIsValidating] = useState(false)

  const [dragState, setDragState] = useState<DragState>(null)
  const [targetTermId, setTargetTermId] = useState('')
  const [selectedCourseCode, setSelectedCourseCode] = useState('')

  const [saveName, setSaveName] = useState('Accelerated Plan')
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])
  const [activePlanId, setActivePlanId] = useState('')
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null)

  const [guestUserId, setGuestUserId] = useState<string | null>(null)

  const departments = useMemo(() => getPlannerDepartments(), [])

  const selectedCourse = useMemo(() => {
    if (!selectedCourseCode) {
      return null
    }

    return COURSE_MAP.get(selectedCourseCode) ?? null
  }, [selectedCourseCode])

  const validationWarningsCount = useMemo(() => {
    return Object.values(validation.byCourseAndTerm).filter(result => result.status !== 'eligible')
      .length
  }, [validation.byCourseAndTerm])

  const validationFindings = useMemo(() => {
    return Object.values(validation.byCourseAndTerm).filter(result => result.status !== 'eligible')
  }, [validation.byCourseAndTerm])

  const totalPlannedCredits = useMemo(() => {
    return terms.reduce((sum, term) => {
      const credits = term.courses.reduce((termTotal, code) => {
        return termTotal + (COURSE_MAP.get(code)?.credits ?? 0)
      }, 0)

      return sum + credits
    }, 0)
  }, [terms])

  const cumulativeGpa = useMemo(() => {
    return calculateCumulativeGpa(terms, completedCourses, expectedGrades)
  }, [completedCourses, expectedGrades, terms])

  useEffect(() => {
    setGuestUserId(getOrCreateGuestSessionId())
  }, [])

  useEffect(() => {
    if (!guestUserId) {
      return
    }

    let isActive = true

    void loadPlannerPlans(guestUserId)
      .then(plans => {
        if (isActive) {
          setSavedPlans(plans)
        }
      })
      .catch(error => {
        console.error('Failed to load plans:', error)
      })

    return () => {
      isActive = false
    }
  }, [guestUserId])

  useEffect(() => {
    if (!targetTermId && terms.length > 0) {
      setTargetTermId(terms[0].id)
    }
  }, [targetTermId, terms])

  useEffect(() => {
    const payload: PlanDraft = {
      terms,
      completedCourses,
      expectedGrades,
    }

    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(payload))
  }, [completedCourses, expectedGrades, terms])

  useEffect(() => {
    let isActive = true
    setIsLoadingCourses(true)

    void fetchPlannerCourses({
      query,
      department: departmentFilter,
      term: termFilter,
      minCredits: minimumCredits,
      maxCredits: maximumCredits,
    })
      .then(courses => {
        if (isActive) {
          setCourseResults(courses)
        }
      })
      .catch(error => {
        console.error('Course lookup failed:', error)

        if (isActive) {
          setStatusMessage({
            tone: 'error',
            text: 'Course lookup failed. Please try again.',
          })
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingCourses(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [coursesRefreshNonce, departmentFilter, maximumCredits, minimumCredits, query, termFilter])

  useEffect(() => {
    if (courseResults.length === 0) {
      setSelectedCourseCode('')
      return
    }

    const currentExists = courseResults.some(course => course.code === selectedCourseCode)
    if (!currentExists) {
      setSelectedCourseCode(courseResults[0].code)
    }
  }, [courseResults, selectedCourseCode])

  const runValidation = useCallback(async () => {
    setIsValidating(true)

    try {
      const payload = await validatePlannerPlan({
        terms,
        completedCourses,
        allowConcurrentEnrollment,
      })
      setValidation(payload)
    } catch (error) {
      console.error('Validation failed:', error)
      setStatusMessage({ tone: 'error', text: 'Validation failed.' })
    } finally {
      setIsValidating(false)
    }
  }, [allowConcurrentEnrollment, completedCourses, terms])

  useEffect(() => {
    void runValidation()
  }, [allowConcurrentEnrollment, completedCourses, runValidation, terms])

  function refreshBoard() {
    setCoursesRefreshNonce(previous => previous + 1)
    void runValidation()
  }

  function addCourseToTerm(code: string, termId: string) {
    if (!termId) {
      setStatusMessage({
        tone: 'error',
        text: 'Select a target term first.',
      })
      return
    }

    if (completedCourses.includes(code)) {
      setStatusMessage({
        tone: 'error',
        text: `${code} is already marked as completed.`,
      })
      return
    }

    const alreadyInPlan = terms.some(term => term.courses.includes(code))
    if (alreadyInPlan) {
      setStatusMessage({
        tone: 'error',
        text: `${code} is already in the plan.`,
      })
      return
    }

    const termLabel = terms.find(term => term.id === termId)?.label ?? 'selected term'

    setTerms(previous =>
      previous.map(term => {
        if (term.id !== termId) {
          return term
        }

        return {
          ...term,
          courses: [...term.courses, code],
        }
      })
    )

    setStatusMessage({
      tone: 'success',
      text: `${code} added to ${termLabel}.`,
    })
  }

  function addSelectedCourseToTerm(termId: string) {
    if (!selectedCourseCode) {
      setStatusMessage({
        tone: 'error',
        text: 'Select a course before adding.',
      })
      return
    }

    addCourseToTerm(selectedCourseCode, termId)
  }

  function removeCourseFromTerm(termId: string, code: string) {
    setTerms(previous =>
      previous.map(term => {
        if (term.id !== termId) {
          return term
        }

        return {
          ...term,
          courses: term.courses.filter(courseCode => courseCode !== code),
        }
      })
    )
  }

  function moveCourseToTerm(code: string, fromTermId: string, toTermId: string) {
    if (!toTermId || fromTermId === toTermId) {
      return
    }

    setTerms(previous => {
      const destinationContainsCourse = previous
        .find(term => term.id === toTermId)
        ?.courses.includes(code)

      if (destinationContainsCourse) {
        return previous
      }

      return previous.map(term => {
        if (term.id === fromTermId) {
          return {
            ...term,
            courses: term.courses.filter(existing => existing !== code),
          }
        }

        if (term.id === toTermId) {
          return {
            ...term,
            courses: [...term.courses, code],
          }
        }

        return term
      })
    })
  }

  function markCompleted(code: string) {
    if (completedCourses.includes(code)) {
      setCompletedCourses(previous => previous.filter(existing => existing !== code))
      return
    }

    setTerms(previous =>
      previous.map(term => ({
        ...term,
        courses: term.courses.filter(existing => existing !== code),
      }))
    )

    setCompletedCourses(previous => [...previous, code].sort((a, b) => a.localeCompare(b)))
    setStatusMessage({
      tone: 'success',
      text: `${code} marked as completed.`,
    })
  }

  function setGrade(code: string, grade: GradeOption | '') {
    setExpectedGrades(previous => ({
      ...previous,
      [code]: grade,
    }))
  }

  function addTerm() {
    setTerms(previous => [...previous, createNextTerm(previous)])
  }

  function clearPlan() {
    setTerms(createDefaultTerms())
    setCompletedCourses([])
    setExpectedGrades({})
    setValidation({
      byTerm: {},
      byCourseAndTerm: {},
    })
    setActivePlanId('')
    setSaveName('Accelerated Plan')
    setStatusMessage({
      tone: 'success',
      text: 'Started a new plan.',
    })
  }

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = saveName.trim() || `Plan ${new Date().toLocaleDateString()}`
    const existingPlan = savedPlans.find(plan => plan.name.toLowerCase() === name.toLowerCase())
    const id = existingPlan?.id ?? crypto.randomUUID()

    const savedPlan: SavedPlan = {
      id,
      name,
      savedAt: new Date().toISOString(),
      plan: {
        terms,
        completedCourses,
        expectedGrades,
      },
    }

    const nextPlans = [savedPlan, ...savedPlans.filter(plan => plan.id !== savedPlan.id)].sort(
      (a, b) => b.savedAt.localeCompare(a.savedAt)
    )

    setSavedPlans(nextPlans)
    setActivePlanId(savedPlan.id)

    try {
      const persistedPlan = await persistPlannerPlan(savedPlan, guestUserId)
      const mergedPlans = [
        persistedPlan,
        ...nextPlans.filter(plan => plan.id !== persistedPlan.id),
      ].sort((a, b) => b.savedAt.localeCompare(a.savedAt))
      setSavedPlans(mergedPlans)
      setStatusMessage({ tone: 'success', text: `Saved locally & synced as ${name}.` })
    } catch (error) {
      console.error('Plan sync failed:', error)
      setStatusMessage({ tone: 'error', text: 'Server sync failed; saved locally.' })
    }
  }

  function loadPlan(planId: string) {
    if (!planId || planId === DRAFT_PLAN_VALUE) {
      return
    }

    const selectedPlan = savedPlans.find(plan => plan.id === planId)
    if (!selectedPlan) {
      return
    }

    setTerms(selectedPlan.plan.terms)
    setCompletedCourses(selectedPlan.plan.completedCourses)
    setExpectedGrades(selectedPlan.plan.expectedGrades ?? {})
    setSaveName(selectedPlan.name)
    setActivePlanId(selectedPlan.id)
    setStatusMessage({
      tone: 'success',
      text: `Loaded "${selectedPlan.name}".`,
    })
  }

  return (
    <main className="min-h-screen bg-[#efefef] p-3 md:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1500px] overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-[0_6px_30px_rgba(0,0,0,0.05)]">
        <aside className="flex w-[92px] flex-col border-r border-zinc-200 bg-[#fbfbfb]">
          <div className="border-b border-zinc-200 px-3 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-xs font-semibold text-white">
              T
            </div>
          </div>

          <nav className="space-y-1 px-2 py-3">
            <button
              type="button"
              onClick={() => setViewMode('plans')}
              className={cn(
                'flex w-full flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium transition',
                viewMode === 'plans'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              )}>
              <LayoutIcon className="size-4" />
              Plans
            </button>
            <button
              type="button"
              onClick={() => setViewMode('search')}
              className={cn(
                'flex w-full flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium transition',
                viewMode === 'search'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              )}>
              <SearchIcon className="size-4" />
              Search
            </button>
            <button
              type="button"
              className="flex w-full flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900">
              <HomeIcon className="size-4" />
              Home
            </button>
          </nav>

          <div className="mt-auto border-t border-zinc-200 px-2 py-3">
            <button
              type="button"
              className="flex w-full flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900">
              <SettingsIcon className="size-4" />
              Settings
            </button>
            <div className="mt-3 rounded-md border border-zinc-200 bg-white px-2 py-2 text-[10px] text-zinc-600">
              <p className="font-medium text-zinc-800">Guest Session</p>
              <p>{guestUserId ?? 'Local only'}</p>
            </div>
          </div>
        </aside>

        <section className="flex min-h-[inherit] flex-1 flex-col">
          <header className="border-b border-zinc-200 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-zinc-900">
                  {viewMode === 'plans' ? 'Plans Board' : 'Course Search'}
                </h1>
                <p className="text-xs text-zinc-500">
                  {viewMode === 'plans'
                    ? 'Drag and drop course cards between terms.'
                    : 'Find by code, title, department, and term availability.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={activePlanId || DRAFT_PLAN_VALUE}
                  onValueChange={value => loadPlan(value)}>
                  <SelectTrigger className="h-8 w-[190px] text-xs">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DRAFT_PLAN_VALUE}>Draft Plan</SelectItem>
                    {savedPlans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button size="sm" variant="outline" onClick={clearPlan}>
                  <PlusIcon className="size-3.5" />
                  New Plan
                </Button>

                <Button size="sm" variant="outline" onClick={refreshBoard}>
                  <RefreshCwIcon className="size-3.5" />
                  Refresh
                </Button>

                <Button size="sm" className="bg-amber-600 text-white hover:bg-amber-700">
                  Action
                </Button>
              </div>
            </div>
          </header>

          {statusMessage && (
            <div
              className={cn(
                'mx-5 mt-4 rounded-md border px-3 py-2 text-xs',
                statusMessage.tone === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-rose-300 bg-rose-50 text-rose-900'
              )}>
              {statusMessage.text}
            </div>
          )}

          <div className="flex-1 overflow-hidden p-4 md:p-5">
            {viewMode === 'plans' ? (
              <div className="flex h-full flex-col gap-4">
                <Card className="border-zinc-200 bg-[#fafafa]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">
                      {saveName || 'Untitled Plan'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Planned credits: {totalPlannedCredits} | Validation issues:{' '}
                      {validationWarningsCount} | Estimated GPA: {cumulativeGpa.gpa ?? '--'}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="flex items-center justify-end">
                  <Button size="sm" variant="outline" onClick={addTerm}>
                    <PlusIcon className="size-3.5" />
                    Add Term
                  </Button>
                </div>

                <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[250px_1fr]">
                  <Card className="h-full border-zinc-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase tracking-wide text-zinc-500">
                        Validation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 overflow-auto">
                      {isValidating && (
                        <div className="flex items-center gap-2 rounded border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-600">
                          <LoaderCircleIcon className="size-3.5 animate-spin" />
                          Validating...
                        </div>
                      )}

                      {!isValidating && validationFindings.length === 0 && (
                        <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-2 text-xs text-emerald-900">
                          Plan looks valid for current constraints.
                        </div>
                      )}

                      {validationFindings.map(result => (
                        <article
                          key={`${result.termId}-${result.code}`}
                          className="rounded border border-rose-200 bg-rose-50 px-2 py-2 text-[11px]">
                          <p className="font-semibold text-rose-700">
                            {buildValidationLabel(result)}
                          </p>
                          <p className="mt-1 text-rose-900">
                            {result.code}: {result.reasons[0]}
                          </p>
                          {result.earliestEligibleTermLabel && (
                            <p className="mt-1 text-rose-800">
                              Earliest term: {result.earliestEligibleTermLabel}
                            </p>
                          )}
                        </article>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="min-w-0 overflow-auto">
                    <div className="flex min-w-max gap-3 pb-2">
                      {terms.map(term => {
                        const termCredits = term.courses.reduce(
                          (sum, code) => sum + (COURSE_MAP.get(code)?.credits ?? 0),
                          0
                        )
                        const termValidation = validation.byTerm[term.id] ?? []

                        return (
                          <Card
                            key={term.id}
                            className="w-[300px] border-zinc-200"
                            onDragOver={event => event.preventDefault()}
                            onDrop={event => {
                              event.preventDefault()
                              if (dragState) {
                                moveCourseToTerm(dragState.code, dragState.fromTermId, term.id)
                                setDragState(null)
                              }
                            }}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-sm font-semibold">
                                    {term.label}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    Credits: {termCredits}
                                  </CardDescription>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setTerms(previous =>
                                      previous.filter(existingTerm => existingTerm.id !== term.id)
                                    )
                                  }}
                                  disabled={terms.length <= 1}
                                  aria-label={`Remove ${term.label}`}>
                                  <Trash2Icon className="size-3.5 text-rose-500" />
                                </Button>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-2">
                              <Button
                                variant="outline"
                                className="h-8 w-full border-dashed text-xs"
                                onClick={() => addSelectedCourseToTerm(term.id)}>
                                + Add Course
                              </Button>

                              {term.courses.map(code => {
                                const course = COURSE_MAP.get(code)
                                const result = getValidationForCourse(term.id, code, termValidation)
                                const isWarning = result && result.status !== 'eligible'

                                return (
                                  <article
                                    key={code}
                                    draggable
                                    onDragStart={() =>
                                      setDragState({
                                        fromTermId: term.id,
                                        code,
                                      })
                                    }
                                    className={cn(
                                      'space-y-2 rounded-md border px-3 py-2',
                                      isWarning
                                        ? 'border-rose-200 bg-rose-50'
                                        : 'border-zinc-200 bg-white'
                                    )}>
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="text-sm font-semibold text-zinc-900">
                                          {code}
                                        </p>
                                        <p className="text-xs text-zinc-600">{course?.title}</p>
                                        <p className="text-xs text-zinc-500">
                                          Credits: {course?.credits ?? 0}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => removeCourseFromTerm(term.id, code)}
                                        aria-label={`Remove ${code}`}>
                                        <Trash2Icon className="size-3.5 text-rose-500" />
                                      </Button>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                      <Select
                                        value={expectedGrades[code] || EMPTY_GRADE}
                                        onValueChange={value =>
                                          setGrade(
                                            code,
                                            value === EMPTY_GRADE ? '' : (value as GradeOption)
                                          )
                                        }>
                                        <SelectTrigger className="h-7 w-[120px] text-xs">
                                          <SelectValue placeholder="Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value={EMPTY_GRADE}>No grade</SelectItem>
                                          {GRADE_OPTIONS.map(grade => (
                                            <SelectItem key={grade} value={grade}>
                                              {grade}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>

                                      {result && result.status === 'eligible' ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                                          <CheckCircle2Icon className="size-3.5" />
                                          Eligible
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-700">
                                          <AlertCircleIcon className="size-3.5" />
                                          Review
                                        </span>
                                      )}
                                    </div>
                                  </article>
                                )
                              })}

                              <Button
                                variant="outline"
                                className="h-8 w-full border-dashed text-xs"
                                onClick={() => addSelectedCourseToTerm(term.id)}>
                                + Add Course
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <form className="grid gap-2 md:grid-cols-[1fr_auto_auto]" onSubmit={savePlan}>
                  <Input
                    value={saveName}
                    onChange={event => setSaveName(event.target.value)}
                    placeholder="Plan name"
                  />
                  <Select
                    value={targetTermId}
                    onValueChange={value => {
                      setTargetTermId(value)
                    }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Target term" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map(term => (
                        <SelectItem key={term.id} value={term.id}>
                          {term.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit">
                    <SaveIcon className="size-3.5" />
                    Save Plan
                  </Button>
                </form>
              </div>
            ) : (
              <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[360px_1fr]">
                <Card className="min-h-0 border-zinc-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Course Search</CardTitle>
                    <CardDescription className="text-xs">
                      Find by code, title, department, and term availability.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                      placeholder="Search by keyword"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={departmentFilter || ALL_DEPARTMENTS_FILTER}
                        onValueChange={value =>
                          setDepartmentFilter(value === ALL_DEPARTMENTS_FILTER ? '' : value)
                        }>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_DEPARTMENTS_FILTER}>All departments</SelectItem>
                          {departments.map(department => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={termFilter || ALL_TERMS_FILTER}
                        onValueChange={value => {
                          setTermFilter(value === ALL_TERMS_FILTER ? '' : (value as TermSeason))
                        }}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_TERMS_FILTER}>All terms</SelectItem>
                          <SelectItem value="Fall">Fall</SelectItem>
                          <SelectItem value="Winter">Winter</SelectItem>
                          <SelectItem value="Spring">Spring</SelectItem>
                          <SelectItem value="Summer">Summer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={minimumCredits}
                        onChange={event => setMinimumCredits(event.target.value)}
                        type="number"
                        min={0}
                        max={20}
                        placeholder="Min credits"
                      />
                      <Input
                        value={maximumCredits}
                        onChange={event => setMaximumCredits(event.target.value)}
                        type="number"
                        min={0}
                        max={20}
                        placeholder="Max credits"
                      />
                    </div>

                    <div className="max-h-[56vh] space-y-2 overflow-auto border-t border-zinc-200 pt-2">
                      {isLoadingCourses && (
                        <div className="flex items-center gap-2 rounded border border-zinc-200 bg-zinc-50 px-2 py-2 text-xs text-zinc-600">
                          <LoaderCircleIcon className="size-3.5 animate-spin" />
                          Loading courses...
                        </div>
                      )}

                      {!isLoadingCourses && courseResults.length === 0 && (
                        <div className="rounded border border-zinc-200 bg-zinc-50 px-2 py-2 text-xs text-zinc-600">
                          No courses matched your filters.
                        </div>
                      )}

                      {!isLoadingCourses &&
                        courseResults.map(course => {
                          const isSelected = course.code === selectedCourseCode

                          return (
                            <button
                              key={course.code}
                              type="button"
                              onClick={() => setSelectedCourseCode(course.code)}
                              className={cn(
                                'w-full rounded border px-3 py-2 text-left transition',
                                isSelected
                                  ? 'border-amber-300 bg-amber-50'
                                  : 'border-zinc-200 bg-white hover:bg-zinc-50'
                              )}>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-zinc-900">
                                    {course.code}
                                  </p>
                                  <p className="text-xs text-zinc-600">{course.title}</p>
                                </div>
                                <p className="text-xs font-medium text-zinc-500">
                                  {course.credits} cr
                                </p>
                              </div>
                            </button>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-h-0 border-zinc-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Course Detail</CardTitle>
                    <CardDescription className="text-xs">
                      Description, prerequisites, and grade distribution.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 overflow-auto">
                    {!selectedCourse && (
                      <div className="rounded border border-zinc-200 bg-zinc-50 px-3 py-3 text-xs text-zinc-600">
                        Select a course from the list to view details.
                      </div>
                    )}

                    {selectedCourse && (
                      <>
                        <article className="rounded border border-zinc-200 p-3">
                          <h3 className="text-sm font-semibold text-zinc-900">
                            {selectedCourse.code} - {selectedCourse.title}
                          </h3>
                          <p className="mt-1 text-xs text-zinc-600">{selectedCourse.description}</p>

                          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                            <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5">
                              {selectedCourse.subject}
                            </span>
                            <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5">
                              {selectedCourse.credits} credits
                            </span>
                            {selectedCourse.offeredTerms.map(term => (
                              <span
                                key={`${selectedCourse.code}-${term}`}
                                className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5">
                                {term.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </article>

                        <article className="rounded border border-zinc-200 p-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Prerequisite Rules
                          </h4>
                          <p className="mt-1 text-xs text-zinc-700">
                            {selectedCourse.prerequisiteText ?? 'No prerequisites.'}
                          </p>
                        </article>

                        <article className="rounded border border-zinc-200 p-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Historical Grade Distribution
                          </h4>
                          <div className="mt-2 grid gap-2 md:grid-cols-2">
                            {buildGradeDistribution(selectedCourse.code).map(item => (
                              <div
                                key={`${selectedCourse.code}-${item.grade}`}
                                className="rounded border border-zinc-200 px-2 py-1.5 text-xs">
                                <div className="mb-1 flex items-center justify-between">
                                  <span className="font-medium text-zinc-700">{item.grade}</span>
                                  <span className="text-zinc-500">{item.percent}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded bg-zinc-100">
                                  <div
                                    className="h-1.5 rounded bg-zinc-800"
                                    style={{ width: `${item.percent}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </article>

                        <article className="grid gap-2 rounded border border-zinc-200 p-3 md:grid-cols-[1fr_auto_auto]">
                          <Select
                            value={targetTermId}
                            onValueChange={value => {
                              setTargetTermId(value)
                            }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Target term" />
                            </SelectTrigger>
                            <SelectContent>
                              {terms.map(term => (
                                <SelectItem key={term.id} value={term.id}>
                                  {term.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button onClick={() => addSelectedCourseToTerm(targetTermId)}>
                            <PlusIcon className="size-3.5" />
                            Add to Plan
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => markCompleted(selectedCourse.code)}>
                            {completedCourses.includes(selectedCourse.code)
                              ? 'Unmark Completed'
                              : 'Mark Completed'}
                          </Button>
                        </article>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function getValidationForCourse(
  termId: string,
  code: string,
  termValidation: CourseValidationResult[]
): CourseValidationResult | undefined {
  return termValidation.find(result => result.termId === termId && result.code === code)
}

function buildValidationLabel(result: CourseValidationResult) {
  if (result.status === 'manual_check') {
    return 'MANUAL REVIEW REQUIRED'
  }

  const hasOfferingIssue = result.reasons.some(reason => reason.toLowerCase().includes('offered'))
  if (hasOfferingIssue) {
    return 'INVALID SCHEDULE CONFLICT'
  }

  return 'INVALID SEQUENCING'
}

function buildGradeDistribution(code: string) {
  const seed = Array.from(code).reduce((sum, char) => sum + char.charCodeAt(0), 0)

  const a = 24 + (seed % 14)
  const b = 26 + (seed % 12)
  const c = 12 + (seed % 8)
  const d = 4 + (seed % 5)
  const f = 2 + (seed % 4)

  const raw = [
    { grade: 'A', value: a },
    { grade: 'B', value: b },
    { grade: 'C', value: c },
    { grade: 'D', value: d },
    { grade: 'F', value: f },
  ]

  const total = raw.reduce((sum, item) => sum + item.value, 0)

  return raw.map((item, index) => {
    if (index === raw.length - 1) {
      const previousTotal = raw
        .slice(0, -1)
        .map(entry => Math.round((entry.value / total) * 100))
        .reduce((sum, value) => sum + value, 0)

      return {
        grade: item.grade,
        percent: Math.max(0, 100 - previousTotal),
      }
    }

    return {
      grade: item.grade,
      percent: Math.round((item.value / total) * 100),
    }
  })
}

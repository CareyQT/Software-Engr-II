'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  LayoutIcon,
  LoaderCircleIcon,
  PlusIcon,
  RefreshCwIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
  Trash2Icon,
  XIcon,
  SparklesIcon,
} from 'lucide-react'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import {
  fetchCoursesFromFirebase,
  fetchMajorsFromFirebase,
} from '@/src/lib/services/plannerService'
import { COURSE_MAP } from '@/src/lib/termwise/data'
import {
  Course,
  CourseValidationResult,
  GradeOption,
  PlanValidationResponse,
  PlannedTerm,
  SavedPlan,
  TERM_SEASONS,
  TermSeason,
} from '@/src/lib/termwise/types'
import {
  calculateCumulativeGpa,
  createDefaultTerms,
  validatePlan,
} from '@/src/lib/termwise/validation'
import { cn } from '@/src/lib/utils'
import { loadPlansService, savePlanService } from '../lib/services/persistenceService'

const DRAFT_PLAN_VALUE = '__draft_plan__'
const ALL_TERMS_FILTER = '__all_terms__'
const ALL_DEPARTMENTS_FILTER = '__all_departments__'

type ViewMode = 'plans' | 'search'
type DragState = { from: 'term' | 'pool'; termId?: string; code: string } | null
type GridRows = 1 | 2 | 4

export function TermwisePlanner() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('plans')
  const [gridRows, setGridRows] = useState<GridRows>(1)
  const [terms, setTerms] = useState<PlannedTerm[]>(() => createDefaultTerms())
  const [coursePool, setCoursePool] = useState<string[]>([])
  const [completedCourses, setCompletedCourses] = useState<string[]>([])
  const [expectedGrades, setExpectedGrades] = useState<Record<string, GradeOption | ''>>({})

  const [query, setQuery] = useState('')
  const [termFilter, setTermFilter] = useState<string>(ALL_TERMS_FILTER)
  const [departmentFilter, setDepartmentFilter] = useState<string>(ALL_DEPARTMENTS_FILTER)
  const [courseResults, setCourseResults] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)

  const [validation, setValidation] = useState<PlanValidationResponse>({
    byTerm: {},
    byCourseAndTerm: {},
  })
  const [dragState, setDragState] = useState<DragState>(null)
  const [saveName, setSaveName] = useState('Accelerated Plan')
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])
  const [activePlanId, setActivePlanId] = useState('')
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('')
  const [statusMessage, setStatusMessage] = useState<{
    tone: 'success' | 'error'
    text: string
  } | null>(null)
  const [guestUserId, setGuestUserId] = useState<string | null>(null)
  const [cloudMajors, setCloudMajors] = useState<any[]>([])

  const departments = useMemo(() => cloudMajors.map(m => m.name).sort(), [cloudMajors])

  const selectedCourse = useMemo(() => {
    if (!selectedCourseCode) return null
    return COURSE_MAP.get(selectedCourseCode) ?? null
  }, [selectedCourseCode])

  const cumulativeGpa = useMemo(
    () => calculateCumulativeGpa(terms, completedCourses, expectedGrades),
    [terms, completedCourses, expectedGrades]
  )

  useEffect(() => {
    setMounted(true)
    const init = async () => {
      const majors = await fetchMajorsFromFirebase()
      setCloudMajors(majors)
      const GUEST_ID_KEY = 'termwise:guest-id'
      let id = localStorage.getItem(GUEST_ID_KEY)
      if (!id) {
        id = `guest_${crypto.randomUUID()}`
        localStorage.setItem(GUEST_ID_KEY, id)
      }
      setGuestUserId(id)
      const plans = await loadPlansService(id)
      setSavedPlans(plans)
    }
    init()
  }, [])

  /** * Fix: Search Logic Refinement
   * Corrected the effect dependencies to ensure department and term filters trigger a re-search.
   */
  useEffect(() => {
    let active = true
    const search = async () => {
      setIsLoadingCourses(true)
      try {
        const results = await fetchCoursesFromFirebase({
          query: query.trim(),
          department: departmentFilter === ALL_DEPARTMENTS_FILTER ? '' : departmentFilter,
          term: termFilter === ALL_TERMS_FILTER ? '' : (termFilter as TermSeason),
        })
        if (active) setCourseResults(results)
      } catch (e) {
        console.error('Search failed', e)
      } finally {
        if (active) setIsLoadingCourses(false)
      }
    }
    const timer = setTimeout(search, 300)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, departmentFilter, termFilter]) // Fixed: Proper dependencies

  useEffect(() => {
    const res = validatePlan({ terms, completedCourses, allowConcurrentEnrollment: false })
    setValidation(res)
  }, [terms, completedCourses])

  const showFeedback = (tone: 'success' | 'error', text: string) => {
    setStatusMessage({ tone, text })
    setTimeout(() => setStatusMessage(null), 3000)
  }

  const handleNewPlan = () => {
    if (confirm('Discard current changes and start a new plan?')) {
      setTerms(createDefaultTerms())
      setCompletedCourses([])
      setActivePlanId('')
      setSaveName('Accelerated Plan')
      setCoursePool([])
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    let name = saveName.trim() || 'Untitled Plan'
    const nameExists = (n: string) => savedPlans.some(p => p.name === n && p.id !== activePlanId)
    let counter = 1
    const originalName = name
    while (nameExists(name)) {
      name = `${originalName} (${counter++})`
    }
    setSaveName(name)

    const id = activePlanId || crypto.randomUUID()
    const plan: SavedPlan = {
      id,
      name,
      savedAt: new Date().toISOString(),
      plan: { terms, completedCourses, expectedGrades },
    }

    try {
      await savePlanService(plan, true, guestUserId)
      setSavedPlans(prev => [plan, ...prev.filter(p => p.id !== id)])
      setActivePlanId(id)
      showFeedback('success', 'Plan saved successfully.')
    } catch {
      showFeedback('error', 'Failed to save plan.')
    }
  }

  const handleDropToPool = () => {
    if (!dragState || dragState.from === 'pool') return
    const { code, termId } = dragState
    setTerms(prev =>
      prev.map(t => (t.id === termId ? { ...t, courses: t.courses.filter(c => c !== code) } : t))
    )
    if (!coursePool.includes(code)) setCoursePool(prev => [...prev, code])
    setDragState(null)
    showFeedback('success', `${code} returned to pool`)
  }

  function loadPlan(planId: string) {
    if (!planId || planId === DRAFT_PLAN_VALUE) return
    const p = savedPlans.find(plan => plan.id === planId)
    if (!p) return
    setTerms(p.plan.terms)
    setCompletedCourses(p.plan.completedCourses)
    setExpectedGrades(p.plan.expectedGrades || {})
    setSaveName(p.name)
    setActivePlanId(p.id)
  }

  const addCourse = (code: string, termId: string) => {
    if (terms.some(t => t.courses.includes(code))) return showFeedback('error', 'Already in plan.')
    setTerms(prev => prev.map(t => (t.id === termId ? { ...t, courses: [...t.courses, code] } : t)))
    setCoursePool(prev => prev.filter(c => c !== code))
    showFeedback('success', `Added ${code}`)
  }

  const moveCourse = (code: string, fromId: string, toId: string) => {
    if (fromId === toId) return
    setTerms(prev =>
      prev.map(t => {
        if (t.id === fromId) return { ...t, courses: t.courses.filter(c => c !== code) }
        if (t.id === toId) return { ...t, courses: [...t.courses, code] }
        return t
      })
    )
  }

  if (!mounted) return <div className="min-h-screen bg-zinc-100 animate-pulse" />

  return (
    <main className="min-h-screen bg-zinc-100 p-4">
      <div className="mx-auto flex h-[92vh] max-w-[1700px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <aside className="flex w-[92px] flex-col border-r border-zinc-100 bg-zinc-50/50">
          <div className="flex aspect-square items-center justify-center border-b border-zinc-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-xs font-semibold text-white">
              T
            </div>
          </div>
          <nav className="flex flex-1 flex-col items-center gap-6 py-10">
            <NavIcon
              active={viewMode === 'plans'}
              onClick={() => setViewMode('plans')}
              icon={<LayoutIcon className="size-5" />}
              label="Plans"
            />
            <NavIcon
              active={viewMode === 'search'}
              onClick={() => setViewMode('search')}
              icon={<SearchIcon className="size-5" />}
              label="Search"
            />
          </nav>
        </aside>

        <section className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-20 items-center justify-between border-b border-zinc-100 px-8">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-zinc-900">
                {viewMode === 'plans' ? 'Plan Dashboard' : 'Course Discovery'}
              </h1>
              {viewMode === 'plans' && (
                <div className="flex items-center gap-2 rounded-lg bg-zinc-100 p-1">
                  {[1, 2, 4].map(r => (
                    <button
                      key={r}
                      onClick={() => setGridRows(r as GridRows)}
                      className={cn(
                        'px-3 py-1 text-[10px] font-bold rounded-md transition',
                        gridRows === r ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'
                      )}>
                      {r} ROW{r > 1 && 'S'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                className="w-56 h-8 text-xs"
                placeholder="Plan Name"
              />
              <Select value={activePlanId || DRAFT_PLAN_VALUE} onValueChange={loadPlan}>
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DRAFT_PLAN_VALUE}>Current Draft</SelectItem>
                  {savedPlans.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleNewPlan}>
                New
              </Button>
              <Button variant="default" size="sm" className="bg-zinc-900" onClick={handleSave}>
                Save
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden">
            {viewMode === 'plans' ? (
              <div className="flex flex-col h-full">
                <div
                  className="border-b border-zinc-100 bg-zinc-50/30 p-4 transition-colors hover:bg-zinc-100/50"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDropToPool}>
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2">
                    Course Pool (Drag here to remove from terms)
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {coursePool.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic">
                        No courses in pool. Add from Search.
                      </p>
                    ) : (
                      coursePool.map(code => (
                        <div
                          key={code}
                          draggable
                          onDragStart={() => setDragState({ from: 'pool', code })}
                          className="shrink-0 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold shadow-sm cursor-grab active:cursor-grabbing hover:border-zinc-400 transition-all">
                          {code}
                          <button
                            onClick={() => setCoursePool(prev => prev.filter(c => c !== code))}>
                            <XIcon className="size-3 text-zinc-300 hover:text-rose-500" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid h-full grid-cols-[300px_1fr] divide-x divide-zinc-100 overflow-hidden">
                  <div className="p-8 overflow-auto space-y-6">
                    <Card className="border-zinc-200 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xs uppercase tracking-widest text-zinc-400">
                          Academic Standing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Proj. GPA</span>
                          <span className="font-bold text-zinc-900">
                            {cumulativeGpa.gpa || '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Credits</span>
                          <span className="font-bold text-zinc-900">
                            {terms.reduce((a, t) => a + t.courses.length * 4, 0)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                        Plan Validation
                      </p>
                      {Object.values(validation.byCourseAndTerm)
                        .filter(f => f.status !== 'eligible')
                        .map((f, i) => (
                          <div
                            key={i}
                            className="rounded-lg bg-rose-50 p-3 text-[11px] text-rose-700 font-medium">
                            <AlertCircleIcon className="inline size-3 mr-1 mb-0.5" /> {f.code}:{' '}
                            {f.reasons[0]}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="overflow-auto p-10 bg-zinc-50/20">
                    <div
                      className="grid gap-8"
                      style={{
                        gridTemplateColumns: `repeat(${Math.ceil(terms.length / gridRows)}, 320px)`,
                        transform: `scale(${gridRows === 4 ? 0.85 : 1})`,
                        transformOrigin: 'top left',
                      }}>
                      {terms.map(term => (
                        <div
                          key={term.id}
                          className="flex flex-col gap-4"
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => {
                            if (!dragState) return
                            if (dragState.from === 'term')
                              moveCourse(dragState.code, dragState.termId!, term.id)
                            else addCourse(dragState.code, term.id)
                            setDragState(null)
                          }}>
                          <div className="flex items-center justify-between px-1">
                            <h3 className="font-bold text-zinc-900">{term.label}</h3>
                            <span className="text-[10px] font-medium text-zinc-400 uppercase">
                              {term.courses.length * 4} CR
                            </span>
                          </div>
                          <div
                            className={cn(
                              'flex flex-col gap-3 rounded-2xl border-2 border-transparent bg-zinc-100/50 p-4 transition-all hover:border-zinc-200',
                              gridRows === 1
                                ? 'min-h-[450px]'
                                : gridRows === 2
                                  ? 'min-h-[220px]'
                                  : 'min-h-[140px]'
                            )}>
                            {term.courses.map(code => (
                              <CourseCard
                                key={code}
                                code={code}
                                termId={term.id}
                                onRemove={() =>
                                  setTerms(prev =>
                                    prev.map(t =>
                                      t.id === term.id
                                        ? { ...t, courses: t.courses.filter(c => c !== code) }
                                        : t
                                    )
                                  )
                                }
                                onDrag={() => setDragState({ from: 'term', termId: term.id, code })}
                                status={validation.byCourseAndTerm[`${term.id}-${code}`]?.status}
                                compact={gridRows === 4}
                              />
                            ))}
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-14 rounded-2xl border-2 border-dashed border-zinc-200 bg-transparent hover:bg-white hover:border-black transition-all">
                                  <PlusIcon className="size-5 text-zinc-300" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-0 shadow-2xl" align="center">
                                <div className="p-4 border-b bg-zinc-50/50">
                                  <Input
                                    placeholder="Search code..."
                                    className="h-9 text-xs"
                                    onChange={e => setQuery(e.target.value)}
                                  />
                                </div>
                                <div className="max-h-60 overflow-auto p-2">
                                  {courseResults.slice(0, 10).map(c => (
                                    <button
                                      key={c.code}
                                      onClick={() => addCourse(c.code, term.id)}
                                      className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-100 font-bold">
                                      {c.code}{' '}
                                      <span className="font-normal text-zinc-400 ml-1">
                                        {c.title}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid h-full grid-cols-[400px_1fr] divide-x divide-zinc-100">
                <div className="flex flex-col gap-8 p-10 bg-zinc-50/30 overflow-auto">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                        Search Catalog
                      </label>
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                          value={query}
                          onChange={e => setQuery(e.target.value)}
                          className="rounded-xl pl-10 h-12"
                          placeholder="Course code..."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400">
                          Department
                        </label>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ALL_DEPARTMENTS_FILTER}>All Fields</SelectItem>
                            {departments.map(d => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400">
                          Season
                        </label>
                        <Select value={termFilter} onValueChange={setTermFilter}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ALL_TERMS_FILTER}>Any Term</SelectItem>
                            {TERM_SEASONS.map(s => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    {isLoadingCourses ? (
                      <div className="py-20 text-center">
                        <LoaderCircleIcon className="mx-auto animate-spin" />
                      </div>
                    ) : (
                      courseResults.map(c => (
                        <button
                          key={c.code}
                          onClick={() => setSelectedCourseCode(c.code)}
                          className={cn(
                            'w-full rounded-2xl border p-5 text-left transition',
                            selectedCourseCode === c.code
                              ? 'border-zinc-900 bg-zinc-900 text-white'
                              : 'border-zinc-100 bg-white hover:border-zinc-300'
                          )}>
                          <div className="text-sm font-black">{c.code}</div>
                          <div className="truncate text-[10px] opacity-60 font-medium">
                            {c.title}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-16 overflow-auto">
                  {selectedCourse ? (
                    <div className="flex flex-col gap-10">
                      <div className="flex items-center justify-between">
                        <h2 className="text-6xl font-black tracking-tighter">
                          {selectedCourse.code}
                        </h2>
                        <Button
                          size="lg"
                          className="group relative overflow-hidden rounded-2xl h-16 px-10 bg-zinc-900 text-white transition-all hover:bg-black hover:ring-4 hover:ring-zinc-100 active:scale-95"
                          onClick={() => {
                            if (!coursePool.includes(selectedCourse.code)) {
                              setCoursePool(prev => [...prev, selectedCourse.code])
                              showFeedback('success', `Added ${selectedCourse.code} to Pool`)
                            }
                          }}>
                          <span className="relative z-10 flex items-center gap-2 font-bold tracking-tight">
                            <SparklesIcon className="size-5 text-amber-400" />
                            Add to Pool
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                      </div>
                      <div className="space-y-12">
                        <div className="grid grid-cols-2 gap-20">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                              Description
                            </label>
                            <p className="text-lg leading-relaxed text-zinc-600">
                              {selectedCourse.description}
                            </p>
                          </div>
                          <div className="space-y-10">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-zinc-400">
                                Requirements
                              </label>
                              <p className="font-bold">
                                {selectedCourse.prerequisiteText || 'None'}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-zinc-400">
                                Offered
                              </label>
                              <div className="flex gap-2">
                                {selectedCourse.offeredTerms.map(t => (
                                  <span
                                    key={t}
                                    className="rounded-lg bg-zinc-100 px-3 py-1 text-[10px] font-bold uppercase">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-200 uppercase font-black tracking-widest">
                      Select a Course
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {statusMessage && (
        <div
          className={cn(
            'fixed bottom-10 right-10 flex items-center gap-3 rounded-2xl px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border backdrop-blur-md animate-in fade-in slide-in-from-bottom-5',
            statusMessage.tone === 'success'
              ? 'bg-emerald-600/90 border-emerald-400 text-white'
              : 'bg-rose-600/90 border-rose-400 text-white'
          )}>
          {statusMessage.tone === 'success' ? (
            <CheckCircle2Icon className="size-5" />
          ) : (
            <AlertCircleIcon className="size-5" />
          )}
          <span className="text-sm font-bold tracking-tight">{statusMessage.text}</span>
        </div>
      )}
    </main>
  )
}

function NavIcon({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: any
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 transition',
        active ? 'text-zinc-900' : 'text-zinc-300 hover:text-zinc-500'
      )}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  )
}

function CourseCard({
  code,
  termId,
  onRemove,
  onDrag,
  status,
  compact,
}: {
  code: string
  termId: string
  onRemove: () => void
  onDrag: () => void
  status?: string
  compact?: boolean
}) {
  const course = COURSE_MAP.get(code)
  return (
    <div
      draggable
      onDragStart={onDrag}
      className={cn(
        'group relative flex flex-col gap-1 rounded-xl border bg-white shadow-sm transition hover:shadow-md cursor-grab active:cursor-grabbing',
        compact ? 'p-2' : 'p-4',
        status === 'invalid' ? 'border-rose-200 bg-rose-50/50' : 'border-zinc-100'
      )}>
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100 hover:text-rose-500">
        <Trash2Icon className="size-3" />
      </button>
      <div className={cn('font-black text-zinc-900', compact ? 'text-[10px]' : 'text-xs')}>
        {code}
      </div>
      {!compact && <div className="truncate text-[10px] text-zinc-500">{course?.title}</div>}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase text-zinc-400">{course?.credits} CR</span>
        {status === 'eligible' ? (
          <CheckCircle2Icon className="size-3 text-emerald-500" />
        ) : (
          status === 'invalid' && <AlertCircleIcon className="size-3 text-rose-500" />
        )}
      </div>
    </div>
  )
}

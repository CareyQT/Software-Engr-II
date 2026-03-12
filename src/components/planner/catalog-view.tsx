'use client'

import { useState, useEffect } from 'react'
import { SearchIcon, LoaderCircleIcon, ShoppingCartIcon } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { fetchCoursesFromFirebase } from '@/src/lib/services/plannerService'
import { COURSE_MAP } from '@/src/lib/termwise/data'
import { TERM_SEASONS, Course, TermSeason } from '@/src/lib/termwise/types'
import { cn } from '@/src/lib/utils'

interface CatalogProps {
  cart: string[]
  setCart: React.Dispatch<React.SetStateAction<string[]>>
  departments: string[]
}

export function CatalogView({ cart, setCart, departments }: CatalogProps) {
  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('__all_departments__')
  const [termFilter, setTermFilter] = useState('__all_terms__')
  const [results, setResults] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCode, setSelectedCode] = useState('')

  useEffect(() => {
    let active = true
    const search = async () => {
      setLoading(true)
      const data = await fetchCoursesFromFirebase({
        query: query.trim(),
        department: deptFilter === '__all_departments__' ? '' : deptFilter,
        term: termFilter === '__all_terms__' ? '' : (termFilter as TermSeason),
      })
      if (active) setResults(data)
      setLoading(false)
    }
    const timer = setTimeout(search, 300)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, deptFilter, termFilter])

  const selectedData = COURSE_MAP.get(selectedCode)

  return (
    <div className="grid h-full grid-cols-[400px_1fr] divide-x divide-zinc-100">
      {/* Search Sidebar */}
      <div className="flex flex-col gap-8 p-10 bg-zinc-50/30 overflow-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-400">Search Catalog</label>
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
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all_departments__">All Fields</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={termFilter} onValueChange={setTermFilter}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all_terms__">Any Term</SelectItem>
                {TERM_SEASONS.map(s => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {loading ? (
            <div className="py-20 text-center">
              <LoaderCircleIcon className="mx-auto animate-spin" />
            </div>
          ) : (
            results.map(c => (
              <button
                key={c.code}
                onClick={() => setSelectedCode(c.code)}
                className={cn(
                  'w-full rounded-2xl border p-5 text-left transition',
                  selectedCode === c.code
                    ? 'border-black bg-black text-white'
                    : 'border-zinc-100 bg-white hover:border-zinc-300'
                )}>
                <div className="text-sm font-black">{c.code}</div>
                <div className="truncate text-[10px] opacity-60 font-medium">{c.title}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="p-16 overflow-auto">
        {selectedCode && selectedData ? (
          <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
              <h2 className="text-6xl font-black tracking-tighter">{selectedCode}</h2>
              <Button
                size="lg"
                className="rounded-2xl h-16 px-10 bg-black"
                onClick={() => {
                  if (!cart.includes(selectedCode)) setCart(prev => [...prev, selectedCode])
                }}>
                <ShoppingCartIcon className="mr-3 size-5" /> Add to Cart
              </Button>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-zinc-400">Description</label>
              <p className="text-lg leading-relaxed text-zinc-600">{selectedData.description}</p>
              <div className="grid grid-cols-2 gap-10 pt-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">
                    Prerequisites
                  </label>
                  <p className="font-bold">{selectedData.prerequisiteText || 'None'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Offered</label>
                  <div className="flex gap-2">
                    {selectedData.offeredTerms.map(t => (
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
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-200 uppercase font-black tracking-widest">
            Select a Course
          </div>
        )}
      </div>
    </div>
  )
}

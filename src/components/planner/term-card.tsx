import { PlusIcon, Trash2Icon, CheckCircle2Icon, AlertCircleIcon } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { COURSE_MAP } from '@/src/lib/termwise/data'
import { cn } from '@/src/lib/utils'

export function TermCard({
  term,
  gridRows,
  dragState,
  setDragState,
  validation,
  onMove,
  onAdd,
}: any) {
  return (
    <div
      className="flex flex-col gap-4"
      onDragOver={e => e.preventDefault()}
      onDrop={() => {
        if (!dragState) return
        if (dragState.from === 'term') onMove(dragState.code, dragState.termId, term.id)
        else onAdd(dragState.code, term.id)
        setDragState(null)
      }}>
      <div className="flex items-center justify-between px-1">
        <h4 className="font-black text-sm uppercase tracking-tight">{term.label}</h4>
      </div>
      <div
        className={cn(
          'flex flex-col gap-3 rounded-[2rem] border-2 border-transparent bg-zinc-100/50 p-4 transition-all hover:border-zinc-200',
          gridRows === 1 ? 'min-h-[450px]' : gridRows === 2 ? 'min-h-[220px]' : 'min-h-[140px]'
        )}>
        {term.courses.map((code: string) => {
          const status = validation.byCourseAndTerm[`${term.id}-${code}`]?.status
          return (
            <div
              key={code}
              draggable
              onDragStart={() => setDragState({ from: 'term', termId: term.id, code })}
              className={cn(
                'group relative flex flex-col gap-1 rounded-2xl border bg-white shadow-sm cursor-grab',
                gridRows === 4 ? 'p-2' : 'p-5',
                status === 'invalid' && 'border-rose-200 bg-rose-50/50'
              )}>
              <span className="text-xs font-black">{code}</span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-zinc-300">Core</span>
                {status === 'eligible' ? (
                  <CheckCircle2Icon className="size-3 text-emerald-400" />
                ) : (
                  <AlertCircleIcon className="size-3 text-rose-400" />
                )}
              </div>
            </div>
          )
        })}
        {/* Popover logic for quick search remains here */}
      </div>
    </div>
  )
}

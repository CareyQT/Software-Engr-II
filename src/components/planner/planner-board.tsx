import { AlertCircleIcon, ShoppingCartIcon, XIcon } from 'lucide-react'
import { DragState, GridRows, PlannedTerm, PlanValidationResponse } from '@/src/lib/termwise/types'
import { TermCard } from './term-card'

interface BoardProps {
  terms: PlannedTerm[]
  gridRows: GridRows
  cart: string[]
  setCart: (c: any) => void
  dragState: DragState
  setDragState: (s: DragState) => void
  validation: PlanValidationResponse
  onMove: (code: string, from: string, to: string) => void
  onAdd: (code: string, to: string) => void
}

export function PlannerBoard({
  terms,
  gridRows,
  cart,
  setCart,
  dragState,
  setDragState,
  validation,
  onMove,
  onAdd,
}: BoardProps) {
  return (
    <div className="grid h-full grid-cols-[320px_1fr] divide-x divide-zinc-100">
      {/* Sidebar Staging Area */}
      <div className="flex flex-col gap-6 overflow-auto bg-zinc-50/30 p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest">
              Course Cart
            </h3>
            <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
              {cart.length}
            </span>
          </div>
          <div className="min-h-[120px] rounded-2xl border-2 border-dashed border-zinc-200 p-4 bg-white/50">
            {cart.map(code => (
              <div
                key={code}
                draggable
                onDragStart={() => setDragState({ from: 'cart', code })}
                className="mb-2 flex items-center justify-between rounded-xl border border-zinc-100 bg-white p-3 shadow-sm cursor-grab">
                <span className="text-xs font-bold">{code}</span>
                <button onClick={() => setCart((prev: string[]) => prev.filter(c => c !== code))}>
                  <XIcon className="size-3 text-zinc-300" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Grid Board */}
      <div className="flex-1 overflow-auto bg-zinc-100/20 p-10">
        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: `repeat(${Math.ceil(terms.length / gridRows)}, 320px)`,
            gridAutoFlow: 'row dense',
          }}>
          {terms.map(term => (
            <TermCard
              key={term.id}
              term={term}
              gridRows={gridRows}
              dragState={dragState}
              setDragState={setDragState}
              validation={validation}
              onMove={onMove}
              onAdd={onAdd}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

import { GridIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { cn } from '@/src/lib/utils'

interface HeaderProps {
  viewMode: string
  gridRows: number
  setGridRows: (r: any) => void
  saveName: string
  setSaveName: (n: string) => void
  activePlanId: string
  savedPlans: any[]
  onLoad: (id: string) => void
  onNew: () => void
  onSave: (e: any) => void
}

export function PlannerHeader({
  viewMode,
  gridRows,
  setGridRows,
  saveName,
  setSaveName,
  activePlanId,
  savedPlans,
  onLoad,
  onNew,
  onSave,
}: HeaderProps) {
  return (
    <header className="flex h-24 items-center justify-between border-b border-zinc-100 px-10">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-black tracking-tighter text-black uppercase">
          {viewMode === 'plans' ? 'Academic Board' : 'Global Catalog'}
        </h1>
        {viewMode === 'plans' && (
          <div className="flex items-center gap-2 rounded-xl bg-zinc-100 p-1">
            {[1, 2, 4].map(r => (
              <button
                key={r}
                onClick={() => setGridRows(r)}
                className={cn(
                  'px-3 py-1 text-[10px] font-bold rounded-lg transition',
                  gridRows === r ? 'bg-white shadow-sm text-black' : 'text-zinc-400'
                )}>
                {r} ROW{r > 1 && 'S'}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Input
          value={saveName}
          onChange={e => setSaveName(e.target.value)}
          className="w-64 h-10 rounded-xl"
          placeholder="Plan Name..."
        />
        <Select value={activePlanId || '__draft_plan__'} onValueChange={onLoad}>
          <SelectTrigger className="w-56 rounded-xl border-zinc-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__draft_plan__">Unsaved Draft</SelectItem>
            {savedPlans.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="rounded-xl" onClick={onNew}>
          New
        </Button>
        <Button variant="default" className="rounded-xl bg-black px-6" onClick={onSave}>
          Save
        </Button>
      </div>
    </header>
  )
}

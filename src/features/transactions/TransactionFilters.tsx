import { Search } from 'lucide-react'
import { Chip } from '@/components/ui/Chip'
import type { TransactionType } from '@/types/domain'

export type TypeFilter = 'TODOS' | TransactionType

interface Props {
  search: string
  onSearch: (v: string) => void
  typeFilter: TypeFilter
  onTypeFilter: (v: TypeFilter) => void
}

export function TransactionFilters({ search, onSearch, typeFilter, onTypeFilter }: Props) {
  return (
    <div className="mb-4 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ph" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar por descripción..."
          className="w-full rounded-lg border border-border bg-bg py-2.5 pl-9 pr-3 text-sm text-body outline-none focus:border-green"
        />
      </div>
      <div className="flex gap-2">
        <Chip active={typeFilter === 'TODOS'} onClick={() => onTypeFilter('TODOS')}>
          Todos
        </Chip>
        <Chip active={typeFilter === 'INGRESO'} onClick={() => onTypeFilter('INGRESO')}>
          Ingresos
        </Chip>
        <Chip active={typeFilter === 'GASTO'} onClick={() => onTypeFilter('GASTO')}>
          Gastos
        </Chip>
      </div>
    </div>
  )
}

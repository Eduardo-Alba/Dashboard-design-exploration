import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EXPENSE_CATEGORIES, CATEGORY_LABELS } from '@/lib/constants/categories'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import type { Budget } from '@/types/domain'

interface Props {
  open: boolean
  onClose: () => void
  month: string
  editing?: Budget | null
}

export function BudgetFormModal({ open, onClose, month, editing }: Props) {
  const profile = useAuthStore((s) => s.profile)
  const showToast = useUIStore((s) => s.showToast)
  const [category, setCategory] = useState(editing?.category ?? EXPENSE_CATEGORIES[0])
  const [limit, setLimit] = useState(String(editing?.limit_amount ?? ''))
  const [isSaving, setIsSaving] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    const limitAmount = Number(limit)
    if (!limit || Number.isNaN(limitAmount) || limitAmount <= 0) return
    setIsSaving(true)
    const { error } = await supabase
      .from('budgets')
      .upsert(
        { business_id: profile.business_id, category, limit_amount: limitAmount, month },
        { onConflict: 'business_id,category,month' },
      )
    setIsSaving(false)
    if (error) {
      showToast('error', 'No se pudo guardar el presupuesto.')
      return
    }
    showToast('success', 'Presupuesto guardado')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}>
      <form onSubmit={onSubmit}>
        <Select label="Categoría" value={category} onChange={(e) => setCategory(e.target.value as typeof category)} disabled={!!editing}>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>
        <Input label="Límite mensual" type="number" min="0" step="0.01" prefix="RD$" value={limit} onChange={(e) => setLimit(e.target.value)} />
        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}

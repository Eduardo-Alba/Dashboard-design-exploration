import { useState, type SyntheticEvent } from 'react'
import { Paperclip } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { supabase } from '@/lib/supabase/client'
import { CATEGORY_LABELS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants/categories'
import { formatDOP } from '@/lib/finance/formatters'
import type { Transaction, TransactionCategory, TransactionType } from '@/types/domain'
import { cn } from '@/lib/utils/cn'

function nowLocal(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const initialState = () => ({
  type: 'INGRESO' as TransactionType,
  amount: '',
  category: INCOME_CATEGORIES[0] as TransactionCategory,
  description: '',
  occurredAt: nowLocal(),
  receipt: null as File | null,
})

export function TransactionFormModal() {
  const isOpen = useUIStore((s) => s.isRegisterModalOpen)
  const close = useUIStore((s) => s.closeRegisterModal)
  const showToast = useUIStore((s) => s.showToast)
  const profile = useAuthStore((s) => s.profile)
  const addOptimistic = useTransactionsStore((s) => s.addOptimistic)

  const [form, setForm] = useState(initialState())
  const [errors, setErrors] = useState<{ amount?: string; occurredAt?: string }>({})
  const [isSaving, setIsSaving] = useState(false)

  const categories = form.type === 'INGRESO' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  function setType(type: TransactionType) {
    const cats = type === 'INGRESO' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    setForm((f) => ({ ...f, type, category: cats[0] }))
  }

  function validate(): boolean {
    const next: typeof errors = {}
    const amountNum = Number(form.amount)
    if (!form.amount || Number.isNaN(amountNum) || amountNum <= 0) {
      next.amount = 'Ingresa un monto válido mayor a RD$0.'
    }
    if (new Date(form.occurredAt) > new Date()) {
      next.occurredAt = 'La fecha no puede ser futura.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function uploadReceipt(businessId: string, txId: string): Promise<string | null> {
    if (!form.receipt) return null
    const path = `${businessId}/${txId}-${form.receipt.name}`
    const { error } = await supabase.storage.from('receipts').upload(path, form.receipt)
    if (error) return null
    return path
  }

  async function save(andNew: boolean, e: SyntheticEvent) {
    e.preventDefault()
    if (!profile || !validate()) return
    setIsSaving(true)

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        business_id: profile.business_id,
        user_id: profile.id,
        type: form.type,
        category: form.category,
        amount: Number(form.amount),
        description: form.description.trim() || null,
        occurred_at: new Date(form.occurredAt).toISOString(),
      })
      .select()
      .single()

    if (error || !data) {
      showToast('error', 'No se pudo guardar la transacción. Intenta de nuevo.')
      setIsSaving(false)
      return
    }

    const tx = data as Transaction
    if (form.receipt) {
      const documentUrl = await uploadReceipt(profile.business_id, tx.id)
      if (documentUrl) await supabase.from('transactions').update({ document_url: documentUrl }).eq('id', tx.id)
    }

    addOptimistic(tx)
    showToast('success', `Guardado: ${form.type === 'INGRESO' ? 'Ingreso' : 'Gasto'} de ${formatDOP(tx.amount)}`)
    setIsSaving(false)

    if (andNew) {
      setForm({ ...initialState(), type: form.type, category: categories[0] })
    } else {
      setForm(initialState())
      close()
    }
  }

  function onClose() {
    setForm(initialState())
    setErrors({})
    close()
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Registrar Transacción">
      <form onSubmit={(e) => save(false, e)}>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('INGRESO')}
            className={cn(
              'rounded-lg border-2 py-3 text-sm font-bold cursor-pointer transition-colors',
              form.type === 'INGRESO' ? 'border-green bg-pastel text-green-d' : 'border-border text-sec',
            )}
          >
            ↑ INGRESO
          </button>
          <button
            type="button"
            onClick={() => setType('GASTO')}
            className={cn(
              'rounded-lg border-2 py-3 text-sm font-bold cursor-pointer transition-colors',
              form.type === 'GASTO' ? 'border-brown bg-brown-bg text-brown' : 'border-border text-sec',
            )}
          >
            ↓ GASTO
          </button>
        </div>

        <Input
          label="Monto"
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          prefix="RD$"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          error={errors.amount}
          className="font-mono text-lg font-bold"
        />

        <Select
          label="Categoría"
          name="category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TransactionCategory }))}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>

        <Input
          label="Descripción (opcional)"
          name="description"
          placeholder="Ej: Venta de mercancía"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />

        <Input
          label="Fecha y hora"
          name="occurredAt"
          type="datetime-local"
          max={nowLocal()}
          value={form.occurredAt}
          onChange={(e) => setForm((f) => ({ ...f, occurredAt: e.target.value }))}
          error={errors.occurredAt}
        />

        <label className="mb-5 flex items-center gap-2 rounded-lg border-2 border-dashed border-border px-3.5 py-2.5 text-sm font-semibold text-sec cursor-pointer hover:border-green hover:text-green">
          <Paperclip size={16} />
          {form.receipt ? form.receipt.name : 'Adjuntar comprobante'}
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => setForm((f) => ({ ...f, receipt: e.target.files?.[0] ?? null }))}
          />
        </label>

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar'}
          </Button>
          <Button type="button" variant="secondary" disabled={isSaving} onClick={(e) => save(true, e)}>
            Guardar y nuevo
          </Button>
          <Button type="button" variant="ghost" disabled={isSaving} onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}

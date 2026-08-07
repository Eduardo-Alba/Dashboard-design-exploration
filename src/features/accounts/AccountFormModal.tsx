import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import type { AccountDirection } from '@/types/domain'

interface Props {
  open: boolean
  onClose: () => void
  direction: AccountDirection
}

export function AccountFormModal({ open, onClose, direction }: Props) {
  const profile = useAuthStore((s) => s.profile)
  const showToast = useUIStore((s) => s.showToast)
  const [party, setParty] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    const amountNum = Number(amount)
    if (!party.trim() || !amountNum || amountNum <= 0 || !dueDate) return
    setIsSaving(true)
    const { error } = await supabase.from('receivables_payables').insert({
      business_id: profile.business_id,
      direction,
      party: party.trim(),
      amount: amountNum,
      due_date: dueDate,
      status: 'PENDIENTE',
    })
    setIsSaving(false)
    if (error) {
      showToast('error', 'No se pudo guardar.')
      return
    }
    showToast('success', 'Guardado correctamente')
    setParty('')
    setAmount('')
    setDueDate('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={direction === 'COBRAR' ? 'Nueva Deuda' : 'Nuevo Pago'}>
      <form onSubmit={onSubmit}>
        <Input label={direction === 'COBRAR' ? 'Cliente' : 'Proveedor'} value={party} onChange={(e) => setParty(e.target.value)} />
        <Input label="Monto" type="number" min="0" step="0.01" prefix="RD$" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input label="Fecha de vencimiento" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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

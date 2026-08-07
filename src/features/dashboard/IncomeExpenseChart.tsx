import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { formatDOP } from '@/lib/finance/formatters'
import type { Transaction } from '@/types/domain'

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function buildLast7Days(transactions: Transaction[]) {
  const days: { key: string; label: string; ingresos: number; gastos: number }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push({ key: d.toDateString(), label: DAY_LABELS[d.getDay()], ingresos: 0, gastos: 0 })
  }
  const byKey = new Map(days.map((d) => [d.key, d]))
  for (const t of transactions) {
    const key = new Date(t.occurred_at).toDateString()
    const bucket = byKey.get(key)
    if (!bucket) continue
    if (t.type === 'INGRESO') bucket.ingresos += t.amount
    else bucket.gastos += t.amount
  }
  return days
}

export function IncomeExpenseChart({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => buildLast7Days(transactions), [transactions])

  return (
    <Card className="mb-4.5">
      <div className="mb-3 text-sm font-bold text-text">Ingresos vs Gastos (últimos 7 días)</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--sec)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--sec)' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              formatter={(value) => formatDOP(Number(value))}
              contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
            />
            <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="var(--green)" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="gastos" name="Gastos" stroke="var(--brown)" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-sec">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green" /> Ingresos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brown" /> Gastos
        </span>
      </div>
    </Card>
  )
}

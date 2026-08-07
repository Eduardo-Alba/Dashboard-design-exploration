import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ExportButtons } from './ExportButtons'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { useBusinessStore } from '@/store/useBusinessStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { calcCategoryBreakdown, calcPeriodSummary, calcSaldoTotal, monthKey } from '@/lib/finance/calculations'
import { CATEGORY_LABELS } from '@/lib/constants/categories'
import { formatDOP } from '@/lib/finance/formatters'
import type { ReportExportData } from '@/lib/export-strategies'

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function monthLabel(month: string): string {
  const [y, m] = month.split('-')
  return `${MONTH_LABELS[Number(m) - 1]} ${y}`
}

export function ReportsPage() {
  const business = useBusinessStore((s) => s.business)
  const transactions = useTransactionsStore((s) => s.transactions)
  const isLoading = useTransactionsStore((s) => s.isLoading)

  const months = useMemo(() => {
    const set = new Set(transactions.map((t) => monthKey(t.occurred_at)))
    set.add(monthKey(new Date().toISOString()))
    return [...set].sort().reverse()
  }, [transactions])

  const [month, setMonth] = useState(months[0])
  const selectedMonth = months.includes(month) ? month : months[0]

  const monthTx = useMemo(() => transactions.filter((t) => monthKey(t.occurred_at) === selectedMonth), [transactions, selectedMonth])
  const beforeMonthTx = useMemo(() => transactions.filter((t) => monthKey(t.occurred_at) < selectedMonth), [transactions, selectedMonth])

  const summary = useMemo(() => calcPeriodSummary(monthTx), [monthTx])
  const breakdown = useMemo(() => calcCategoryBreakdown(monthTx), [monthTx])
  const saldoInicial = useMemo(() => (business ? calcSaldoTotal(business, beforeMonthTx) : 0), [business, beforeMonthTx])
  const saldoFinal = saldoInicial + summary.ingresos - summary.gastos

  const chartData = breakdown.map((b) => ({ categoria: CATEGORY_LABELS[b.category as keyof typeof CATEGORY_LABELS] ?? b.category, monto: b.amount }))

  function buildData(): ReportExportData {
    return {
      business: { name: business?.name ?? 'FinanZen', rnc: business?.rnc },
      period: { label: monthLabel(selectedMonth) },
      summary,
      breakdown: breakdown.map((b) => ({ category: CATEGORY_LABELS[b.category as keyof typeof CATEGORY_LABELS] ?? b.category, amount: b.amount, pct: b.pct })),
      cashFlow: { saldoInicial, ingresos: summary.ingresos, gastos: summary.gastos, saldoFinal },
      transactions: monthTx.map((t) => ({
        date: t.occurred_at.slice(0, 10),
        type: t.type,
        category: CATEGORY_LABELS[t.category],
        description: t.description ?? '',
        amount: t.amount,
      })),
    }
  }

  if (isLoading && transactions.length === 0) {
    return (
      <div className="fz-screen flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="fz-screen">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-text">Reportes</h1>
        <div className="w-48">
          <Select value={selectedMonth} onChange={(e) => setMonth(e.target.value)} className="mb-0">
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="mb-4.5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <div className="text-[12.5px] text-sec">Ingresos</div>
          <div className="font-mono text-lg font-bold text-green">{formatDOP(summary.ingresos)}</div>
        </div>
        <div>
          <div className="text-[12.5px] text-sec">Gastos</div>
          <div className="font-mono text-lg font-bold text-brown">{formatDOP(summary.gastos)}</div>
        </div>
        <div>
          <div className="text-[12.5px] text-sec">Ganancia Neta</div>
          <div className="font-mono text-lg font-bold text-green-d">{formatDOP(summary.ganancia)}</div>
        </div>
        <div>
          <div className="text-[12.5px] text-sec">Margen</div>
          <div className="font-mono text-lg font-bold text-green-d">{summary.margen.toFixed(1)}%</div>
        </div>
      </Card>

      <Card className="mb-4.5">
        <div className="mb-3 text-sm font-bold text-text">Desglose por categoría</div>
        {breakdown.length === 0 ? (
          <div className="py-4 text-center text-sm text-sec">Sin gastos este mes.</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {breakdown.map((b) => (
              <div key={b.category} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 text-body">{CATEGORY_LABELS[b.category as keyof typeof CATEGORY_LABELS] ?? b.category}</span>
                <div className="h-2 flex-1 rounded-full bg-pastel overflow-hidden">
                  <div className="h-full rounded-full bg-teal" style={{ width: `${b.pct}%` }} />
                </div>
                <span className="w-24 shrink-0 text-right font-mono text-body">{formatDOP(b.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mb-4.5">
        <div className="mb-3 text-sm font-bold text-text">Flujo de caja</div>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-sec">Saldo inicial</span>
            <span className="font-mono text-body">{formatDOP(saldoInicial)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sec">+ Ingresos</span>
            <span className="font-mono text-green">{formatDOP(summary.ingresos)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sec">− Gastos</span>
            <span className="font-mono text-brown">{formatDOP(summary.gastos)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-border pt-1.5 font-bold">
            <span className="text-text">= Saldo final</span>
            <span className="font-mono text-green-d">{formatDOP(saldoFinal)}</span>
          </div>
        </div>
      </Card>

      <Card className="mb-4.5">
        <div className="mb-3 text-sm font-bold text-text">Gastos del mes por categoría</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="categoria" tick={{ fontSize: 11, fill: 'var(--sec)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--sec)' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                formatter={(value) => formatDOP(Number(value))}
                contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
              />
              <Bar dataKey="monto" fill="var(--teal)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <ExportButtons buildData={buildData} />
    </div>
  )
}

import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '@/components/ui/Card'
import { calcCategoryBreakdown } from '@/lib/finance/calculations'
import { CATEGORY_LABELS } from '@/lib/constants/categories'
import { formatDOP } from '@/lib/finance/formatters'
import type { Transaction } from '@/types/domain'

const COLORS = ['var(--green)', 'var(--teal)', 'var(--green-d)', 'var(--pastel)', 'var(--teal-d)', 'var(--brown)']

export function CategoryDonutChart({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(
    () => calcCategoryBreakdown(transactions).map((d) => ({ name: CATEGORY_LABELS[d.category as keyof typeof CATEGORY_LABELS] ?? d.category, value: d.amount })),
    [transactions],
  )

  return (
    <Card className="mb-4.5">
      <div className="mb-3 text-sm font-bold text-text">Gastos por categoría</div>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-sec">Sin gastos registrados en este período.</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatDOP(Number(value))}
                contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-sec">
        {data.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {d.name}
          </span>
        ))}
      </div>
    </Card>
  )
}

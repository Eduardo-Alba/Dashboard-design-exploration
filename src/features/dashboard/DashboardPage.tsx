import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BarChart3, Plus } from 'lucide-react'
import { PeriodSelector } from './PeriodSelector'
import { KpiGrid } from './KpiGrid'
import { AlertsWidget } from './AlertsWidget'
import { IncomeExpenseChart } from './IncomeExpenseChart'
import { CategoryDonutChart } from './CategoryDonutChart'
import { RecentTransactionsList } from './RecentTransactionsList'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/useAuthStore'
import { useBusinessStore } from '@/store/useBusinessStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useUIStore } from '@/store/useUIStore'
import { useAlerts } from '@/hooks/useAlerts'
import { calcPeriodSummary, calcSaldoTotal, filterByRange, inPeriod, type Period } from '@/lib/finance/calculations'
import { todayLocalDateInput } from '@/lib/finance/formatters'

export function DashboardPage() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const business = useBusinessStore((s) => s.business)
  const transactions = useTransactionsStore((s) => s.transactions)
  const isLoading = useTransactionsStore((s) => s.isLoading)
  const openRegisterModal = useUIStore((s) => s.openRegisterModal)
  const { fixed: alerts } = useAlerts()

  const [period, setPeriod] = useState<Period>('mes')
  const today = todayLocalDateInput()
  const [customFrom, setCustomFrom] = useState(today)
  const [customTo, setCustomTo] = useState(today)

  const periodTransactions = useMemo(() => {
    if (period === 'todo') {
      return filterByRange(transactions, new Date(`${customFrom}T00:00:00`), new Date(`${customTo}T23:59:59`))
    }
    return transactions.filter((t) => inPeriod(t, period))
  }, [transactions, period, customFrom, customTo])

  const summary = useMemo(() => calcPeriodSummary(periodTransactions), [periodTransactions])
  const saldoTotal = useMemo(() => (business ? calcSaldoTotal(business, transactions) : 0), [business, transactions])

  if (isLoading && transactions.length === 0) {
    return (
      <div className="fz-screen flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="fz-screen">
      <div className="mb-4 flex flex-wrap items-baseline gap-2.5">
        <h1 className="text-2xl font-extrabold text-text">¡Hola, {profile?.full_name.split(' ')[0]}!</h1>
        <span className="text-[13.5px] text-sec">Aquí está tu negocio hoy.</span>
      </div>

      <PeriodSelector
        period={period}
        onChange={setPeriod}
        customFrom={customFrom}
        customTo={customTo}
        onCustomChange={(f, t) => {
          setCustomFrom(f)
          setCustomTo(t)
        }}
      />

      <KpiGrid saldoTotal={saldoTotal} summary={summary} />
      <AlertsWidget alerts={alerts} />
      <IncomeExpenseChart transactions={transactions} />
      <CategoryDonutChart transactions={periodTransactions} />

      <div className="mb-4.5 flex flex-wrap gap-2.5">
        <Button icon={<Plus size={16} />} onClick={openRegisterModal}>
          Registrar
        </Button>
        <Button variant="secondary" icon={<BarChart3 size={16} />} onClick={() => navigate('/reportes')}>
          Ver Reportes
        </Button>
        <Button variant="outline" icon={<Bell size={16} />} onClick={() => navigate('/alertas')}>
          Alertas
        </Button>
      </div>

      <RecentTransactionsList transactions={transactions} />
    </div>
  )
}

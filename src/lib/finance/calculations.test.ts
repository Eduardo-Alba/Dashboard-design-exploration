import { describe, expect, it } from 'vitest'
import {
  budgetThreshold,
  calcBudgetConsumption,
  calcCashFlowRisk,
  calcPeriodSummary,
  calcSaldoTotal,
  displayStatus,
  monthKey,
} from './calculations'
import type { AccountEntry, Budget, Business, Transaction } from '@/types/domain'

const business: Business = {
  id: 'b1',
  name: 'Colmado Guzmán',
  rubro: 'Colmado',
  rnc: null,
  initial_balance: 10000,
  currency: 'DOP',
  created_at: '2026-01-01',
}

function tx(partial: Partial<Transaction>): Transaction {
  return {
    id: crypto.randomUUID(),
    business_id: 'b1',
    user_id: 'u1',
    type: 'INGRESO',
    category: 'VENTAS',
    amount: 100,
    description: null,
    occurred_at: '2026-06-15T10:00:00Z',
    document_url: null,
    created_at: '2026-06-15T10:00:00Z',
    ...partial,
  }
}

describe('monthKey', () => {
  it('usa el mes local, no UTC, y rellena el mes con cero', () => {
    // Mediodia UTC no cruza dia/mes en ninguna zona horaria razonable (-12..+14).
    expect(monthKey('2026-06-15T12:00:00Z')).toBe('2026-06')
    expect(monthKey('2026-01-15T12:00:00Z')).toBe('2026-01')
  })
})

describe('calcSaldoTotal', () => {
  it('suma saldo inicial + ingresos - gastos', () => {
    const txs = [tx({ type: 'INGRESO', amount: 5000 }), tx({ type: 'GASTO', amount: 2000, category: 'INVENTARIO' })]
    expect(calcSaldoTotal(business, txs)).toBe(10000 + 5000 - 2000)
  })
})

describe('calcPeriodSummary', () => {
  it('calcula ganancia y margen', () => {
    const txs = [tx({ type: 'INGRESO', amount: 1000 }), tx({ type: 'GASTO', amount: 400, category: 'RENTA' })]
    const s = calcPeriodSummary(txs)
    expect(s.ingresos).toBe(1000)
    expect(s.gastos).toBe(400)
    expect(s.ganancia).toBe(600)
    expect(s.margen).toBe(60)
  })

  it('margen es 0 si no hay ingresos (evita división por cero)', () => {
    expect(calcPeriodSummary([tx({ type: 'GASTO', amount: 100, category: 'RENTA' })]).margen).toBe(0)
  })
})

describe('calcBudgetConsumption + budgetThreshold', () => {
  const budget: Budget = { id: 'bg1', business_id: 'b1', category: 'INVENTARIO', limit_amount: 20000, month: '2026-06', created_at: '' }

  it('92% -> alerta', () => {
    const txs = [tx({ type: 'GASTO', category: 'INVENTARIO', amount: 18400, occurred_at: '2026-06-10T00:00:00Z' })]
    const { pct } = calcBudgetConsumption(budget, txs)
    expect(pct).toBeCloseTo(92, 5)
    expect(budgetThreshold(pct)).toBe('alerta')
  })

  it('100% -> excedido, y transacciones de otro mes no cuentan', () => {
    const txs = [
      tx({ type: 'GASTO', category: 'INVENTARIO', amount: 20000, occurred_at: '2026-06-10T00:00:00Z' }),
      tx({ type: 'GASTO', category: 'INVENTARIO', amount: 99999, occurred_at: '2026-05-10T00:00:00Z' }),
    ]
    const { pct } = calcBudgetConsumption(budget, txs)
    expect(pct).toBe(100)
    expect(budgetThreshold(pct)).toBe('excedido')
  })
})

describe('displayStatus', () => {
  it('marca VENCIDA una cuenta pendiente con fecha pasada, sin mutar el original', () => {
    const account: AccountEntry = {
      id: 'a1', business_id: 'b1', direction: 'COBRAR', party: 'Rosa Rodríguez', amount: 2000,
      due_date: '2020-01-01', status: 'PENDIENTE', created_at: '', updated_at: '',
    }
    expect(displayStatus(account)).toBe('VENCIDA')
    expect(account.status).toBe('PENDIENTE')
  })

  it('no reescribe PAGADO', () => {
    const account: AccountEntry = {
      id: 'a2', business_id: 'b1', direction: 'PAGAR', party: 'X', amount: 100,
      due_date: '2020-01-01', status: 'PAGADO', created_at: '', updated_at: '',
    }
    expect(displayStatus(account)).toBe('PAGADO')
  })
})

describe('calcCashFlowRisk', () => {
  it('en riesgo si saldo + por cobrar < por pagar', () => {
    const accounts: AccountEntry[] = [
      { id: '1', business_id: 'b1', direction: 'COBRAR', party: 'A', amount: 1000, due_date: '2026-07-01', status: 'PENDIENTE', created_at: '', updated_at: '' },
      { id: '2', business_id: 'b1', direction: 'PAGAR', party: 'B', amount: 5000, due_date: '2026-07-01', status: 'PENDIENTE', created_at: '', updated_at: '' },
    ]
    const r = calcCashFlowRisk(2000, accounts)
    expect(r.atRisk).toBe(true)
    expect(r.shortfall).toBe(2000) // 5000 - (2000+1000)
  })

  it('no en riesgo si alcanza', () => {
    const accounts: AccountEntry[] = [
      { id: '2', business_id: 'b1', direction: 'PAGAR', party: 'B', amount: 500, due_date: '2026-07-01', status: 'PENDIENTE', created_at: '', updated_at: '' },
    ]
    expect(calcCashFlowRisk(2000, accounts).atRisk).toBe(false)
  })
})

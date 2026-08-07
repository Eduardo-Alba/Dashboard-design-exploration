export interface ReportExportData {
  business: { name: string; rnc?: string | null }
  period: { label: string }
  summary: { ingresos: number; gastos: number; ganancia: number; margen: number }
  breakdown: { category: string; amount: number; pct: number }[]
  cashFlow: { saldoInicial: number; ingresos: number; gastos: number; saldoFinal: number }
  transactions: { date: string; type: 'INGRESO' | 'GASTO'; category: string; description: string; amount: number }[]
}

export interface IExportStrategy {
  readonly format: 'pdf' | 'xlsx'
  execute(data: ReportExportData): Promise<void>
}

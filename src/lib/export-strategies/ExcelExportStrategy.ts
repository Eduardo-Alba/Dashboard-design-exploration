import ExcelJS from 'exceljs'
import type { IExportStrategy, ReportExportData } from './IExportStrategy'

export class ExcelExportStrategy implements IExportStrategy {
  readonly format = 'xlsx' as const

  async execute(data: ReportExportData): Promise<void> {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'FinanZen'

    const summary = workbook.addWorksheet('Resumen')
    summary.columns = [
      { header: 'Concepto', key: 'concepto', width: 24 },
      { header: 'Monto', key: 'monto', width: 16 },
    ]
    summary.addRows([
      { concepto: `Reporte: ${data.period.label}`, monto: '' },
      { concepto: 'Ingresos', monto: data.summary.ingresos },
      { concepto: 'Gastos', monto: data.summary.gastos },
      { concepto: 'Ganancia neta', monto: data.summary.ganancia },
      { concepto: 'Margen (%)', monto: Number(data.summary.margen.toFixed(1)) },
    ])
    summary.getRow(1).font = { bold: true }

    const breakdown = workbook.addWorksheet('Por categoría')
    breakdown.columns = [
      { header: 'Categoría', key: 'category', width: 22 },
      { header: 'Monto', key: 'amount', width: 16 },
      { header: '%', key: 'pct', width: 10 },
    ]
    breakdown.addRows(data.breakdown.map((b) => ({ category: b.category, amount: b.amount, pct: Number(b.pct.toFixed(1)) })))
    breakdown.getRow(1).font = { bold: true }

    const cashFlow = workbook.addWorksheet('Flujo de caja')
    cashFlow.columns = [
      { header: 'Concepto', key: 'concepto', width: 22 },
      { header: 'Monto', key: 'monto', width: 16 },
    ]
    cashFlow.addRows([
      { concepto: 'Saldo inicial', monto: data.cashFlow.saldoInicial },
      { concepto: '+ Ingresos', monto: data.cashFlow.ingresos },
      { concepto: '− Gastos', monto: data.cashFlow.gastos },
      { concepto: '= Saldo final', monto: data.cashFlow.saldoFinal },
    ])
    cashFlow.getRow(1).font = { bold: true }

    const txSheet = workbook.addWorksheet('Transacciones')
    txSheet.columns = [
      { header: 'Fecha', key: 'date', width: 14 },
      { header: 'Tipo', key: 'type', width: 10 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Descripción', key: 'description', width: 30 },
      { header: 'Monto', key: 'amount', width: 14 },
    ]
    txSheet.addRows(data.transactions)
    txSheet.getRow(1).font = { bold: true }

    const buffer = await workbook.xlsx.writeBuffer()
    const filename = `finanzen-reporte-${data.period.label.replace(/\s+/g, '-').toLowerCase()}.xlsx`
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}

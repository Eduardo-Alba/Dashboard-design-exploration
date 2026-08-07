import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDOP } from '@/lib/finance/formatters'
import type { IExportStrategy, ReportExportData } from './IExportStrategy'

export class PDFExportStrategy implements IExportStrategy {
  readonly format = 'pdf' as const

  async execute(data: ReportExportData): Promise<void> {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.setTextColor(27, 94, 63)
    doc.text(data.business.name, 14, 18)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Reporte financiero · ${data.period.label}`, 14, 25)

    autoTable(doc, {
      startY: 32,
      head: [['Resumen', 'Monto']],
      body: [
        ['Ingresos', formatDOP(data.summary.ingresos)],
        ['Gastos', formatDOP(data.summary.gastos)],
        ['Ganancia neta', formatDOP(data.summary.ganancia)],
        ['Margen', `${data.summary.margen.toFixed(1)}%`],
      ],
      headStyles: { fillColor: [90, 155, 111] },
      theme: 'striped',
    })

    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8,
      head: [['Categoría', 'Monto', '%']],
      body: data.breakdown.map((b) => [b.category, formatDOP(b.amount), `${b.pct.toFixed(1)}%`]),
      headStyles: { fillColor: [43, 138, 138] },
      theme: 'striped',
    })

    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8,
      head: [['Flujo de caja', 'Monto']],
      body: [
        ['Saldo inicial', formatDOP(data.cashFlow.saldoInicial)],
        ['+ Ingresos', formatDOP(data.cashFlow.ingresos)],
        ['− Gastos', formatDOP(data.cashFlow.gastos)],
        ['= Saldo final', formatDOP(data.cashFlow.saldoFinal)],
      ],
      headStyles: { fillColor: [27, 94, 63] },
      theme: 'striped',
    })

    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8,
      head: [['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto']],
      body: data.transactions.map((t) => [t.date, t.type, t.category, t.description, formatDOP(t.amount)]),
      headStyles: { fillColor: [45, 55, 72] },
      styles: { fontSize: 8 },
      theme: 'striped',
    })

    const filename = `finanzen-reporte-${data.period.label.replace(/\s+/g, '-').toLowerCase()}.pdf`
    doc.save(filename)
  }
}

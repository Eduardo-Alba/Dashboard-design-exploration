import type { IExportStrategy } from './IExportStrategy'

export type { IExportStrategy, ReportExportData } from './IExportStrategy'

// Strategy pattern: el reporte no conoce jsPDF ni exceljs, solo pide la estrategia por formato.
// Carga perezosa a propósito: jsPDF+autotable y exceljs juntos pesan >1MB minificados y solo
// hacen falta si el usuario realmente exporta — no tiene sentido meterlos en el bundle inicial
// que se descarga en cada visita (incluida la pantalla de Login).
const loaders: Record<'pdf' | 'xlsx', () => Promise<IExportStrategy>> = {
  pdf: async () => new (await import('./PDFExportStrategy')).PDFExportStrategy(),
  xlsx: async () => new (await import('./ExcelExportStrategy')).ExcelExportStrategy(),
}

export function loadExportStrategy(format: 'pdf' | 'xlsx'): Promise<IExportStrategy> {
  return loaders[format]()
}

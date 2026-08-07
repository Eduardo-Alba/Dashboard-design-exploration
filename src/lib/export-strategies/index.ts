import { PDFExportStrategy } from './PDFExportStrategy'
import { ExcelExportStrategy } from './ExcelExportStrategy'
import type { IExportStrategy } from './IExportStrategy'

export type { IExportStrategy, ReportExportData } from './IExportStrategy'

// Strategy pattern: el reporte no conoce jsPDF ni exceljs, solo invoca la estrategia elegida.
export const exportStrategies: Record<'pdf' | 'xlsx', IExportStrategy> = {
  pdf: new PDFExportStrategy(),
  xlsx: new ExcelExportStrategy(),
}

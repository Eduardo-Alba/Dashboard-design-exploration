import { useState } from 'react'
import { FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/store/useUIStore'
import { loadExportStrategy, type ReportExportData } from '@/lib/export-strategies'

export function ExportButtons({ buildData }: { buildData: () => ReportExportData }) {
  const showToast = useUIStore((s) => s.showToast)
  const [pending, setPending] = useState<'pdf' | 'xlsx' | null>(null)

  async function run(format: 'pdf' | 'xlsx') {
    setPending(format)
    showToast('success', 'Generando reporte…')
    try {
      const strategy = await loadExportStrategy(format)
      await strategy.execute(buildData())
    } catch {
      showToast('error', 'No se pudo generar el reporte.')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <Button variant="secondary" icon={<FileText size={16} />} disabled={pending !== null} onClick={() => run('pdf')}>
        {pending === 'pdf' ? 'Generando…' : 'PDF'}
      </Button>
      <Button variant="secondary" icon={<FileSpreadsheet size={16} />} disabled={pending !== null} onClick={() => run('xlsx')}>
        {pending === 'xlsx' ? 'Generando…' : 'Excel'}
      </Button>
    </div>
  )
}

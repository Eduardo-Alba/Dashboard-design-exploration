/** "YYYY-MM-DD" en fecha LOCAL, para el valor por defecto de `<input type="date">` (evita que
 * toISOString() adelante el día cerca de medianoche en zonas horarias detrás de UTC). */
export function todayLocalDateInput(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDOP(amount: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-DO', { day: '2-digit', month: 'short' })
    .format(new Date(iso))
    .toUpperCase()
    .replace('.', '')
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const date = formatDate(iso)
  const time = new Intl.DateTimeFormat('es-DO', { hour: '2-digit', minute: '2-digit' }).format(d)
  return `${date} ${time}`
}

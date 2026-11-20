export const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']

export const HOLIDAYS_2026 = {
  '2026-01-01': '元旦', '2026-01-02': '元旦', '2026-01-03': '元旦',
  '2026-02-15': '除夕', '2026-02-16': '春节', '2026-02-17': '春节',
  '2026-02-18': '春节', '2026-02-19': '春节', '2026-02-20': '春节',
  '2026-02-21': '春节', '2026-02-22': '春节', '2026-02-23': '春节',
  '2026-04-04': '清明', '2026-04-05': '清明', '2026-04-06': '清明',
  '2026-05-01': '劳动节', '2026-05-02': '劳动节', '2026-05-03': '劳动节',
  '2026-05-04': '劳动节', '2026-05-05': '劳动节',
  '2026-06-19': '端午', '2026-06-20': '端午', '2026-06-21': '端午',
  '2026-09-25': '中秋', '2026-09-26': '中秋', '2026-09-27': '中秋',
  '2026-10-01': '国庆', '2026-10-02': '国庆', '2026-10-03': '国庆',
  '2026-10-04': '国庆', '2026-10-05': '国庆', '2026-10-06': '国庆', '2026-10-07': '国庆'
}

export function pad2(n) {
  return Number(n) < 10 ? '0' + Number(n) : '' + Number(n)
}

export function fmtDate(d) {
  const dt = d instanceof Date ? d : new Date(d)
  if (!(dt instanceof Date) || isNaN(dt.getTime())) return ''
  return dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate())
}

export function parseLocalDate(dateStr) {
  if (!dateStr) return null
  const dt = new Date(String(dateStr).replace(/-/g, '/'))
  if (isNaN(dt.getTime())) return null
  return dt
}

export function monthDay(dateStr) {
  const dt = parseLocalDate(dateStr)
  if (!dt) return ''
  return (dt.getMonth() + 1) + '/' + dt.getDate()
}

export function weekText(dateStr, weekLabels) {
  const dt = parseLocalDate(dateStr)
  if (!dt) return ''
  const labels = weekLabels || WEEK_LABELS
  return '周' + labels[dt.getDay()]
}

export function dateLine(dateStr, weekLabels) {
  const md = monthDay(dateStr)
  if (!md) return ''
  return md + ' ' + weekText(dateStr, weekLabels)
}

export function monthRange(year, month) {
  const start = fmtDate(new Date(year, month - 1, 1))
  const end = fmtDate(new Date(year, month, 0))
  return { start: start, end: end }
}

export function isVisibleCalendarClass(row) {
  const s = String((row && row.status) || 'open').toLowerCase()
  if (
    s === 'cancelled' ||
    s === 'canceled' ||
    s === 'deleted' ||
    s === 'disabled' ||
    s === '已取消' ||
    s === '停用'
  ) return false
  if (s === 'closed' || s === 'close' || s === '未开放' || s === '关闭') return false
  return true
}

export function normClassType(item) {
  const s = String((item && (item.classType || item.class_type)) || '').toLowerCase()
  if (
    s === 'self' ||
    s === 'self_organized' ||
    s === 'self-organized' ||
    s === 'selforganize' ||
    s === 'self-organize' ||
    s === '自组' ||
    s === '自组团课'
  ) return 'self'
  return 'fixed'
}

export function classHint(c) {
  const typ = normClassType(c)
  const label = typ === 'self' ? '自组' : '固定'
  const enrolled = Number((c && c.enrolled) || 0)
  const cap = Number((c && c.capacity) || 0)
  return { kind: typ, text: label + ' · ' + enrolled + '/' + cap }
}

export function decorateVenues(list) {
  const src = Array.isArray(list) ? list : []
  const out = []
  for (let i = 0; i < src.length; i++) {
    const v = src[i] || {}
    const classes = (v.classes || []).filter(isVisibleCalendarClass)
    if (!classes.length) continue
    out.push({
      venueId: String(v.venueId || ''),
      venueName: v.venueName || v.venueShort || '',
      venueShort: v.venueShort || v.venueName || '',
      classes: classes,
      hints: classes.map(classHint)
    })
  }
  return out
}

export function buildMonthCells(opts) {
  const year = Number(opts && opts.year)
  const month = Number(opts && opts.month)
  const calendarDays = (opts && opts.calendarDays) || {}
  const selectedDate = (opts && opts.selectedDate) || ''
  const today = (opts && opts.today) || fmtDate(new Date())
  const holidays = (opts && opts.holidays) || HOLIDAYS_2026
  const weekLabels = (opts && opts.weekLabels) || WEEK_LABELS

  const first = new Date(year, month - 1, 1)
  const start = first.getDay()
  const days = new Date(year, month, 0).getDate()
  const list = []

  function cell(date, day, inMonth) {
    const venues = inMonth ? decorateVenues(calendarDays[date] || []) : []
    return {
      day: day,
      date: date,
      inMonth: inMonth,
      dateLine: date ? dateLine(date, weekLabels) : '',
      md: date ? monthDay(date) : '',
      weekText: date ? weekText(date, weekLabels) : '',
      holiday: (inMonth && holidays[date]) || '',
      isToday: !!(inMonth && date === today),
      isSelected: !!(inMonth && date && date === selectedDate),
      venues: venues,
      venueCount: venues.length,
      singleVenue: venues.length === 1
    }
  }

  for (let i = 0; i < start; i++) {
    const prev = new Date(year, month - 1, -start + i + 1)
    list.push(cell(fmtDate(prev), prev.getDate(), false))
  }
  for (let d = 1; d <= days; d++) {
    const cur = new Date(year, month - 1, d)
    list.push(cell(fmtDate(cur), d, true))
  }
  while (list.length % 7) {
    const next = new Date(year, month, list.length - start - days + 1)
    list.push(cell(fmtDate(next), next.getDate(), false))
  }
  return list
}

export function findVenue(venues, venueId) {
  const id = String(venueId || '')
  const list = venues || []
  for (let i = 0; i < list.length; i++) {
    if (String(list[i].venueId) === id) return list[i]
  }
  return null
}

export function unwrapEvent(e) {
  if (e == null) return e
  if (typeof e === 'string' || typeof e === 'number') return e
  if (e.detail != null && (typeof e.detail === 'string' || typeof e.detail === 'number')) return e.detail
  if (e.detail && typeof e.detail === 'object' && (e.detail.id || e.detail.date || e.detail.days)) return e.detail
  return e
}

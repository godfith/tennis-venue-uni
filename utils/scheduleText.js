export function workbenchScheduleText(opts) {
  const o = opts || {}
  let title = o.title || '我的课程安排'
  if (o.venueName) title += ' · ' + o.venueName
  const lines = [title]
  const rows = o.rows || []
  if (!rows.length) {
    lines.push('暂无课程')
    return lines.join('\n')
  }
  rows.forEach((r) => {
    const kind = r.kind === 'group'
      ? (r.name || '团课')
      : (r.kind === 'lock' || r.status === 'locked' ? '锁场' : (r.userName ? ('学员：' + r.userName) : ''))
    const parts = [r.date || '', r.time || '', r.venueName || '', r.court || '', kind].filter(Boolean)
    lines.push(parts.join(' '))
  })
  return lines.join('\n')
}

export function shortVenueName(name) {
  const s = String(name || '').trim()
  if (!s) return ''
  const m = s.match(/[（(]([^）)]+)[）)]/)
  if (m) return m[1].replace(/店$/, '')
  const stripped = s.replace(/^山羊Goat[·•\s]*/i, '').replace(/网球馆$/, '').replace(/店$/, '').trim()
  return stripped || s
}

export function shareTitle(venueName) {
  const short = shortVenueName(venueName)
  return short ? ('山羊Goat·' + short) : '山羊Goat网球馆'
}

export function buildQuery(params) {
  const parts = []
  const src = params || {}
  Object.keys(src).forEach((k) => {
    const v = src[k]
    if (v == null || v === '') return
    parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)))
  })
  return parts.length ? ('?' + parts.join('&')) : ''
}

export function indexSharePath(venueId) {
  return '/pages/index/index' + buildQuery({ venueId: venueId || '' })
}

export function groupSharePath(opts) {
  const o = opts || {}
  return '/pages/group/group' + buildQuery({
    venueId: o.venueId || '',
    classId: o.classId || '',
    date: o.date || ''
  })
}

export function bookingSharePath(venueId) {
  return '/pages/booking/booking' + buildQuery({ venueId: venueId || '' })
}

export function applyIncomingVenue(options, stored) {
  const opt = options || {}
  const incomingId = String(opt.venueId || opt.venue_id || '').trim()
  const incomingName = String(opt.venueName || opt.venue_name || '').trim()
  if (incomingId) {
    return { venueId: incomingId, venueName: incomingName, fromShare: true, shouldStore: true }
  }
  const st = stored || {}
  return {
    venueId: String(st.venueId || st.venue_id || '').trim(),
    venueName: String(st.venueName || st.venue_name || '').trim(),
    fromShare: false,
    shouldStore: false
  }
}

export function pickVenueFromList(list, venueId) {
  if (!venueId || !list) return null
  for (let i = 0; i < list.length; i++) {
    const v = list[i]
    if (String((v && (v.venueId || v._id || v.id)) || '') === String(venueId)) return v
  }
  return null
}

export function indexSharePayload(venueId, venueName) {
  return {
    title: shareTitle(venueName),
    path: indexSharePath(venueId)
  }
}

export function groupSharePayload(opts) {
  const o = opts || {}
  const title = o.venueId ? shareTitle(o.venueName) : '山羊Goat网球馆'
  return {
    title: title,
    path: groupSharePath(o)
  }
}

export default {
  shortVenueName,
  shareTitle,
  buildQuery,
  indexSharePath,
  groupSharePath,
  bookingSharePath,
  applyIncomingVenue,
  pickVenueFromList,
  indexSharePayload,
  groupSharePayload
}

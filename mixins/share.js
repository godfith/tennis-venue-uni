import { indexSharePayload } from '@/utils/shareVenue.js'

function currentVenue() {
  return {
    venueId: uni.getStorageSync('venue_id') || '',
    venueName: uni.getStorageSync('venue_name') || ''
  }
}

export default {
  onShareAppMessage() {
    var v = currentVenue()
    return indexSharePayload(v.venueId, v.venueName)
  },
  onShareTimeline() {
    var v = currentVenue()
    return { title: indexSharePayload(v.venueId, v.venueName).title }
  }
}

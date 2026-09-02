const API_BASE =
  'https://cloud1-d3g0pb1qk028e3585-d862bc2-1312769671.ap-shanghai.app.tcloudbase.com'

function unwrap(data) {
  if (data == null) return {}
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch (e) {
      return { ok: false, msg: data }
    }
  }
  return data
}

export function callCloud(opts) {
  const name = (opts && opts.name) || ''
  const incoming = (opts && opts.data) || {}
  const payload = Object.assign(
    {
      openid: uni.getStorageSync('openid') || '',
      phone: uni.getStorageSync('phone') || '',
      userId: uni.getStorageSync('userDocId') || incoming.userId || ''
    },
    incoming
  )

  return new Promise(function (resolve, reject) {
    uni.request({
      url: API_BASE + '/' + name,
      method: 'POST',
      timeout: 20000,
      header: { 'content-type': 'application/json' },
      data: payload,
      success: function (res) {
        const result = unwrap(res.data)
        const wrapped = { result: result, statusCode: res.statusCode }
        if (typeof opts.success === 'function') opts.success(wrapped)
        resolve(wrapped)
      },
      fail: function (err) {
        if (typeof opts.fail === 'function') opts.fail(err)
        reject(err)
      },
      complete: function (res) {
        if (typeof opts.complete === 'function') opts.complete(res)
      }
    })
  })
}

export function installHttpCloud() {
  const api = {
    init: function () {},
    callFunction: callCloud
  }
  try {
    if (typeof wx !== 'undefined') {
      wx.cloud = api
    }
  } catch (e) {}
  return api
}

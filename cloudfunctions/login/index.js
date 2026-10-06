const mysql = require('mysql2/promise')
const https = require('https')

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'sh-cynosdbmysql-grp-94l9er02.sql.tencentcdb.com',
  port: Number(process.env.DB_PORT || 26462),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'goat_prod',
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 10000
})

const WX_APPID = process.env.WX_APPID || 'wxe2f073ca2e08c355'
const WX_SECRET = process.env.WX_SECRET || ''

function parseEvent(event) {
  if (event && event.body) {
    try {
      return typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    } catch (e) {
      return event
    }
  }
  return event || {}
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let raw = ''
        res.on('data', (c) => (raw += c))
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw))
          } catch (e) {
            reject(e)
          }
        })
      })
      .on('error', reject)
  })
}

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {})
    const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
      let raw = ''
      res.on('data', (c) => (raw += c))
      res.on('end', () => {
        try { resolve(JSON.parse(raw)) } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}
async function code2openid(code) {
  if (!code) return ''
  if (!WX_SECRET) return ''
  const url =
    'https://api.weixin.qq.com/sns/jscode2session?appid=' +
    encodeURIComponent(WX_APPID) +
    '&secret=' +
    encodeURIComponent(WX_SECRET) +
    '&js_code=' +
    encodeURIComponent(code) +
    '&grant_type=authorization_code'
  const data = await getJson(url)
  return (data && data.openid) || ''
}

function mapUser(user, openid, nickName, avatarUrl, phone) {
  return {
    ok: true,
    openid: openid || user.openid || '',
    userDocId: String(user.id),
    userId: String(user.id),
    nickName: nickName || user.nick_name || '',
    avatarUrl: avatarUrl || user.avatar_url || '',
    phone: phone || user.phone || '',
    role: user.role || 'user',
    venueId: user.venue_id || '',
    venueName: user.venue_name || '',
    balance: Number(user.balance) || 0,
    points: Number(user.points) || 0
  }
}

exports.main = async (event) => {
  try {
    if (!process.env.DB_PASSWORD) {
      return { ok: false, msg: 'login 未配置 DB_PASSWORD', fnVer: 'login-20260916a' }
    }
    const body = parseEvent(event)
    const action = body.action || 'openid'
    let openid = body.openid || ''
    if (body.code && action !== 'getPhone') {
      const got = await code2openid(body.code)
      if (got) openid = got
    }

    if (action === 'getPhone') {
      const phoneCode = body.phoneCode || ''
      if (!phoneCode) return { ok: false, msg: '缺少手机号凭证', fnVer: 'login-20261006a' }
      if (!WX_SECRET) return { ok: false, msg: '未配置 WX_SECRET', fnVer: 'login-20261006a' }
      const tokenRes = await getJson(
        'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
        encodeURIComponent(WX_APPID) + '&secret=' + encodeURIComponent(WX_SECRET)
      )
      if (!tokenRes || !tokenRes.access_token) {
        return { ok: false, msg: (tokenRes && tokenRes.errmsg) || '获取微信凭证失败', fnVer: 'login-20261006a' }
      }
      const phoneRes = await postJson(
        'https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=' + tokenRes.access_token,
        { code: phoneCode }
      )
      const phone = phoneRes && phoneRes.phone_info && phoneRes.phone_info.phoneNumber
      if (!phone) return { ok: false, msg: (phoneRes && phoneRes.errmsg) || '未解析到手机号', fnVer: 'login-20261006a' }
      return { ok: true, phone: String(phone).replace(/\D/g, '').slice(-11), fnVer: 'login-20261006a' }
    }

    if (action === 'openid') {
      return { ok: true, openid, appid: WX_APPID }
    }

    if (action === 'setVenue') {
      const venueId = body.venueId || ''
      const venueName = body.venueName || ''
      const userId = body.userId || ''
      if (!venueId) return { ok: false, msg: '请选择场馆' }
      if (!userId && !openid) return { ok: false, msg: '请先登录' }
      if (userId && /^\d+$/.test(String(userId))) {
        await pool.query(
          'UPDATE users SET venue_id=?, venue_name=?, updated_at=NOW() WHERE id=?',
          [venueId, venueName, Number(userId)]
        )
      } else if (openid) {
        await pool.query(
          'UPDATE users SET venue_id=?, venue_name=?, updated_at=NOW() WHERE openid=?',
          [venueId, venueName, openid]
        )
      }
      return { ok: true, venueId, venueName }
    }

    if (action === 'register' || action === 'login') {
      const phone = String(body.phone || '').replace(/\D/g, '').slice(-11)
      if (!phone || phone.length < 8) return { ok: false, msg: '请填写手机号', fnVer: 'login-20260915a' }
      const nickIn = (body.nickName || '').trim()
      const avatarUrl = body.avatarUrl || ''
      const nickName = nickIn || ('用户' + phone.slice(-4))

      const [byPhone] = await pool.query('SELECT * FROM users WHERE phone=? LIMIT 1', [phone])
      let user = byPhone[0] || null

      async function bindOpenid(uid, currentOpenid) {
        if (!openid) return currentOpenid || ('p_' + phone)
        if (currentOpenid === openid) return openid
        const [dup] = await pool.query('SELECT id FROM users WHERE openid=? AND id<>? LIMIT 1', [openid, uid])
        if (dup && dup[0]) return currentOpenid || ('p_' + phone)
        await pool.query('UPDATE users SET openid=?, updated_at=NOW() WHERE id=?', [openid, uid])
        return openid
      }

      async function finishExisting(row) {
        const nextNick = (row.nick_name && String(row.nick_name).trim()) ? row.nick_name : (nickIn || nickName)
        const nextAvatar = avatarUrl || row.avatar_url || ''
        await pool.query(
          'UPDATE users SET nick_name=?, avatar_url=?, updated_at=NOW() WHERE id=?',
          [nextNick, nextAvatar, row.id]
        )
        const bound = await bindOpenid(row.id, row.openid)
        const [fresh] = await pool.query('SELECT * FROM users WHERE id=? LIMIT 1', [row.id])
        const mapped = mapUser(fresh[0] || row, bound, nextNick, nextAvatar, phone)
        mapped.isNew = false
        mapped.msg = '该手机号已注册，已登录原账号'
        mapped.fnVer = 'login-20260915b'
        return mapped
      }

      if (user) return await finishExisting(user)

      let oid = openid || ('p_' + phone)
      if (openid) {
        const [dup] = await pool.query('SELECT id FROM users WHERE openid=? LIMIT 1', [openid])
        if (dup && dup[0]) oid = 'p_' + phone
      }
      let res
      try {
        ;[res] = await pool.query(
          `INSERT INTO users (openid, user_id, nick_name, avatar_url, phone, role, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'user', NOW(), NOW())`,
          [oid, 'U' + phone.slice(-8), nickName, avatarUrl, phone]
        )
      } catch (err) {
        if (String(err.message || '').includes('Duplicate') || err.errno === 1062) {
          const [again] = await pool.query('SELECT * FROM users WHERE phone=? LIMIT 1', [phone])
          if (again[0]) return await finishExisting(again[0])
        }
        throw err
      }
      try {
        await pool.query(
          `INSERT INTO activity_logs (type, user_name, operator_name, phone, detail, venue_id, venue_name, created_at)
           VALUES ('register', ?, '系统', ?, '手机号注册', '', '', NOW())`,
          [nickName, phone]
        )
      } catch (e) {}
      return {
        ok: true,
        isNew: true,
        fnVer: 'login-20260915b',
        msg: '新手机号，已创建账号',
        openid: oid,
        userDocId: String(res.insertId),
        userId: String(res.insertId),
        nickName,
        avatarUrl,
        phone,
        role: 'user',
        venueId: '',
        venueName: ''
      }
    }

    return { ok: true, openid, appid: WX_APPID }
  } catch (e) {
    console.error(e)
    return { ok: false, msg: e.message || '登录失败' }
  }
}

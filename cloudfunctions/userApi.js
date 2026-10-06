const mysql = require('mysql2/promise')
let cloud = null
try {
  cloud = require('wx-server-sdk')
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
} catch (e) {}
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
function fmtDate(v) {
  if (!v) return null
  if (typeof v === 'string') return v.slice(0, 10)
  if (v instanceof Date) {
    const y = v.getFullYear()
    const m = String(v.getMonth() + 1).padStart(2, '0')
    const d = String(v.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return String(v).slice(0, 10)
}
function fmtDateCn(v) {
  if (!v) return ''
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) {
    const [y, m, d] = v.slice(0, 10).split('-')
    return `${y}年${Number(m)}月${Number(d)}日`
  }
  const d = v instanceof Date ? v : new Date(v)
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 10)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}
function parseTimeRule(v) {
  if (!v) return null
  if (typeof v === 'object') return v
  try {
    return JSON.parse(v)
  } catch (e) {
    return null
  }
}
function parseEvent(event) {
  if (event && event.body) {
    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
      return Object.assign({}, event, body)
    } catch (e) {
      return event
    }
  }
  return event || {}
}
async function writeLog(connOrPool, row) {
  try {
    await connOrPool.query(
      `INSERT INTO activity_logs
        (type, user_name, operator_name, phone, detail, venue_id, venue_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        row.type || '',
        row.userName || '',
        row.operatorName || '',
        row.phone || '',
        row.detail || '',
        row.venueId || '',
        row.venueName || ''
      ]
    )
  } catch (e) {
    console.warn('activity_logs write skip:', e.message)
  }
}
function money(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}
function weekdayMon1(dateStr) {
  const s = fmtDate(dateStr)
  if (!s) return 0
  const d = new Date(s.replace(/-/g, '/'))
  if (Number.isNaN(d.getTime())) return 0
  const w = d.getDay()
  return w === 0 ? 7 : w
}
function daysBetween(from, to) {
  if (!from || !to) return 1
  const a = new Date(fmtDate(from).replace(/-/g, '/'))
  const b = new Date(fmtDate(to).replace(/-/g, '/'))
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 1
  const diff = Math.floor((b - a) / 86400000) + 1
  return diff > 0 ? diff : 1
}
function cardUnit(card) {
  if (!card) return 0
  const price = money(card.price)
  if ((card.type === 'times' || card.type === 'coach' || card.type === 'group') && Number(card.total_times) > 0 && price > 0) {
    return money(price / Number(card.total_times))
  }
  if (card.type === 'time' && price > 0) {
    return money(price / daysBetween(card.valid_from, card.valid_to))
  }
  return 0
}
async function resolveUserId(conn, userIdVal, openidVal, phoneVal) {
  if (userIdVal && Number.isFinite(Number(userIdVal))) return Number(userIdVal)
  const phone = String(phoneVal || '').replace(/\D/g, '').slice(-11)
  if (phone) {
    try {
      const [rows] = await conn.query('SELECT id FROM users WHERE phone=? LIMIT 1', [phone])
      if (rows[0] && rows[0].id) return Number(rows[0].id)
    } catch (e) {}
  }
  if (!openidVal) return null
  try {
    const [rows] = await conn.query('SELECT id FROM users WHERE openid=? LIMIT 1', [openidVal])
    if (rows[0] && rows[0].id) return Number(rows[0].id)
  } catch (e) {}
  return null
}
async function getSlotPrice(conn, venueId, court, dateStr, timeStr) {
  const wd = weekdayMon1(dateStr)
  if (!venueId || !court || !wd || !timeStr) return 0
  try {
    const [rows] = await conn.query(
      `SELECT price FROM court_prices
        WHERE venue_id=? AND court=? AND weekday=? AND time_slot=? LIMIT 1`,
      [venueId, court, wd, timeStr]
    )
    return money(rows[0] && rows[0].price)
  } catch (e) {
    return 0
  }
}
async function writeLedger(conn, row) {
  try {
    await conn.query(
      `INSERT INTO finance_ledger
        (biz_date, type, amount, venue_id, venue_name, user_id, user_name,
         operator_name, card_id, booking_id, pay_order_id, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.bizDate,
        row.type,
        money(row.amount),
        row.venueId || '',
        row.venueName || '',
        row.userId || null,
        row.userName || '',
        row.operatorName || '',
        row.cardId || null,
        row.bookingId || null,
        row.payOrderId || null,
        row.remark || ''
      ]
    )
  } catch (e) {
    console.warn('finance_ledger write skip:', e.message)
  }
}
const FN_VER = 'userApi-20260916b'
const HOUR_FALLBACK = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
  '18:00-19:00', '19:00-20:00', '20:00-21:00'
]

exports.main = async (rawEvent) => {
  try {
    const event = parseEvent(rawEvent)
    const action = event.action || ''
    if (action === 'ver' || action === '__ver__') {
      return { ok: true, fnVer: FN_VER }
    }
    let openid = event.openid || ''
    try {
      if (cloud && cloud.getWXContext) {
        const wxContext = cloud.getWXContext()
        if (wxContext && wxContext.OPENID) openid = wxContext.OPENID
      }
    } catch (e) {}

    if (action === 'getVenues') {
      try {
        const [rows] = await pool.query(
          `SELECT * FROM venues WHERE status='active' ORDER BY sort ASC, id ASC`
        )
        const list = (rows || []).map((r) => ({
          _id: r.id,
          venueId: r.id,
          name: r.name,
          address: r.address || '',
          status: r.status,
          sort: r.sort || 0
        }))
        return { ok: true, list, fnVer: FN_VER }
      } catch (e) {
        console.error('getVenues', e)
        return { ok: false, list: [], msg: e.message || '读取场馆失败', fnVer: FN_VER }
      }
    }
    if (action === 'getCourts') {
      const venueId = event.venueId || ''
      if (!venueId) return { ok: false, msg: '缺少场馆' }
      const [rows] = await pool.query(
        `SELECT * FROM courts WHERE venue_id=? AND IFNULL(status,'open') NOT IN ('disabled','closed','停用') ORDER BY sort ASC, id ASC`,
        [venueId]
      )
      const list = (rows || []).map((r) => ({
        _id: String(r.id),
        venueId: r.venue_id,
        name: r.name,
        type: r.type || '',
        status: r.status
      }))
      return { ok: true, list }
    }
    if (action === 'getSchedule') {
      const { venueId, date } = event
      if (!venueId || !date) return { ok: false, msg: '参数不完整' }
      const [books] = await pool.query(
        `SELECT * FROM bookings WHERE venue_id=? AND date=?`,
        [venueId, date]
      )
      const [groups] = await pool.query(
        `SELECT * FROM group_classes WHERE venue_id=? AND date=?`,
        [venueId, date]
      )
      const bookings = (books || []).map((r) => ({
        _id: String(r.id),
        court: r.court,
        time: r.time,
        status: r.status,
        coachId: r.coach_id ? String(r.coach_id) : '',
        groupClassId: r.group_class_id ? String(r.group_class_id) : ''
      }))
      const groupClasses = (groups || []).map((r) => ({
        _id: String(r.id),
        court: r.court,
        time: r.time,
        status: r.status,
        name: r.name,
        coachId: r.coach_id ? String(r.coach_id) : '',
        enrolled: r.enrolled || 0,
        capacity: r.capacity || 0
      }))
      return { ok: true, bookings, groupClasses }
    }
    if (action === 'createBooking') {
      const data = event.data || {}
      if (!data.venueId || !data.court || !data.date || !data.time) {
        return { ok: false, msg: '参数不完整' }
      }
      const conn = await pool.getConnection()
      try {
        await conn.beginTransaction()
        let userIdVal = null
        if (data.userId != null && String(data.userId).trim() !== '') {
          const s = String(data.userId).trim()
          if (/^\d+$/.test(s)) userIdVal = Number(s)
        }
        userIdVal = await resolveUserId(conn, userIdVal, openid || data.openid || '', data.phone || event.phone || '')
        let coachIdVal = null
        if (data.coachId != null && /^\d+$/.test(String(data.coachId))) {
          coachIdVal = Number(data.coachId)
        }
        const dateYmd = fmtDate(data.date) || data.date
        const [gc] = await conn.query(
          `SELECT id FROM group_classes
           WHERE venue_id=? AND date=? AND time=? AND court=? AND status='open' LIMIT 1`,
          [data.venueId, dateYmd, data.time, data.court]
        )
        if (gc.length) {
          await conn.rollback()
          return { ok: false, msg: '该时段为团课，无法普通预约' }
        }
        const [busy] = await conn.query(
          `SELECT id FROM bookings
           WHERE venue_id=? AND date=? AND time=? AND court=? AND status='booked' LIMIT 1`,
          [data.venueId, dateYmd, data.time, data.court]
        )
        if (busy.length) {
          await conn.rollback()
          return { ok: false, msg: '该时段已被预约' }
        }
        if (coachIdVal) {
          const [coachBusy] = await conn.query(
            `SELECT id FROM bookings
             WHERE venue_id=? AND date=? AND time=? AND coach_id=? AND status='booked' LIMIT 1`,
            [data.venueId, dateYmd, data.time, coachIdVal]
          )
          if (coachBusy.length) {
            await conn.rollback()
            return { ok: false, msg: '该教练此时段已被预约' }
          }
          const [coachGroup] = await conn.query(
            `SELECT id FROM group_classes
             WHERE venue_id=? AND date=? AND time=? AND coach_id=? AND status='open' LIMIT 1`,
            [data.venueId, dateYmd, data.time, coachIdVal]
          )
          if (coachGroup.length) {
            await conn.rollback()
            return { ok: false, msg: '该教练此时段有团课' }
          }
        }
        let cardIdVal = null
        let cardName = data.cardName || ''
        let cardType = data.cardType || ''
        let remainingAfter = null
        if (data.cardId) {
          const [cards] = await conn.query(
            'SELECT * FROM member_cards WHERE id=? FOR UPDATE',
            [data.cardId]
          )
          const card = cards[0]
          if (!card || card.status !== 'active') {
            await conn.rollback()
            return { ok: false, msg: '会员卡不可用' }
          }
          if (card.type === 'group') {
            await conn.rollback()
            return { ok: false, msg: '团课卡不能用于普通订场' }
          }
          if (coachIdVal && card.type !== 'coach') {
            await conn.rollback()
            return { ok: false, msg: '约教练只能使用教练卡' }
          }
          if (card.type === 'coach' && !coachIdVal) {
            await conn.rollback()
            return { ok: false, msg: '教练卡必须选择教练' }
          }
          if (userIdVal && card.user_id && Number(card.user_id) !== userIdVal) {
            await conn.rollback()
            return { ok: false, msg: '不能使用他人会员卡' }
          }
          const timeRule = parseTimeRule(card.time_rule)
          const dayCap = Number(timeRule && timeRule.maxHoursPerDay) || 0
          if (dayCap > 0) {
            const slotHours = (time) => {
              const parts = String(time || '').split('-')
              if (parts.length < 2) return 1
              const toMin = (s) => {
                const hm = String(s).split(':')
                return Number(hm[0]) * 60 + Number(hm[1] || 0)
              }
              const diff = (toMin(parts[1]) - toMin(parts[0])) / 60
              return diff > 0 ? diff : 1
            }
            const [usedRows] = await conn.query(
              `SELECT time FROM bookings WHERE card_id=? AND date=? AND status='booked'`,
              [card.id, dateYmd]
            )
            const used = (usedRows || []).reduce((s, r) => s + slotHours(r.time), 0)
            const add = slotHours(data.time)
            if (used + add > dayCap + 0.001) {
              await conn.rollback()
              return { ok: false, msg: `该卡每天最多可约 ${dayCap} 小时，今日已约 ${used} 小时` }
            }
          }
          if (card.type === 'time') {
            const timeRule = parseTimeRule(card.time_rule)
            if (timeRule && timeRule.mode === 'rules' && Array.isArray(timeRule.rules)) {
              const d = new Date(String(dateYmd).replace(/-/g, '/'))
              let weekday = d.getDay()
              if (weekday === 0) weekday = 7
              const slotStart = String(data.time || '').split('-')[0]
              let matched = null
              for (const r of timeRule.rules) {
                if (!(r.weekdays || []).includes(weekday)) continue
                const slots = r.timeSlots || []
                if (!slots.length) {
                  if (r.unlimited) {
                    matched = r
                    break
                  }
                  continue
                }
                for (const s of slots) {
                  if (slotStart >= s.start && slotStart < s.end) {
                    matched = r
                    break
                  }
                }
                if (matched) break
              }
              if (!matched) {
                await conn.rollback()
                return { ok: false, msg: '当前日期/时段不在时间卡可用范围内' }
              }
              const maxH = Number(matched.maxHours) || 0
              if (maxH > 0) {
                const [usedRows] = await conn.query(
                  `SELECT COUNT(*) AS cnt FROM bookings
                   WHERE card_id=? AND date=? AND status='booked'`,
                  [card.id, dateYmd]
                )
                const used = Number(usedRows[0] && usedRows[0].cnt) || 0
                if (used + 1 > maxH) {
                  await conn.rollback()
                  return {
                    ok: false,
                    msg: `时间卡今日最多可约 ${maxH} 小时，已约 ${used} 小时`
                  }
                }
              }
            }
          }
          if (card.type === 'times' || card.type === 'coach') {
            if ((card.remaining_times || 0) <= 0) {
              await conn.rollback()
              return { ok: false, msg: '卡次数不足' }
            }
            const left = card.remaining_times - 1
            remainingAfter = left
            await conn.query(
              `UPDATE member_cards SET remaining_times=?, status=?, updated_at=NOW() WHERE id=?`,
              [left, left <= 0 ? 'used_up' : 'active', card.id]
            )
          }
          cardIdVal = card.id
          cardName = card.card_name || cardName
          cardType = card.type || cardType
        }
        const userName = data.userName || ''
        const venueName = data.venueName || ''
        const slotPrice = await getSlotPrice(conn, data.venueId, data.court, dateYmd, data.time)
        let bookAmount = slotPrice
        let ledgerType = 'court_book'
        let ledgerAmt = slotPrice
        const payWay = String(data.payWay || event.payWay || '')
        if (payWay === 'balance' && !cardIdVal) {
          if (!userIdVal) {
            await conn.rollback()
            return { ok: false, msg: '请先登录后再用余额支付', fnVer: FN_VER }
          }
          const need = money(slotPrice)
          if (need <= 0) {
            await conn.rollback()
            return { ok: false, msg: '该时段没有标价，无法用余额支付', fnVer: FN_VER }
          }
          const [uw] = await conn.query(
            'SELECT IFNULL(balance,0) AS balance FROM users WHERE id=? FOR UPDATE',
            [userIdVal]
          )
          const bal = money(uw[0] && uw[0].balance)
          if (bal + 1e-9 < need) {
            await conn.rollback()
            return { ok: false, msg: '余额不足（当前 ¥' + bal.toFixed(2) + '）', fnVer: FN_VER }
          }
          await conn.query('UPDATE users SET balance=?, updated_at=NOW() WHERE id=?', [
            money(bal - need),
            userIdVal
          ])
          ledgerType = 'wallet_pay'
          ledgerAmt = need
          bookAmount = need
        }
        if (cardIdVal) {
          const [cardNow] = await conn.query('SELECT * FROM member_cards WHERE id=? LIMIT 1', [cardIdVal])
          ledgerType = 'card_use'
          ledgerAmt = cardUnit(cardNow[0])
          bookAmount = ledgerAmt
        }
        let payOrderId = null
        const tradeNo = data.outTradeNo || data.payOrderNo || ''
        if (tradeNo) {
          try {
            const [po] = await conn.query(
              'SELECT id FROM pay_orders WHERE out_trade_no=? LIMIT 1',
              [tradeNo]
            )
            if (po[0] && po[0].id) payOrderId = Number(po[0].id)
          } catch (e) {}
        } else if (data.payOrderId && Number(data.payOrderId) > 0) {
          payOrderId = Number(data.payOrderId)
        }
        const [res] = await conn.query(
          `INSERT INTO bookings (
            venue_id, venue_name, court, date, time,
            user_id, openid, user_name, phone, status,
            card_id, card_name, card_type,
            coach_id, coach_name, source, remark, amount, pay_order_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'booked', ?, ?, ?, ?, ?, 'user', ?, ?, ?)`,
          [
            data.venueId,
            venueName,
            data.court,
            dateYmd,
            data.time,
            userIdVal,
            openid || '',
            userName,
            data.phone || '',
            cardIdVal,
            cardName,
            cardType,
            coachIdVal,
            data.coachName || '',
            data.orderNo || data.outTradeNo || data.payOrderNo || 'GT' + Date.now(),
            bookAmount,
            payOrderId
          ]
        )
        if (payOrderId) {
          try {
            await conn.query('UPDATE pay_orders SET booking_id=? WHERE id=?', [
              res.insertId,
              payOrderId
            ])
          } catch (e) {}
        }
        await writeLedger(conn, {
          bizDate: dateYmd,
          type: ledgerType,
          amount: ledgerAmt,
          venueId: data.venueId,
          venueName,
          userId: userIdVal,
          userName,
          operatorName: userName || '用户',
          cardId: cardIdVal,
          bookingId: res.insertId,
          payOrderId,
          remark: [data.court, data.time, cardName ? '卡券:' + cardName : ''].filter(Boolean).join(' ')
        })
        let detail = `预约 ${data.court} ${fmtDateCn(dateYmd)} ${data.time}`
        if (data.coachName) detail += ` · 教练${data.coachName}`
        if (cardName) detail += ` · ${cardName}`
        await writeLog(conn, {
          type: 'booking_add',
          userName,
          operatorName: userName || '用户',
          phone: data.phone || '',
          detail,
          venueId: data.venueId,
          venueName
        })
        await conn.commit()
        return { ok: true, id: String(res.insertId), cardRemaining: remainingAfter, fnVer: FN_VER }
      } catch (e) {
        try {
          await conn.rollback()
        } catch (e2) {}
        throw e
      } finally {
        conn.release()
      }
    }
    if (action === 'getMyBookings') {
      const rawUserId = event.userId || ''
      const page = Math.max(1, Number(event.page) || 1)
      const pageSize = Math.min(20, Number(event.pageSize) || 10)
      const offset = (page - 1) * pageSize
      let where = ''
      const params = []
      const uid =
        rawUserId && /^\d+$/.test(String(rawUserId).trim())
          ? Number(String(rawUserId).trim())
          : null
      if (uid != null && openid) {
        where = '(user_id = ? OR openid = ?)'
        params.push(uid, openid)
      } else if (uid != null) {
        where = 'user_id = ?'
        params.push(uid)
      } else if (openid) {
        where = 'openid = ?'
        params.push(openid)
      } else {
        return { ok: false, msg: '缺少用户标识' }
      }
      const [[{ c }]] = await pool.query(
        `SELECT COUNT(*) AS c FROM bookings WHERE ${where}`,
        params
      )
      const [rows] = await pool.query(
        `SELECT * FROM bookings WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
        [...params, pageSize, offset]
      )
      const list = (rows || []).map((r) => ({
        _id: String(r.id),
        court: r.court,
        date: fmtDate(r.date),
        time: r.time,
        status: r.status,
        venueId: r.venue_id,
        venueName: r.venue_name || '',
        coachName: r.coach_name || ''
      }))
      return { ok: true, list, total: c || 0 }
    }
    if (action === 'cancelBooking') {
      const id = event.id
      if (!id) return { ok: false, msg: '缺少 id' }
      const conn = await pool.getConnection()
      try {
        await conn.beginTransaction()
        const [rows] = await conn.query(
          'SELECT * FROM bookings WHERE id=? FOR UPDATE',
          [id]
        )
        const b = rows[0]
        if (!b) {
          await conn.rollback()
          return { ok: false, msg: '预约不存在' }
        }
        if (b.status === 'cancelled') {
          await conn.rollback()
          return { ok: false, msg: '已取消' }
        }
        if (openid && b.openid && b.openid !== openid) {
          await conn.rollback()
          return { ok: false, msg: '无权取消' }
        }
        await conn.query(
          `UPDATE bookings SET status='cancelled', updated_at=NOW() WHERE id=?`,
          [id]
        )
        if (b.card_id) {
          const [cards] = await conn.query(
            'SELECT * FROM member_cards WHERE id=? FOR UPDATE',
            [b.card_id]
          )
          const card = cards[0]
          if (
            card &&
            (card.type === 'times' || card.type === 'coach' || card.type === 'group')
          ) {
            const left = (card.remaining_times || 0) + 1
            await conn.query(
              `UPDATE member_cards SET remaining_times=?, status='active', updated_at=NOW() WHERE id=?`,
              [left, card.id]
            )
          }
        }
        if (b.group_class_id) {
          await conn.query(
            `UPDATE group_classes SET enrolled = GREATEST(enrolled - 1, 0) WHERE id=?`,
            [b.group_class_id]
          )
        }
        const cancelAmt = money(b.amount)
        if (cancelAmt) {
          await writeLedger(conn, {
            bizDate: fmtDate(b.date) || fmtDate(new Date()),
            type: b.card_id ? 'card_use_cancel' : 'court_cancel',
            amount: -cancelAmt,
            venueId: b.venue_id || '',
            venueName: b.venue_name || '',
            userId: b.user_id || null,
            userName: b.user_name || '',
            operatorName: b.user_name || '用户',
            cardId: b.card_id || null,
            bookingId: b.id,
            remark: '取消 ' + (b.court || '') + ' ' + (b.time || '')
          })
        }
        const detail = `取消预约 ${b.court || ''} ${fmtDateCn(b.date)} ${b.time || ''}`
        await writeLog(conn, {
          type: 'booking_cancel',
          userName: b.user_name || '',
          operatorName: b.user_name || '用户',
          phone: b.phone || '',
          detail,
          venueId: b.venue_id || '',
          venueName: b.venue_name || ''
        })
        await conn.commit()
        return { ok: true, fnVer: FN_VER }
      } catch (e) {
        try {
          await conn.rollback()
        } catch (e2) {}
        throw e
      } finally {
        conn.release()
      }
    }
    if (action === 'getCoaches') {
      const venueId = event.venueId || ''
      if (!venueId) return { ok: false, msg: '缺少场馆' }
      const [rows] = await pool.query(
        `SELECT * FROM coaches WHERE venue_id=? ORDER BY sort ASC, id ASC`,
        [venueId]
      )
      const list = (rows || []).map((r) => ({
        _id: String(r.id),
        venueId: r.venue_id,
        name: r.name,
        title: r.title || '',
        phone: r.phone || '',
        status: r.status || 'active',
        remark: r.remark || '',
        desc: r.remark || '',
        avatar: r.avatar || '',
        tags: []
      }))
      return { ok: true, list }
    }
    if (action === 'getCoachDetail') {
      const id = event.id
      if (!id) return { ok: false, msg: '缺少教练ID' }
      const [rows] = await pool.query('SELECT * FROM coaches WHERE id=? LIMIT 1', [id])
      const r = rows[0]
      if (!r) return { ok: false, msg: '教练不存在' }
      return {
        ok: true,
        coach: {
          _id: String(r.id),
          venueId: r.venue_id,
          name: r.name,
          title: r.title || '',
          phone: r.phone || '',
          status: r.status || 'active',
          remark: r.remark || '',
          desc: r.remark || '',
          avatar: r.avatar || '',
          tags: []
        }
      }
    }
    if (action === 'getWallet' || action === 'getProfile') {
      const phone = String(event.phone || '').replace(/\D/g, '').slice(-11)
      const uid = event.userId && /^\d+$/.test(String(event.userId)) ? Number(event.userId) : null
      let row = null
      if (phone) {
        const [rs] = await pool.query(
          'SELECT id, nick_name, phone, IFNULL(balance,0) AS balance, IFNULL(points,0) AS points FROM users WHERE phone=? LIMIT 1',
          [phone]
        )
        row = rs[0] || null
      }
      if (!row && uid) {
        const [rs] = await pool.query(
          'SELECT id, nick_name, phone, IFNULL(balance,0) AS balance, IFNULL(points,0) AS points FROM users WHERE id=? LIMIT 1',
          [uid]
        )
        row = rs[0] || null
      }
      if (!row && openid) {
        const [rs] = await pool.query(
          'SELECT id, nick_name, phone, IFNULL(balance,0) AS balance, IFNULL(points,0) AS points FROM users WHERE openid=? LIMIT 1',
          [openid]
        )
        row = rs[0] || null
      }
      if (!row) return { ok: false, msg: '未找到用户', balance: 0, points: 0, fnVer: FN_VER }
      return {
        ok: true,
        fnVer: FN_VER,
        userId: String(row.id),
        nickName: row.nick_name || '',
        phone: row.phone || '',
        balance: money(row.balance),
        points: Number(row.points) || 0
      }
    }
    if (action === 'getMyCards') {
      const userId = event.userId || ''
      const phone = String(event.phone || '').replace(/\D/g, '')
      let rows = []
      const uid =
        userId && /^\d+$/.test(String(userId).trim())
          ? Number(String(userId).trim())
          : null
      if (phone) {
        const [users] = await pool.query(
          'SELECT id FROM users WHERE phone=? LIMIT 1',
          [phone.slice(-11)]
        )
        const u = users[0]
        if (u) {
          const [r3] = await pool.query(
            `SELECT * FROM member_cards WHERE user_id=? AND IFNULL(status,'')<>'deleted' ORDER BY id DESC LIMIT 50`,
            [u.id]
          )
          rows = r3 || []
        }
      }
      if (rows.length === 0 && uid != null) {
        const [r] = await pool.query(
          `SELECT * FROM member_cards WHERE user_id=? AND IFNULL(status,'')<>'deleted' ORDER BY id DESC LIMIT 50`,
          [uid]
        )
        rows = r || []
      }
      if (rows.length === 0 && openid) {
        const [r2] = await pool.query(
          `SELECT * FROM member_cards WHERE openid=? AND IFNULL(status,'')<>'deleted' ORDER BY id DESC LIMIT 50`,
          [openid]
        )
        rows = r2 || []
      }
      const list = rows.map((r) => ({
        _id: String(r.id),
        cardName: r.card_name || '',
        type: r.type,
        totalTimes: r.total_times || 0,
        remainingTimes: r.remaining_times || 0,
        validFrom: fmtDate(r.valid_from),
        validTo: fmtDate(r.valid_to),
        timeRule: parseTimeRule(r.time_rule),
        status: r.status || 'active'
      }))
      return { ok: true, list }
    }
    if (action === 'getGroupClasses') {
      const { venueId, date } = event
      if (!venueId) return { ok: false, msg: '缺少场馆' }
      let sql = 'SELECT * FROM group_classes WHERE venue_id=?'
      const params = [venueId]
      if (date) {
        sql += ' AND date=?'
        params.push(date)
      }
      sql += ' ORDER BY date ASC, time ASC, id ASC'
      const [rows] = await pool.query(sql, params)
      const list = (rows || []).map((r) => ({
        _id: String(r.id),
        venueId: r.venue_id,
        name: r.name,
        date: fmtDate(r.date),
        time: r.time,
        court: r.court,
        coachId: r.coach_id ? String(r.coach_id) : '',
        coachName: r.coach_name || '',
        capacity: r.capacity || 6,
        enrolled: r.enrolled || 0,
        status: r.status || 'open',
        remark: r.remark || ''
      }))
      return { ok: true, list }
    }
    if (action === 'updateCoachProfile') {
      const id = event.id
      const name = String(event.name || '').trim()
      const remark = String(event.remark || '').trim()
      const avatar = String(event.avatar || '').trim()
      if (!id) return { ok: false, msg: '缺少教练ID' }
      if (!name) return { ok: false, msg: '请填写姓名' }
      await pool.query(`UPDATE coaches SET name=?, remark=?, avatar=? WHERE id=?`, [
        name,
        remark,
        avatar,
        id
      ])
      return { ok: true }
    }
    if (action === 'getCoachWorkbench') {
      const phone = String(event.phone || '').replace(/\D/g, '')
      let coach = null
      if (phone) {
        const [rows] = await pool.query(
          `SELECT * FROM coaches WHERE phone=? ORDER BY id ASC LIMIT 1`,
          [phone]
        )
        coach = rows[0] || null
      }
      if (!coach && openid) {
        const [users] = await pool.query(`SELECT * FROM users WHERE openid=? LIMIT 1`, [
          openid
        ])
        const u = users[0]
        if (u && u.role === 'coach' && u.nick_name) {
          const [rows2] = await pool.query(
            `SELECT * FROM coaches WHERE name=? ORDER BY id ASC LIMIT 1`,
            [u.nick_name]
          )
          coach = rows2[0] || null
        }
      }
      if (!coach) return { ok: true, coach: null, list: [] }
      const [books] = await pool.query(
        `SELECT * FROM bookings
         WHERE coach_id=? AND status='booked'
         ORDER BY date ASC, time ASC LIMIT 100`,
        [coach.id]
      )
      return {
        ok: true,
        coach: {
          _id: String(coach.id),
          name: coach.name,
          title: '教练',
          phone: coach.phone || '',
          remark: coach.remark || '',
          desc: coach.remark || '',
          avatar: coach.avatar || ''
        },
        list: (books || []).map((r) => ({
          _id: String(r.id),
          date: fmtDate(r.date),
          time: r.time,
          court: r.court,
          userName: r.user_name || '',
          status: r.status
        }))
      }
    }
    if (action === 'getBookingDetail') {
      const id = event.id
      if (!id) return { ok: false, msg: '缺少 id' }
      const [rows] = await pool.query('SELECT * FROM bookings WHERE id=? LIMIT 1', [id])
      const r = rows[0]
      if (!r) return { ok: false, msg: '预约不存在' }
      if (openid && r.openid && r.openid !== openid) {
        return { ok: false, msg: '无权查看' }
      }
      return {
        ok: true,
        booking: {
          _id: String(r.id),
          orderNo: r.remark || String(r.id),
          court: r.court,
          date: fmtDate(r.date),
          time: r.time,
          status: r.status,
          coachName: r.coach_name || '',
          venueName: r.venue_name || '',
          createdAt: r.created_at
        }
      }
    }
    if (action === 'enrollGroupClass') {
      const { groupClassId, userId, userName, phone, cardId } = event
      if (!groupClassId || !cardId) {
        return { ok: false, msg: '参数不完整' }
      }
      const conn = await pool.getConnection()
      try {
        await conn.beginTransaction()
        const [gcRows] = await conn.query(
          'SELECT * FROM group_classes WHERE id=? FOR UPDATE',
          [groupClassId]
        )
        const gc = gcRows[0]
        if (!gc) {
          await conn.rollback()
          return { ok: false, msg: '团课不存在' }
        }
        if (gc.status !== 'open') {
          await conn.rollback()
          return { ok: false, msg: '团课未开放' }
        }
        if (gc.enrolled >= gc.capacity) {
          await conn.rollback()
          return { ok: false, msg: '名额已满' }
        }
        const [dup] = await conn.query(
          `SELECT id FROM bookings
           WHERE group_class_id=? AND status='booked'
             AND (
               (? IS NOT NULL AND ? <> '' AND user_id=?)
               OR (? <> '' AND openid=?)
             )
           LIMIT 1`,
          [
            groupClassId,
            userId || null,
            userId || '',
            userId || null,
            openid || '',
            openid || ''
          ]
        )
        if (dup.length) {
          await conn.rollback()
          return { ok: false, msg: '您已报名该团课，请勿重复报名' }
        }
        const [cRows] = await conn.query(
          `SELECT * FROM member_cards WHERE id=? AND type='group' AND status='active' FOR UPDATE`,
          [cardId]
        )
        const card = cRows[0]
        if (!card || (card.remaining_times || 0) <= 0) {
          await conn.rollback()
          return { ok: false, msg: '团课卡不可用' }
        }
        let enrollUserId = null
        if (userId != null && /^\d+$/.test(String(userId).trim())) enrollUserId = Number(userId)
        enrollUserId = await resolveUserId(conn, enrollUserId, openid)
        const enrollAmt = cardUnit(card)
        const [enrollRes] = await conn.query(
          `INSERT INTO bookings (
            venue_id, court, date, time, user_id, openid, user_name, phone,
            status, card_id, card_name, card_type, coach_id, coach_name,
            group_class_id, source, amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'booked', ?, ?, 'group', ?, ?, ?, 'user', ?)`,
          [
            gc.venue_id,
            gc.court,
            gc.date,
            gc.time,
            enrollUserId,
            openid,
            userName || '',
            phone || '',
            card.id,
            card.card_name,
            gc.coach_id,
            gc.coach_name,
            groupClassId,
            enrollAmt
          ]
        )
        const left = card.remaining_times - 1
        await conn.query(
          `UPDATE member_cards SET remaining_times=?, status=?, updated_at=NOW() WHERE id=?`,
          [left, left <= 0 ? 'used_up' : 'active', card.id]
        )
        await conn.query(`UPDATE group_classes SET enrolled = enrolled + 1 WHERE id=?`, [
          groupClassId
        ])
        await writeLedger(conn, {
          bizDate: fmtDate(gc.date),
          type: 'card_use',
          amount: enrollAmt,
          venueId: gc.venue_id || '',
          venueName: '',
          userId: enrollUserId,
          userName: userName || '',
          operatorName: userName || '用户',
          cardId: card.id,
          bookingId: enrollRes.insertId,
          remark: '团课 ' + (gc.name || '') + ' ' + (gc.time || '')
        })
        const detail = `团课报名 ${gc.name || ''} ${fmtDateCn(gc.date)} ${gc.time || ''} · ${gc.court || ''}`
        await writeLog(conn, {
          type: 'group_enroll',
          userName: userName || '',
          operatorName: userName || '用户',
          phone: phone || '',
          detail,
          venueId: gc.venue_id || '',
          venueName: ''
        })
        await conn.commit()
        return { ok: true, fnVer: FN_VER }
      } catch (e) {
        try {
          await conn.rollback()
        } catch (e2) {}
        throw e
      } finally {
        conn.release()
      }
    }
    if (action === 'getVenueHours') {
      const venueId = event.venueId || ''
      const weekday = Number(event.weekday) || 0
      if (!venueId) return { ok: false, msg: '缺少场馆', slots: HOUR_FALLBACK.slice(), fnVer: FN_VER }
      try {
        let sql = 'SELECT weekday, time_slot AS timeSlot FROM venue_hours WHERE venue_id=?'
        const params = [venueId]
        if (weekday >= 1 && weekday <= 7) {
          sql += ' AND weekday=?'
          params.push(weekday)
        }
        sql += ' ORDER BY weekday, time_slot'
        const [rows] = await pool.query(sql, params)
        const byWeekday = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }
        ;(rows || []).forEach((r) => {
          if (byWeekday[r.weekday]) byWeekday[r.weekday].push(r.timeSlot)
        })
        const slots = weekday >= 1 && weekday <= 7
          ? (byWeekday[weekday].length ? byWeekday[weekday] : HOUR_FALLBACK.slice())
          : Array.from(new Set((rows || []).map((r) => r.timeSlot))).sort()
        return {
          ok: true,
          slots: slots.length ? slots : HOUR_FALLBACK.slice(),
          byWeekday,
          configured: (rows || []).length > 0,
          fnVer: FN_VER
        }
      } catch (e) {
        return { ok: true, slots: HOUR_FALLBACK.slice(), byWeekday: {}, configured: false, msg: e.message, fnVer: FN_VER }
      }
    }
    if (action === 'getCourtPrices') {
      const venueId = event.venueId || ''
      const weekday = Number(event.weekday) || 0
      if (!venueId) return { ok: false, msg: '缺少场馆' }
      let sql = 'SELECT * FROM court_prices WHERE venue_id=?'
      const params = [venueId]
      if (weekday >= 1 && weekday <= 7) {
        sql += ' AND weekday=?'
        params.push(weekday)
      }
      const [rows] = await pool.query(sql, params)
      const list = (rows || []).map((r) => ({
        court: r.court,
        timeSlot: r.time_slot,
        weekday: r.weekday,
        price: Number(r.price) || 0
      }))
      return { ok: true, list }
    }
    return { ok: false, msg: '未知 action' }
  } catch (e) {
    console.error(e)
    return { ok: false, msg: e.message || '服务异常' }
  }
}

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const action = event.action || 'openid'

  try {
    // 仅返回 openid
    if (action === 'openid') {
      return { ok: true, openid, appid: wxContext.APPID }
    }

    // 解析手机号（新版 getPhoneNumber 的 code）
    if (action === 'getPhone') {
      const phoneCode = event.phoneCode
      if (!phoneCode) return { ok: false, msg: '缺少 phoneCode' }
      try {
        const phoneRes = await cloud.openapi.phonenumber.getPhoneNumber({
          code: phoneCode
        })
        const phone =
          (phoneRes && phoneRes.phoneInfo && phoneRes.phoneInfo.phoneNumber) ||
          (phoneRes && phoneRes.phoneNumber) ||
          ''
        if (!phone) return { ok: false, msg: '未解析到手机号' }
        return { ok: true, phone }
      } catch (e) {
        console.error('getPhoneNumber error', e)
        return { ok: false, msg: e.message || '手机号解析失败' }
      }
    }

    // 注册 / 更新用户
    if (action === 'register') {
      const nickName = (event.nickName || '').trim()
      const avatarUrl = event.avatarUrl || ''
      const phone = (event.phone || '').trim()

      if (!nickName) return { ok: false, msg: '昵称不能为空' }
      if (!phone) return { ok: false, msg: '手机号不能为空' }

      const exist = await db.collection('users').where({ _openid: openid }).limit(1).get()
      if (exist.data && exist.data.length) {
        const user = exist.data[0]
        let userId = user.userId
        if (!userId) {
          const countRes = await db.collection('users').count()
          userId = 'Gt_tennis_' + String(countRes.total + 1).padStart(4, '0')
        }
        await db.collection('users').doc(user._id).update({
          data: {
            userId,
            nickName,
            avatarUrl,
            phone,
            updateTime: db.serverDate()
          }
        })
        return {
          ok: true,
          openid,
          userDocId: user._id,
          userId,
          nickName,
          avatarUrl,
          phone,
          role: user.role || 'user'
        }
      }

      // 新用户
      const countRes = await db.collection('users').count()
      const userId = 'Gt_tennis_' + String(countRes.total + 1).padStart(4, '0')
      const addRes = await db.collection('users').add({
        data: {
          userId,
          nickName,
          avatarUrl,
          phone,
          role: 'user',
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
      return {
        ok: true,
        openid,
        userDocId: addRes._id,
        userId,
        nickName,
        avatarUrl,
        phone,
        role: 'user'
      }
    }

    return { ok: true, openid, appid: wxContext.APPID }
  } catch (e) {
    console.error(e)
    return { ok: false, msg: e.message || '登录失败' }
  }
}

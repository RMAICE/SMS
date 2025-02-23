import profile from '#entities/profile/index.js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

/**
 * @param {GetCtx<T.TelegramAuthDTO>} ctx
 */
export async function telegramCallbackHandler(ctx) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.JWT_SECRET) {
    ctx.throw(500)
  }

  const checkString = Object.keys(ctx.query)
    .sort()
    .filter(key => key !== 'hash')
    .map(key => `${key}=${ctx.query[key]}`)
    .join('\n')

  const secret = crypto.hash('sha256', process.env.TELEGRAM_BOT_TOKEN, 'buffer')
  const hash = crypto.createHmac('sha256', secret)
    .update(checkString)
    .digest('hex')
  const now = Math.round(Date.now() / 1000)
  const authDate = Number(ctx.query.auth_date)
  const hour = 3600
  const diff = now - authDate

  if (diff > hour || hash !== ctx.query.hash) {
    ctx.throw(400)
  }

  /** @type {Omit<T.Profile, 'profile_id'>} */
  const userData = {
    telegram_id: ctx.query.id,
  }

  if (ctx.query.first_name) userData.first_name = ctx.query.first_name
  if (ctx.query.last_name) userData.last_name = ctx.query.last_name
  if (ctx.query.username) userData.username = ctx.query.username
  if (ctx.query.photo_url) userData.photo_url = ctx.query.photo_url

  const { rows } = await profile.insertOne(userData)
  const token = jwt.sign({ sub: rows[0].profile_id }, process.env.JWT_SECRET, { expiresIn: '48h' })

  ctx.cookies.set('token', token, { sameSite: 'lax' })

  return ctx.redirect('/')
}

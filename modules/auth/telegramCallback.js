import user from '#entities/user/index.js'
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

  /** @type {Omit<T.User, 'user_id'>} */
  const userData = {
    telegram_id: ctx.query.id,
  }

  if (ctx.query.first_name) userData.first_name = ctx.query.first_name
  if (ctx.query.last_name) userData.last_name = ctx.query.last_name
  if (ctx.query.username) userData.username = ctx.query.username
  if (ctx.query.photo_url) userData.photo_url = ctx.query.photo_url

  const userId = await user.insertOne(userData)
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '48h' })

  ctx.cookies.set('token', token, { sameSite: 'lax' })

  return ctx.redirect('/')
}

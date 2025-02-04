import jwt from 'jsonwebtoken'

/**
 * @param {import('koa').ParameterizedContext} ctx
 * @param {import('koa').Next} next
 */
export async function authenticate(ctx, next) {
  const token = ctx.cookies.get('token')

  if (!token) {
    return ctx.redirect('/auth')
  }

  if (!process.env.JWT_SECRET) {
    ctx.throw(500)
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET)
  }
  catch {
    ctx.cookies.set('token', null, { sameSite: 'lax' })
    ctx.hxRedirect('/auth')
  }

  await next()
}

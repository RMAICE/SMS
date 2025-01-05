import binomAccount from '../../../entities/binom/account/index.js'

/**
 * @param {Ctx<T.BinomAccountAddDto>} ctx
 */
export async function binomAccountAdd(ctx) {
  const body = ctx.request.body

  if (!body.name) return
  if (!body.token) return
  if (!body.url) return

  try {
    if (!URL.canParse(body.url))
      return ctx.render('binom/modals/account/add', { hasError: true })

    const url = new URL(body.url)
    await binomAccount.insertOne({
      name: body.name,
      token: body.token,
      host: url.host,
      protocol: url.protocol,
    })
    await ctx.render('binom/modals/account-add')
  }
  catch (err) {
    console.error(err)
    await ctx.render('binom/modals/account-add', {
      ...body,
      hasError: true,
    })
  }
}

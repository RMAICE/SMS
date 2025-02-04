import binomAccount from '#entities/binom/account/index.js'

/**
 * @param {GetCtx} ctx
 */
export async function binomAccounts(ctx) {
  const binomAccounts = await binomAccount.getAll()
  const data = {
    binomAccounts,
  }

  await ctx.render(ctx.URL.pathname.substring(1), data)
}

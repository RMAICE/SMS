import googleApi from '#libs/google.js'
import googleAccount from '#entities/google/account/index.js'

async function getAccountsPageData() {
  const url = googleApi.getAuthorizeUrl()
  const accounts = await googleAccount.getAll()

  return {
    addAccUrl: url,
    accounts,
  }
}

/**
 * @param {GetCtx} ctx
 */
export async function googleAccounts(ctx) {
  const data = await getAccountsPageData()

  await ctx.render(ctx.path.substring(1), data)
}

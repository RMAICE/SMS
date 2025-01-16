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

  let callbackError
  if (ctx.cookies.get('callbackError')) {
    callbackError = { callbackError: ctx.cookies.get('callbackError'), message: ctx.cookies.get('errorMessage') }
    ctx.cookies.set('callbackError')
  }

  await ctx.render(ctx.path.substring(1), { ...data, ...callbackError })
}

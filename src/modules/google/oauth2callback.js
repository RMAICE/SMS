import outbox from '#entities/outbox/index.js'
import { getOrCreateSiteId } from '#libs/site.js'
import { isObject } from '#libs/util.js'
import googleAccount from '../../entities/google/account/index.js'
import googleSite from '../../entities/google/site/index.js'
import transaction from '../../entities/transaction.js'
import googleApi from '../../libs/google.js'

/**
 * @param {GetCtx} ctx
 */
export async function googlOauth2CallbackHandler(ctx) {
  const oauthCallbackContext = await googleOauthCallback(ctx.url)

  await ctx.render(ctx.path.substring(1), {
    callbackError: oauthCallbackContext?.callbackError,
    message: oauthCallbackContext?.message,
  })
}

/**
 * @param {string} url
 */
export async function googleOauthCallback(url) {
  const trx = transaction()
  const ctx = {}

  try {
    const { tokens, userInfo } = await googleApi.getToken(url)
    if (!isObject(userInfo)
      || !userInfo.sub
      || !userInfo.email
      || !tokens.access_token
      || !tokens.refresh_token
      || !tokens.scope)
      throw new Error('No data from google')

    const accountData = {
      google_account_id: userInfo.sub, email: userInfo.email,
      photo: userInfo.picture, access_token: tokens.access_token,
      scope: tokens.scope, refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date ?? undefined,
    }
    const webMasters = googleApi.getWebmastersByAccount(accountData)

    const { data: { siteEntry = [] } } = await webMasters.sites.list()

    await trx.begin()

    await googleAccount.insertOne(accountData, trx)

    for (const siteItem of siteEntry) {
      if (!siteItem.siteUrl)
        throw new Error('Error, no siteUrl')

      if (!URL.canParse(siteItem.siteUrl))
        throw new Error('Site parsing error')

      const domain = new URL(siteItem.siteUrl).hostname
      const siteId = await getOrCreateSiteId({ domain }, trx)

      await googleSite.insertOne({
        permissions: siteItem.permissionLevel,
        google_account_id: accountData.google_account_id,
        site_id: siteId,
      }, trx)
    }

    await outbox.insertOne(JSON.stringify({ google_account_id: accountData.google_account_id }))

    await trx.commit()
  }
  catch (err) {
    console.error(err)
    await trx.rollback()
    if (!(err instanceof Error)) {
      ctx.callbackError = 'unknown'
      return ctx
    }

    if (err.message.includes('UNIQUE constraint failed')) {
      ctx.callbackError = 'conflict'
      return ctx
    }

    ctx.callbackError = 'unknown'
    ctx.message = err.message
    return ctx
  }
}

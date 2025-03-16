import GoogleSiteReportWorkerQueue from '#entities/google/siteReport/queue.js'
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
        url: siteItem.siteUrl,
        site_id: siteId,
      }, trx)
    }

    if (siteEntry.length) {
      await GoogleSiteReportWorkerQueue.sendSiteReportOutboxMessage({
        google_account_id: accountData.google_account_id,
      }, trx)
    }

    await trx.commit()
  }
  catch (err) {
    console.error(err)
    await trx.rollback()
    if (!(err instanceof Error)) {
      ctx.callbackError = 'unknown'
      return ctx
    }

    if (err.message.includes('violates unique constraint')) {
      ctx.callbackError = 'conflict'
      return ctx
    }

    ctx.callbackError = 'unknown'
    return ctx
  }
}

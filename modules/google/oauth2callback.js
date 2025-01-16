import { getAllMappedSites, getOrCreateSiteId } from '#libs/site.js'
import googleAccount from '../../entities/google/account/index.js'
import site from '../../entities/google/site/index.js'
import transaction from '../../entities/transaction.js'
import googleApi from '../../libs/google.js'

/**
 * @param {GetCtx} ctx
 */
export async function googlOauth2Callback(ctx) {
  const oauthCallbackContext = await googleOauthCallback(ctx.url)

  if (oauthCallbackContext?.callbackError) {
    ctx.cookies.set('callbackError', oauthCallbackContext.callbackError)
    ctx.cookies.set('errorMessage', oauthCallbackContext.message)
  }

  return ctx.redirect('google/accounts')
}

/**
 * @param {string} url
 */
export async function googleOauthCallback(url) {
  const trx = await transaction()
  const ctx = {}

  try {
    const { tokens, userInfo } = await googleApi.getToken(url)
    if (!userInfo.id
      || !userInfo.email
      || !tokens.access_token
      || !tokens.refresh_token
      || !tokens.scope)
      throw new Error('No data from google')

    const accountData = {
      google_account_id: userInfo.id, email: userInfo.email,
      photo: userInfo.picture, access_token: tokens.access_token,
      scope: tokens.scope, refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date ?? undefined,
    }
    const webMasters = googleApi.getWebmastersByAccount(accountData)

    const { data: { siteEntry = [] } } = await webMasters.sites.list()
    const sitesMap = await getAllMappedSites()

    await trx.begin()

    await googleAccount.insertOne(accountData, trx)

    for (const siteItem of siteEntry) {
      if (!siteItem.siteUrl)
        throw new Error('Error, no siteUrl')

      if (!URL.canParse(siteItem.siteUrl))
        throw new Error('Site parsing error')

      const domain = new URL(siteItem.siteUrl).hostname
      const siteId = await getOrCreateSiteId({ sitesMap, domain })

      await site.insertOne({
        permissions: siteItem.permissionLevel,
        url: siteItem.siteUrl,
        google_account_id: accountData.google_account_id,
        site_id: siteId,
      }, trx)
    }

    await trx.commit()
  }
  catch (err) {
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

import googleAccount from '#entities/google/account/index.js'
import * as https from 'https'

/**
 * @param {string} url
 * @returns {Promise<import('node:http').IncomingMessage>}
 */
function get(url) {
  return new Promise((resolve, rej) => {
    https.get(url, function (res) {
      if (res.statusCode !== 200)
        rej()

      resolve(res)
    })
  })
}

/**
 * @param {GetCtx} ctx
 */
export async function profilePicture(ctx) {
  const acc = await googleAccount.getById(ctx.params.google_account_id)

  if (!acc.photo) {
    ctx.body = Buffer.from([])
    return
  }

  ctx.body = await get(acc.photo)
}

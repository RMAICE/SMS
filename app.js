import Koa from 'koa'
import serve from 'koa-static'
import bodyParser from 'koa-bodyparser'
import Router from '@koa/router'
import { dirname } from 'node:path'
import { fileURLToPath } from 'url'
import googleAccount from '#entities/google/account/index.js'
import binomAccount from '#entities/binom/account/index.js'
import { googleOauthCallback } from '#modules/integrations/googleOauthCallback.js'
import site from '#entities/google/site/index.js'
import { binomAccountAdd } from '#modules/accounts/binom/add.js'
import { delay } from '#utils/index.js'
import views from '@ladjs/koa-views'
import * as https from 'https'
import { getAccountsPageData } from '#modules/google/accounts/getAccountsPage.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = new Koa()
const router = new Router()

app.use(bodyParser())

const render = views(__dirname + '/views', {
  extension: 'njk',
  map: {
    njk: 'nunjucks',
  },
  options: {
    nunjucks: {
      configure: {
        noCache: true,
      },
    },
  },
})

app.use(render)

router.get('/', async (ctx) => {
  ctx.redirect('/google/accounts')
})

router.get('/google/accounts', async (ctx) => {
  const data = await getAccountsPageData()

  let callbackError
  if (ctx.cookies.get('callbackError')) {
    callbackError = { callbackError: ctx.cookies.get('callbackError'), message: ctx.cookies.get('errorMessage') }
    ctx.cookies.set('callbackError')
  }

  await ctx.render('google/accounts/index', { ...data, ...callbackError })
})

router.get('/oauth2callback', async (ctx) => {
  const oauthCallbackContext = await googleOauthCallback(ctx.url)

  if (oauthCallbackContext?.callbackError) {
    ctx.cookies.set('callbackError', oauthCallbackContext.callbackError)
    ctx.cookies.set('errorMessage', oauthCallbackContext.message)
  }

  return ctx.redirect('google/accounts')
})

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

router.get('/google/accounts/:google_account_id/pfp', async (ctx) => {
  const acc = await googleAccount.getById(ctx.params.google_account_id)

  if (!acc.photo) {
    ctx.body = Buffer.from([])
    return
  }

  ctx.body = await get(acc.photo)
})

router.get('/binom/accounts', async (ctx) => {
  const binomAccounts = await binomAccount.getAll()
  const data = {
    binomAccounts,
  }

  await ctx.render(ctx.URL.pathname.substring(1), data)
})

router.get('/google/sites', async (ctx) => {
  /** @type {T.GoogleSite[]} */
  const sites = await site.getAll()

  await ctx.render(ctx.URL.pathname.substring(1), { sites })
})

router.get('/binom/modals/account-add', async (ctx) => {
  await delay(1000)
  await ctx.render(ctx.URL.pathname.substring(1))
})

router.post('/binom/accounts', binomAccountAdd)

app.use(serve(__dirname + '/public/', { maxage: 1000 * 60 * 5, gzip: true }))
app.use(router.routes()).use(router.allowedMethods())

app.listen(9000, () => {
  console.log('Server is running on port 9000')
})

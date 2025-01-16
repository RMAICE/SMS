import Koa from 'koa'
import serve from 'koa-static'
import bodyParser from 'koa-bodyparser'
import Router from '@koa/router'
import { dirname } from 'node:path'
import { fileURLToPath } from 'url'
import { binomAccountAdd } from '#modules/binom/modals/account-add.post.js'
import views from '@ladjs/koa-views'
import { binomAccounts } from '#modules/binom/accounts/index.js'
import { googleAccounts } from '#modules/google/accounts/index.js'
import { googlOauth2Callback } from '#modules/google/oauth2callback.js'
import { profilePicture } from '#modules/google/accounts/profilePicture.js'
import { googleSites } from '#modules/google/sites/index.js'
import { accountAddGet } from '#modules/binom/modals/account-add.get.js'
import { telegramCallbackHandler } from '#modules/auth/telegramCallback.js'
import { authenticate } from '#acl/auth.js'
import { getAuth } from '#modules/auth/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = new Koa()
const router = new Router()

/**
 * @this {Koa.Context}
 * @param {string} endpoint
 */
function hxRedirect(endpoint) {
  this.append('HX-Redirect', endpoint)
  this.status = 303
}

app.context.hxRedirect = hxRedirect
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
app.use((ctx, next) => {
  ctx.state.isLoggedIn = Boolean(ctx.cookies.get('token'))
  return next()
})

router.get('/', authenticate, async (ctx) => {
  ctx.redirect('/google/accounts')
})

router.get('/auth', getAuth)
router.get('/auth/telegram-callback', telegramCallbackHandler)

router.get('/google/accounts', authenticate, googleAccounts)
router.get('/google/oauth2callback', authenticate, googlOauth2Callback)
router.get('/google/accounts/:google_account_id/pfp', authenticate, profilePicture)
router.get('/google/sites', authenticate, googleSites)

router.get('/binom/accounts', authenticate, binomAccounts)
router.get('/binom/modals/account-add', authenticate, accountAddGet)
router.post('/binom/modals/account-add', authenticate, binomAccountAdd)

app.use(serve(__dirname + '/public/', { maxage: 1000 * 60 * 5, gzip: true }))
app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(80, () => {
  console.log('Server is running on port 80')
})

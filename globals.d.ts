import * as Htmx from 'htmx.org'
import Koa from 'koa'

declare global {
  interface Window {
    htmx: Htmx
  }

  interface PostCtx<TBody = unknown> extends Koa.Context {
    request: {
      body: TBody
    }
  }

  interface GetCtx<TQuery extends Koa.Context['query'] = Koa.Context['query']> extends Koa.Context {
    query: TQuery & Koa.Context['query']
  }

  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_CLIENT_ID: string | undefined
      GOOGLE_CLIENT_SECRET: string | undefined
      GOOGLE_REDIRECT_URI: string | undefined
      POSTGRES_USER: string | undefined
      POSTGRES_PASSWORD: string | undefined
      TELEGRAM_BOT_NAME: string | undefined
      TELEGRAM_BOT_TOKEN: string | undefined
      JWT_SECRET: string | undefined
      APP_HOSTNAME: string | undefined
      APP_PORT: string | undefined
    }
  }
}

declare module 'koa' {
  interface BaseContext {
    hxRedirect: (endpoint: string) => void
  }
}

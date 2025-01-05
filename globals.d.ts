import * as Htmx from 'htmx.org'
import Koa from 'koa'

declare global {
  interface Window {
    htmx: Htmx
  }

  interface Ctx<TBody = unknown> extends Koa.Context {
    request: {
      body: TBody
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_CLIENT_ID: string | undefined
      GOOGLE_CLIENT_SECRET: string | undefined
      GOOGLE_REDIRECT_URI: string | undefined
      DB_CONNECTION: string | undefined
    }
  }
}

import site from '#entities/google/site/index.js'

/**
 * @param {GetCtx} ctx
 */
export async function googleSites(ctx) {
  /** @type {T.GoogleSite[]} */
  const sites = await site.getAllWithSite()

  await ctx.render(ctx.URL.pathname.substring(1), { sites })
}

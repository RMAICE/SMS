import siteReport from '#entities/google/siteReport/index.js'
import { delay } from '#utils/index.js'

/**
 * @param {GetCtx} ctx
 */
export async function googleSiteAnalytics(ctx) {
  const analytics = await siteReport.getAnalytics()

  console.log(analytics)
  await ctx.render(ctx.URL.pathname.substring(1), { analytics })
}

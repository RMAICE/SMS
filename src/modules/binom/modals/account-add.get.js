/**
 * @param {GetCtx} ctx
 */
export async function accountAddGet(ctx) {
  await ctx.render(ctx.URL.pathname.substring(1))
}

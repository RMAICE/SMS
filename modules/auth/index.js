/**
 * @param {GetCtx} ctx
 */
export async function getAuth(ctx) {
  const token = ctx.cookies.get('token')

  if (token)
    return ctx.redirect('/')

  await ctx.render(ctx.path.substring(1))
}

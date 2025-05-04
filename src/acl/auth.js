import jwt from "jsonwebtoken";

/**
 * @param {import('koa').ParameterizedContext} ctx
 * @param {import('koa').Next} next
 */
export async function authenticate(ctx, next) {
  const token = ctx.cookies.get("token");

  if (!token) {
    return ctx.redirect("/auth");
  }

  if (!process.env.JWT_SECRET) {
    ctx.throw(500);
  }

  try {
    const { payload } = jwt.verify(token, process.env.JWT_SECRET, {
      complete: true,
    });
    ctx.state.photo_url =
      typeof payload === "string"
        ? JSON.parse(payload).photo_url
        : payload.photo_url;
  } catch {
    ctx.cookies.set("token", null, { sameSite: "lax" });
    ctx.redirect("/auth");
  }

  await next();
}

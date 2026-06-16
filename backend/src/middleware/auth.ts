import { createMiddleware } from "hono/factory";
import { verifyToken, type JWTPayload } from "../lib/jwt.js";

declare module "hono" {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const user = await verifyToken(token);

    if (!user?.company_id) {
      return c.json(
        { error: "Invalid token payload: missing company_id" },
        401,
      );
    }

    if (!UUID_REGEX.test(user.company_id)) {
      console.error("Invalid company_id in JWT:", user.company_id);

      return c.json(
        { error: "Invalid token payload: company_id must be UUID" },
        401,
      );
    }

    c.set("user", user);
    await next();
  } catch (err) {
    console.error("JWT ERROR =", err);

    return c.json(
      { error: "Invalid or expired token" },
      401,
    );
  }
});

export const requireRole = (...roles: JWTPayload["role"][]) =>
  createMiddleware(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!roles.includes(user.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await next();
  });
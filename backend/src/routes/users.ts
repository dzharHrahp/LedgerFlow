import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";

const users = new Hono();

// ─── GET /api/users/:id — get user profile ──────────────────────────
users.get("/:id", async (c) => {
  const id = c.req.param("id");

  // 1. Get public users table data
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, company_id, created_at")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[Users] GET error:", error);
    return c.json({ error: error.message }, 404);
  }

  // 2. Get avatar_url from auth.users.user_metadata (recommended Supabase pattern)
  let avatarUrl: string | null = null;
  const { data: authUser } = await supabase.auth.admin.getUserById(id);
  if (authUser?.user?.user_metadata?.avatar_url) {
    avatarUrl = authUser.user.user_metadata.avatar_url;
  }

  // 3. Ambil company name
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", data.company_id)
    .single();

  return c.json({
    ...data,
    avatar_url: avatarUrl,
    company_name: company?.name || "",
  });
});

// ─── PUT /api/users/:id — update user profile ───────────────────────
users.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  // 1. Update public users table (name, etc.)
  const publicUpdates: Record<string, any> = {};
  if (body.name !== undefined) publicUpdates.name = body.name;

  if (Object.keys(publicUpdates).length > 0) {
    const { error: pubErr } = await supabase
      .from("users")
      .update(publicUpdates)
      .eq("id", id);

    if (pubErr) {
      console.error("[Users] PUT public error:", pubErr);
      return c.json({ error: pubErr.message }, 500);
    }
  }

  // 2. Update avatar_url in auth.users.user_metadata
  let avatarUrl: string | null = null;
  if (body.avatar_url !== undefined) {
    avatarUrl = body.avatar_url;

    // Get current user_metadata first to preserve other fields
    const { data: authUser } = await supabase.auth.admin.getUserById(id);
    const currentMetadata = authUser?.user?.user_metadata || {};

    const { error: metaErr } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: {
        ...currentMetadata,
        avatar_url: body.avatar_url,
      },
    });

    if (metaErr) {
      console.error("[Users] PUT metadata error:", metaErr);
      // Don't fail the whole request - avatar is non-critical
    }
  } else {
    // Read existing avatar from metadata if not updating
    const { data: authUser } = await supabase.auth.admin.getUserById(id);
    if (authUser?.user?.user_metadata?.avatar_url) {
      avatarUrl = authUser.user.user_metadata.avatar_url;
    }
  }

  // 3. Get fresh public data
  const { data: freshData, error: freshErr } = await supabase
    .from("users")
    .select("id, name, email, role, company_id")
    .eq("id", id)
    .single();

  if (freshErr) {
    console.error("[Users] PUT fresh fetch error:", freshErr);
    return c.json({ error: freshErr.message }, 500);
  }

  // 4. Ambil company name
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", freshData.company_id)
    .single();

  return c.json({
    ...freshData,
    avatar_url: avatarUrl,
    company_name: company?.name || "",
  });
});

export default users;

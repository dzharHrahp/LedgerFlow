import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";
import { signToken } from "../lib/jwt.js";

const auth = new Hono();

// ─── Helper: ambil company name dari company_id ─────────────────────
async function getCompanyName(companyId: string): Promise<string> {
  const { data } = await supabase
    .from("companies")
    .select("name")
    .eq("id", companyId)
    .single();
  return data?.name || "";
}

// ─── POST /api/auth/register ────────────────────────────────────────
auth.post("/register", async (c) => {
  try {
    const { email, password, name, company_name } = await c.req.json();

    console.log("REGISTER REQUEST:", { email, name, company_name });

    if (!email || !password || !name || !company_name) {
      return c.json({ error: "All fields are required" }, 400);
    }

    // STEP 1 - Create company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({ name: company_name, currency: "IDR" })
      .select()
      .single();

    if (companyError) {
      return c.json({ step: "create_company", error: companyError.message }, 500);
    }

    // STEP 2 - Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return c.json({ step: "create_auth_user", error: authError.message }, 400);
    }

    // STEP 3 - Create user profile
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        company_id: company.id,
        email,
        name,
        role: "owner",
      })
      .select()
      .single();

    if (userError) {
      return c.json({ step: "create_user_profile", error: userError.message }, 500);
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    });

    return c.json(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company_id: user.company_id,
          company_name: company.name,
          avatar_url: null,
        },
      },
      201,
    );
  } catch (err) {
    console.error("REGISTER CRASH:", err);
    return c.json(
      { step: "catch_block", error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────────
auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email and password required" }, 400);
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const { data: user, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError || !user) {
    return c.json({ error: "User profile not found" }, 404);
  }

  // Ambil company name
  const companyName = await getCompanyName(user.company_id);

  // Ambil avatar_url dari auth.users.user_metadata
  const { data: authUserData } = await supabase.auth.admin.getUserById(user.id);
  const avatarUrl = authUserData?.user?.user_metadata?.avatar_url || null;

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    company_id: user.company_id,
  });

  return c.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      company_name: companyName,
      avatar_url: avatarUrl,
    },
  });
});

// ─── POST /api/auth/exchange-token ──────────────────────────────────
auth.post("/exchange-token", async (c) => {
  try {
    const { supabase_token } = await c.req.json();

    if (!supabase_token) {
      return c.json({ error: "supabase_token is required" }, 400);
    }

    const { data: { user: authUser }, error: verifyError } =
      await supabase.auth.getUser(supabase_token);

    if (verifyError || !authUser) {
      console.error("Token verification failed:", verifyError);
      return c.json({ error: "Invalid Supabase token" }, 401);
    }

    const email = authUser.email!;
    const name = authUser.user_metadata?.full_name
      || authUser.user_metadata?.name
      || email.split("@")[0];

    console.log("EXCHANGE TOKEN - OAuth user:", { email, name });

    let { data: user, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    let companyName = "";

    if (profileError?.code === "PGRST116" || !user) {
      console.log("USER NOT FOUND, CREATING NEW USER + COMPANY");

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({ name: `${name}'s Company`, currency: "IDR" })
        .select()
        .single();

      if (companyError) {
        return c.json({ step: "create_company", error: companyError.message }, 500);
      }
      companyName = company.name;

      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          id: authUser.id,
          company_id: company.id,
          email,
          name,
          role: "owner",
        })
        .select()
        .single();

      if (userError) {
        return c.json({ step: "create_user_profile", error: userError.message }, 500);
      }

      user = newUser;
    } else if (profileError) {
      return c.json({ error: profileError.message }, 500);
    }

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Ambil company name kalau belum ada
    if (!companyName) {
      companyName = await getCompanyName(user.company_id);
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    });

    console.log("EXCHANGE TOKEN SUCCESS");

    // Ambil avatar_url dari auth.users.user_metadata
    const { data: authUserData } = await supabase.auth.admin.getUserById(user.id);
    const avatarUrl = authUserData?.user?.user_metadata?.avatar_url || null;

    return c.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        company_name: companyName,
        avatar_url: avatarUrl,
      },
    });
  } catch (err) {
    console.error("EXCHANGE TOKEN ERROR:", err);
    return c.json(
      { error: err instanceof Error ? err.message : "Authentication failed" },
      400,
    );
  }
});

export default auth;

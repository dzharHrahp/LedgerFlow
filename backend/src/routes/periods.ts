// routes/periods.ts
import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

const periods = new Hono();

const getSupabase = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
};

// 1. GET ALL PERIODS — FIX: company_id sekarang optional
periods.get("/", async (c) => {
  const companyId = c.req.query("company_id");
  const supabase = getSupabase();

  let query = supabase.from("periods").select("*");

  // Hanya filter kalau company_id dikirim
  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data ?? []);
});

// 2. OPEN NEW PERIOD (POST)
periods.post("/", async (c) => {
  const { company_id, year, month } = await c.req.json();
  const supabase = getSupabase();

  // Validasi: Cek apakah periode sudah ada
  const { data: existing } = await supabase
    .from("periods")
    .select("id")
    .match({ company_id, year, month })
    .single();

  if (existing) return c.json({ error: "Periode ini sudah ada!" }, 400);

  const { data, error } = await supabase
    .from("periods")
    .insert([{ company_id, year, month, status: "open" }])
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// 3. CLOSE PERIOD (PATCH)
periods.patch("/:id/close", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("periods")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Periode berhasil ditutup", data });
});

export default periods;

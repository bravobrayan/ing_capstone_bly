// API para crear, listar y obtener trabajos desde public.jobs
import { supabase } from "../supabaseClient";

export async function createJob(payload) {
  const {
    title, description, category, city, commune, address,
    is_volunteer, budget_numeric, currency
  } = payload;

  const { data: { session }, error: sErr } = await supabase.auth.getSession();
  if (sErr) throw sErr;
  if (!session?.user) throw new Error("No hay sesión activa.");

  const row = {
    user_id: session.user.id,
    title: title?.trim(),
    description: description?.trim() || null,
    category: category || null,
    city: city?.trim() || null,
    commune: commune?.trim() || null,
    address: address?.trim() || null,
    is_volunteer: !!is_volunteer,
    budget_numeric: budget_numeric === "" || budget_numeric == null ? null : Number(budget_numeric),
    currency: currency || "CLP",
    status: "open",
  };

  const { data, error } = await supabase.from("jobs").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function listOpenJobs({ limit = 12, cursor } = {}) {
  let q = supabase
    .from("jobs")
    .select("id, title, description, city, commune, created_at, budget_numeric, currency, status")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) q = q.lt("created_at", cursor);

  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getJobById(id) {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, description, category, city, commune, address, is_volunteer, budget_numeric, currency, status, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

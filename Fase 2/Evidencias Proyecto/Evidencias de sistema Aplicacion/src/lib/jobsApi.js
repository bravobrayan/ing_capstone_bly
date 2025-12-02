// API para crear, listar, obtener y postular a trabajos
import { supabase } from "../supabaseClient";

/**
 * Crea un nuevo trabajo (owner: usuario autenticado).
 * Requiere RLS insert: auth.uid() = user_id
 */
export async function createJob(payload) {
  const {
    title,
    description,
    category,
    city,
    commune,
    address,
    is_volunteer,
    budget_numeric,
    currency,
    region,
  } = payload;

  const {
    data: { session },
    error: sErr,
  } = await supabase.auth.getSession();
  if (sErr) throw sErr;
  if (!session?.user) throw new Error("No hay sesión activa.");

  const row = {
    user_id: session.user.id,
    title: title?.trim(),
    description: description?.trim(),
    category: category || null,
    region: region || null,
    city: city || null,
    commune: commune || null,
    address: address || null,
    is_volunteer: !!is_volunteer,
    budget_numeric:
      typeof budget_numeric === "number" ? budget_numeric : null,
    currency: currency || "CLP",
    status: "open",
  };

  const { data, error } = await supabase
    .from("jobs")
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Lista trabajos abiertos con paginación simple (cursor por created_at).
 * Ahora incluye user_id para poder bloquear postulaciones propias.
 */
export async function listOpenJobs({ limit = 20, cursor = null } = {}) {
  let q = supabase
    .from("jobs")
    .select(
      "id, user_id, title, description, category, region, city, commune, address, budget_numeric, currency, status, created_at"
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) q = q.lt("created_at", cursor);

  const { data, error } = await q;
  if (error) throw error;
  return data;
}

/**
 * Obtiene un job por id para la vista de detalle y la vista Apply.
 */
export async function getJobById(id) {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, user_id, title, description, category, region, city, commune, address, is_volunteer, budget_numeric, currency, status, created_at, updated_at"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Postular a un trabajo.
 * Tabla recomendada: public.applications
 *  - job_id uuid REFERENCES jobs(id)
 *  - applicant_id uuid
 *  - message text
 *  - status text default 'pending'
 *  - created_at timestamptz default now()
 *
 * RLS sugeridas:
 *  INSERT: auth.uid() = applicant_id
 *  SELECT: applicant OR dueño del job
 *  UPDATE: dueño del job (para cambiar status)
 */
export async function applyToJob(jobId, message = "") {
  const {
    data: { session },
    error: sErr,
  } = await supabase.auth.getSession();
  if (sErr) throw sErr;
  if (!session?.user) throw new Error("No hay sesión activa.");

  const applicantId = session.user.id;

  // Evitar duplicados (un usuario, una postulación por job)
  const { data: already, error: qErr } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("applicant_id", applicantId)
    .maybeSingle();

  if (qErr) throw qErr;
  if (already) {
    return { ok: true, already: true };
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({ job_id: jobId, applicant_id: applicantId, message })
    .select()
    .single();

  if (error) throw error;
  return { ok: true, data };
}

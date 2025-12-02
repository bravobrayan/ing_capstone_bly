import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import BottomNav from "./BottomNav";

export default function MyJobs() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  const fetchJobs = async (uid) => {
    const { data, error } = await supabase
      .from("v_jobs_counts")
      .select(
        "id, title, created_at, region, commune, category, applicants_count, pending_count, accepted_count, user_id"
      )
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (!error) setRows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchJobs(session.user.id);

    const channel = supabase
      .channel("myjobs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        () => fetchJobs(session.user.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  if (!session) {
    return (
      <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-xl">Debes iniciar sesión.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pb-20">
      <div className="bg-white rounded-3xl p-5 shadow-xl">
        <h1 className="text-lg font-bold mb-1">Mis publicaciones</h1>
        <p className="text-sm text-gray-500 mb-4">
          {loading ? "Cargando…" : `${rows.length} trabajos`}
        </p>

        <div className="space-y-3">
          {rows.map((j) => (
            <div key={j.id} className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{j.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {j.commune}
                    {j.region ? `, ${j.region}` : ""}
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-gray-50 text-gray-700 border">
                    Total: {j.applicants_count || 0}
                  </span>
                  <span
                    className={`relative text-[11px] px-2 py-1 rounded-full border ${
                      j.pending_count ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    Pendientes: {j.pending_count || 0}
                    {j.pending_count > 0 && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500"></span>
                    )}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full border ${
                      j.accepted_count
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    Aceptadas: {j.accepted_count || 0}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Link
                  to={`/job/${j.id}`}
                  className="flex-1 text-center py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold"
                >
                  Ver postulantes
                </Link>
                <Link to={`/job/${j.id}`} className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm">
                  Editar
                </Link>
              </div>
            </div>
          ))}

          {!loading && rows.length === 0 && (
            <div className="text-sm text-gray-500 text-center p-6">
              Aún no has publicado trabajos.
              <div className="mt-3">
                <Link to="/publish" className="inline-flex px-3 py-2 rounded-xl bg-purple-600 text-white text-sm">
                  Publicar ahora
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

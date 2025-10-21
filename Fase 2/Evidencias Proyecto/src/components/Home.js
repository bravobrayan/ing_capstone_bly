import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { supabase } from "../supabaseClient";
import BottomNav from "./BottomNav";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const flash = location.state?.flash;

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [feedError, setFeedError] = useState("");

  // Limpia el state del flash para que no se repita al refrescar
  useEffect(() => {
    if (flash) window.history.replaceState({}, document.title);
  }, [flash]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session || null);

      if (session) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name, city, commune")
          .eq("user_id", session.user.id)
          .single();
        setProfile(p || null);
      }

      // Primera carga del feed
      await loadJobs();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadJobs() {
    if (loadingMore) return;
    setFeedError("");
    setLoadingMore(true);
    try {
      let q = supabase
        .from("jobs")
        .select("id, title, description, city, commune, created_at, status")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(12);

      if (cursor) q = q.lt("created_at", cursor);

      const { data, error } = await q;
      if (error) throw error;

      setJobs((prev) => prev.concat(data));
      if (data.length > 0) setCursor(data[data.length - 1].created_at);
      if (data.length < 12) setHasMore(false);
    } catch (err) {
      console.error("Feed error:", err);
      setFeedError(err.message || "No se pudo cargar el feed.");
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const initials = (profile?.full_name || "PI")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-purple-50 pb-24">
      {/* Topbar */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-purple-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/profile")}
            className="h-9 w-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold shadow-sm"
            aria-label="Mi perfil"
          >
            {initials}
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 leading-none">Home</h1>
            <p className="text-sm text-gray-500 leading-none mt-0.5">Inicio</p>
          </div>

          <button
            onClick={() => navigate("/chat")}
            className="p-2 rounded-full hover:bg-purple-100 text-purple-600"
            aria-label="Mensajes"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        {/* Flash de publicación */}
        {flash && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-green-700">
            {flash}
          </div>
        )}

        {feedError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-red-700">
            {feedError}
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Encuentra trabajos en RM Santiago.
          </h2>
          <p className="text-gray-500 mt-1">Publicaciones recientes de la comunidad.</p>
        </div>

        {/* Grid responsive: 1 col (xs), 2 (sm), 3 (lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((j) => (
            <motion.article
              key={j.id}
              whileHover={{ y: -2 }}
              className="rounded-2xl bg-white shadow-sm border border-purple-100 p-4 flex flex-col"
            >
              <h3 className="font-semibold text-gray-900 line-clamp-2">{j.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-3">{j.description || "Sin descripción"}</p>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>
                  {j.city}{j.commune ? `, ${j.commune}` : ""}
                </span>
                <button
                  onClick={() => navigate(`/job/${j.id}`)}
                  className="px-3 py-1 rounded-lg bg-purple-600 text-white text-sm shadow-sm"
                >
                  Ver detalles
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* empty / load more */}
        {!loading && jobs.length === 0 && (
          <div className="text-center text-gray-500 mt-10">No hay trabajos.</div>
        )}

        <div className="mt-6 flex justify-center">
          {hasMore && (
            <button
              onClick={loadJobs}
              disabled={loadingMore}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white shadow-sm disabled:opacity-60"
            >
              {loadingMore ? "Cargando…" : "Cargar más"}
            </button>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

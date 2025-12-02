import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function UserProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login", { replace: true });
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name,bio,city,commune,skills")
          .eq("user_id", session.user.id)
          .single();

        if (error) throw error;
        setProfile(data || null);
      } catch (e) {
        setErrorMsg(e.message || "No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-purple-50 max-w-md mx-auto pb-20">
      {/* Header con flecha para volver al Home */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-purple-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="p-2 rounded-full hover:bg-purple-100 text-purple-600"
            aria-label="Volver"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Mi Perfil</h1>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          {loading && <p className="text-gray-500">Cargando…</p>}
          {errorMsg && <p className="text-red-600">{errorMsg}</p>}

          {!loading && !errorMsg && (
            <>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold">
                  {(profile?.full_name || "A")
                    .split(" ")
                    .map((s) => s[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <User className="w-4 h-4 text-purple-600" />
                    <span>{profile?.full_name || "—"}</span>
                  </div>
                  {profile?.bio && (
                    <p className="text-gray-600 text-sm mt-1">“{profile.bio}”</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>
                  {profile?.city || "—"}
                  {profile?.commune ? `, ${profile.commune}` : ""}
                </span>
              </div>

              {/* Habilidades */}
              {Array.isArray(profile?.skills) && profile.skills.length > 0 && (
                <div className="mt-6">
                  <p className="text-gray-800 font-medium mb-2">Habilidades:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((s, i) => (
                      <span
                        key={`${s}-${i}`}
                        className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm border border-purple-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

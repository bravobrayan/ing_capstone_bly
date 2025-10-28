import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import BottomNav from "./BottomNav";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, bio, city, commune, skills")
        .eq("user_id", session.user.id)
        .single();
      if (!error) setProfile(data);
      setLoading(false);
    })();
  }, []);

  const initials = (profile?.full_name || "PI")
    .split(" ").map(s => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-purple-50 pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-purple-100">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Mi perfil</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 pt-6">
        {loading && <div className="text-gray-500">Cargando…</div>}
        {!loading && (
          <section className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold">
                {initials}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{profile?.full_name || "—"}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {(profile?.city || "Santiago")}{profile?.commune ? `, ${profile.commune}` : ""}
                </p>
              </div>
            </div>
            {profile?.bio && <p className="text-gray-800 mt-4 whitespace-pre-wrap">{profile.bio}</p>}
            {Array.isArray(profile?.skills) && profile.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-200">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

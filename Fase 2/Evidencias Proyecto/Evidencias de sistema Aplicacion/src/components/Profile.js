// components/Profile.js
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";

const CITIES = [
  "Santiago", "Puente Alto", "Maipú", "Ñuñoa", "Providencia", "Las Condes",
  "La Florida", "Macul", "Estación Central", "San Miguel", "Vitacura",
];

const COMMUNES = [
  "Santiago", "Puente Alto Centro", "Maipú", "Ñuñoa", "Providencia",
  "Las Condes", "La Florida", "Macul", "Estación Central", "San Miguel",
  "Vitacura",
];

export default function Profile() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // modo lectura / edición
  const [editMode, setEditMode] = useState(false);

  // Datos cargados desde BD (para vista)
  const [profileRow, setProfileRow] = useState(null);

  // Campos editables
  const [photoUrl, setPhotoUrl] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [commune, setCommune] = useState("");
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }
      setSession(session);

      // Trae el perfil por user_id (canónico)
      const uid = session.user.id;
      const { data: p, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      if (!p) {
        // No tienes perfil -> te llevo a crear
        navigate("/profile/create", { replace: true });
        return;
      }

      setProfileRow(p);
      // precarga campos para edición
      setPhotoUrl(p.photo_url || p.avatar_url || "");
      setName(p.name || "");
      setLastname(p.lastname || "");
      setAge(p.age ? String(p.age) : "");
      setBio(p.bio || "");
      setCity(p.city || "");
      setCommune(p.commune || "");
      setPhone(p.phone || "");
      setAvailability(p.availability || "");

      setLoading(false);
    })();
  }, [navigate]);

  const initials = (() => {
    const base =
      (profileRow?.full_name ||
        `${profileRow?.name || ""} ${profileRow?.lastname || ""}`.trim() ||
        "U"
      ).trim();
    return base
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase();
  })();

  const onPickPhoto = () => fileRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;

    try {
      const path = `avatars/${session.user.id}-${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (!upErr) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        setPhotoUrl(data.publicUrl);
        return;
      }

      // fallback preview local si no hay bucket
      const reader = new FileReader();
      reader.onload = () => setPhotoUrl(String(reader.result));
      reader.readAsDataURL(file);
    } catch {
      const reader = new FileReader();
      reader.onload = () => setPhotoUrl(String(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!session) return;
    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        user_id: session.user.id,
        photo_url: photoUrl || null,
        name: name.trim() || null,
        lastname: lastname.trim() || null,
        full_name: `${(name || "").trim()} ${(lastname || "").trim()}`.trim() || null,
        age: age ? Number(age) : null,
        bio: bio.trim() || null,
        city: city || null,
        commune: commune || null,
        phone: phone.trim() || null,
        availability: availability.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;

      setProfileRow({ ...profileRow, ...payload });
      setEditMode(false);
    } catch (err) {
      setErrorMsg(err.message || "No se pudo guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-6 shadow-xl">Cargando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-4 pb-20">
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h1 className="text-xl font-bold text-center mb-4">Mi Perfil</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl overflow-hidden border">
            {(editMode ? photoUrl : (profileRow?.photo_url || profileRow?.avatar_url)) ? (
              <img
                src={editMode ? photoUrl : (profileRow?.photo_url || profileRow?.avatar_url)}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {editMode && (
            <>
              <button
                type="button"
                className="mt-2 text-sm text-purple-600 hover:underline"
                onClick={onPickPhoto}
              >
                Cambiar foto (opcional)
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </>
          )}
        </div>

        {errorMsg && (
          <div className="mb-3 text-sm p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {errorMsg}
          </div>
        )}

        {!editMode ? (
          // ======== VISTA (solo lectura) ========
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl border bg-gray-50">
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="font-semibold">{profileRow?.name || "-"}</p>
              </div>
              <div className="p-3 rounded-xl border bg-gray-50">
                <p className="text-xs text-gray-500">Apellido</p>
                <p className="font-semibold">{profileRow?.lastname || "-"}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border bg-gray-50">
              <p className="text-xs text-gray-500">Edad</p>
              <p className="font-semibold">{profileRow?.age ?? "-"}</p>
            </div>

            <div className="p-3 rounded-xl border bg-gray-50">
              <p className="text-xs text-gray-500">Biografía</p>
              <p className="font-semibold whitespace-pre-wrap">
                {profileRow?.bio || "-"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl border bg-gray-50">
                <p className="text-xs text-gray-500">Ciudad</p>
                <p className="font-semibold">{profileRow?.city || "-"}</p>
              </div>
              <div className="p-3 rounded-xl border bg-gray-50">
                <p className="text-xs text-gray-500">Comuna</p>
                <p className="font-semibold">{profileRow?.commune || "-"}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border bg-gray-50">
              <p className="text-xs text-gray-500">Teléfono</p>
              <p className="font-semibold">{profileRow?.phone || "-"}</p>
            </div>

            <div className="p-3 rounded-xl border bg-gray-50">
              <p className="text-xs text-gray-500">Disponibilidad</p>
              <p className="font-semibold">{profileRow?.availability || "-"}</p>
            </div>

            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold"
            >
              Editar
            </button>
          </div>
        ) : (
          // ======== EDICIÓN ========
          <form onSubmit={onSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
                className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
              />
              <input
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Apellido"
                className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
              />
            </div>

            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Edad (18+)"
              type="number"
              min="18"
              className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
            />

            <div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 300))}
                rows={4}
                placeholder="Biografía (máx. 300 caracteres)"
                className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
              />
              <div className="text-right text-xs text-gray-500">
                {bio.length}/300
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
              >
                <option value="">Ciudad</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
              >
                <option value="">Comuna</option>
                {COMMUNES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Teléfono (+56 9 12345678)"
              className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
            />

            <input
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="Disponibilidad (opcional)"
              className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  // deshacer cambios
                  setEditMode(false);
                  setPhotoUrl(profileRow?.photo_url || profileRow?.avatar_url || "");
                  setName(profileRow?.name || "");
                  setLastname(profileRow?.lastname || "");
                  setAge(profileRow?.age ? String(profileRow?.age) : "");
                  setBio(profileRow?.bio || "");
                  setCity(profileRow?.city || "");
                  setCommune(profileRow?.commune || "");
                  setPhone(profileRow?.phone || "");
                  setAvailability(profileRow?.availability || "");
                }}
                className="py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="py-3 rounded-xl bg-purple-600 text-white font-semibold disabled:bg-gray-300"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

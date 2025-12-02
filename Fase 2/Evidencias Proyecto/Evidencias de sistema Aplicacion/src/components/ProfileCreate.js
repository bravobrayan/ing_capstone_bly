import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Save, CheckCircle2 } from "lucide-react";
import BottomNav from "./BottomNav";

const ProfileCreate = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [commune, setCommune] = useState("");
  const [phone, setPhone] = useState("");
  const [portfolio, setPortfolio] = useState(["", "", ""]);
  const [availability, setAvailability] = useState("");
  const [bioCount, setBioCount] = useState(0);
  const [isValid, setIsValid] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const cities = ["Santiago","Puente Alto","Maipú","La Florida","San Bernardo","Talagante","Melipilla"];
  const getComunas = (city) => {
    const comunas = {
      Santiago: ["Providencia","Ñuñoa","Las Condes","La Reina","Vitacura","Independencia","Recoleta","Macul","Santiago Centro"],
      "Puente Alto": ["Puente Alto Centro","Las Vizcachas"],
      Maipú: ["Maipú Centro","El Abrazo","Ciudad Satélite"],
      "La Florida": ["Trinidad","Vicuña Mackenna","Los Quillayes"],
      "San Bernardo": ["San Bernardo Centro","Lo Herrera"],
      Talagante: ["Peñaflor","El Monte"],
      Melipilla: ["Melipilla Centro","Pomaire"],
    };
    return comunas[city] || [];
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) return console.error(error.message);
      if (!data.session) {
        navigate("/login");
      } else {
        setSession(data.session);
      }
    };
    fetchSession();
  }, [navigate]);

  useEffect(() => setBioCount(bio.length), [bio]);

  useEffect(() => {
    const valid = name && lastname && age && parseInt(age) >= 18 && bio && city && commune && phone;
    setIsValid(valid);
  }, [name, lastname, age, bio, city, commune, phone]);

  const uploadPhoto = async (file) => {
    if (!file) return null;
    const fileName = `${session.user.id}_${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("avatars").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isValid || !session) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const userId = session.user?.id;
      if (!userId) throw new Error("No se pudo obtener el ID del usuario.");

      let uploadedUrl = photoUrl;
      if (photoFile) uploadedUrl = await uploadPhoto(photoFile);

      const full_name = `${name} ${lastname}`.trim();

      const { error } = await supabase.from("profiles").upsert({
        user_id: userId,
        name,
        lastname,
        full_name,
        age: parseInt(age),
        bio,
        city,
        commune,
        phone,
        portfolio,
        availability,
        photo_url: uploadedUrl || null,
      }, { onConflict: "user_id" });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate("/profile"); // << volver al perfil (no al home)
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <div>Cargando sesión...</div>;

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-4 pb-20 relative">
      <motion.div className="bg-white rounded-3xl p-6 shadow-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-center mb-6">Mi Perfil</h1>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar */}
          <div className="text-center mb-4">
            <label htmlFor="photo-upload" className="cursor-pointer block">
              <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                {photoFile ? (
                  <img src={URL.createObjectURL(photoFile)} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                ) : photoUrl ? (
                  <img src={photoUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <span className="text-purple-600 font-bold text-lg">
                    {(name ? name.charAt(0) : "") + (lastname ? lastname.charAt(0) : "") || "U"}
                  </span>
                )}
              </div>
              <p className="text-sm text-purple-600">Cambiar foto (opcional)</p>
            </label>
            <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} className="hidden" />
          </div>

          {/* Campos */}
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 rounded-xl border" required />
            <input type="text" placeholder="Apellido" value={lastname} onChange={(e) => setLastname(e.target.value)} className="w-full p-3 rounded-xl border" required />
          </div>

          <input type="number" placeholder="Edad (18+)" value={age} onChange={(e) => setAge(e.target.value)} min="18" className="w-full p-3 rounded-xl border" required />

          <textarea placeholder="Biografía (máx. 300 caracteres)" value={bio} onChange={(e) => setBio(e.target.value)} maxLength="300" rows="3" className="w-full p-3 rounded-xl border" required />
          <p className="text-right text-sm text-gray-500">{bioCount}/300</p>

          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-3 rounded-xl border" required>
            <option value="">Ciudad</option>
            {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>

          <select value={commune} onChange={(e) => setCommune(e.target.value)} className="w-full p-3 rounded-xl border" required>
            <option value="">Comuna</option>
            {getComunas(city).map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>

          <input type="text" placeholder="Teléfono (+56 9 12345678)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 rounded-xl border" required />

          <textarea placeholder="Disponibilidad (opcional)" value={availability} onChange={(e) => setAvailability(e.target.value)} rows="2" className="w-full p-3 rounded-xl border" />

          <motion.button type="submit" disabled={!isValid || loading} className="w-full bg-purple-600 text-white p-3 rounded-xl font-semibold disabled:bg-gray-400" whileHover={{ scale: 1.02 }}>
            {loading ? "Guardando..." : (<><Save className="inline w-5 h-5 mr-1" />Guardar Perfil</>)}
          </motion.button>
        </form>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </motion.div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-3xl p-6 shadow-lg text-center w-72">
              <CheckCircle2 className="text-green-500 w-12 h-12 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">¡Perfil guardado!</h2>
              <p className="text-sm text-gray-500">Te redirigiremos al perfil…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default ProfileCreate;

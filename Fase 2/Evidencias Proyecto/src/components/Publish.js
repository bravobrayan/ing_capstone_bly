import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";

const Publish = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("");
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [date, setDate] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (!session) { navigate("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) {
        setErrorMsg("Completa tu perfil para publicar.");
        navigate("/profile-create");
        return;
      }
    };
    getSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title || !description || !category || !city || !commune || !address) {
      setErrorMsg("Completa los campos obligatorios.");
      return;
    }
    if (!isVolunteer && payment && Number.isNaN(Number(payment))) {
      setErrorMsg("El pago debe ser numérico.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("No hay sesión activa.");

      const insertRow = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category: category || null,
        city: city || null,
        commune: commune || null,
        address: address || null,
        is_volunteer: !!isVolunteer,
        budget_numeric: isVolunteer || payment === "" ? null : Number(payment),
        currency: "CLP",
        status: "open",
      };

      const { data, error } = await supabase
        .from("jobs")
        .insert(insertRow)
        .select("*")
        .single();
      if (error) throw error;

      // ✅ Opción A: volver a Home con un flash
      navigate("/home", {
        state: { flash: "¡Trabajo publicado!", newJobId: data.id },
      });
    } catch (err) {
      setErrorMsg(err.message || "Error publicando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-4 pb-20">
      <motion.div className="bg-white rounded-3xl p-6 shadow-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-center mb-6">Publicar Trabajo</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 rounded-xl border" required />
          <textarea placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="w-full p-3 rounded-xl border" required />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 rounded-xl border" required>
            <option value="">Categoría</option>
            <option value="Home">Home</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Academic">Academic</option>
            <option value="Services">Services</option>
            <option value="Otros">Otros</option>
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-3 rounded-xl border" required>
            <option value="">Ciudad</option>
            <option value="Santiago">Santiago</option>
            <option value="Puente Alto">Puente Alto</option>
            <option value="Maipú">Maipú</option>
          </select>
          <select value={commune} onChange={(e) => setCommune(e.target.value)} className="w-full p-3 rounded-xl border" required>
            <option value="">Comuna</option>
            <option value="Providencia">Providencia</option>
            <option value="Ñuñoa">Ñuñoa</option>
            <option value="Las Condes">Las Condes</option>
          </select>
          <input type="text" placeholder="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 rounded-xl border" required />
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={isVolunteer} onChange={(e) => setIsVolunteer(e.target.checked)} id="volunteer" className="h-4 w-4" />
            <label htmlFor="volunteer" className="flex-1 text-sm">Voluntario</label>
          </div>
          {!isVolunteer && (
            <input type="number" placeholder="Pago (CLP)" value={payment} onChange={(e) => setPayment(e.target.value)} className="w-full p-3 rounded-xl border" min="0" />
          )}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 rounded-xl border" />
          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white p-3 rounded-xl disabled:bg-gray-400">
            {loading ? "Publicando…" : "Publicar"}
          </button>
        </form>

        {errorMsg && <p className="text-red-500 text-center mt-4">{errorMsg}</p>}
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default Publish;

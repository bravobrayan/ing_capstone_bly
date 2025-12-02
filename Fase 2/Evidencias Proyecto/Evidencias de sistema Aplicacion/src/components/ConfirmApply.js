import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import BottomNav from "./BottomNav";

const ConfirmApply = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [job, setJob] = useState(null);
  const [creator, setCreator] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // === Cargar sesión y trabajo ===
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      const { data: jobData } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
      setJob(jobData);

      if (jobData?.user_id) {
        const { data: userData } = await supabase
          .from("profiles")
          .select("name, lastname")
          .eq("user_id", jobData.user_id)
          .maybeSingle();
        setCreator(userData);
      }
    })();
  }, [id]);

  const handleApply = async () => {
    if (!session || !job) return;
    setLoading(true);

    const { error } = await supabase.from("applications").insert({
      applicant_id: session.user.id,
      job_id: job.id,
      message,
      status: "Pendiente",
      created_at: new Date(),
    });

    if (error) {
      console.error(error);
      alert("❌ Error al enviar tu postulación.");
    } else {
      alert("✅ Tu postulación ha sido enviada correctamente.");
      navigate("/applications");
    }

    setLoading(false);
  };

  if (!job)
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <p>Cargando trabajo...</p>
      </div>
    );

  const initials = creator
    ? `${creator.name?.charAt(0) || ""}${creator.lastname?.charAt(0) || ""}`.toUpperCase()
    : "UD";

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-4 pb-20">
      <motion.div
        className="bg-white rounded-3xl p-6 shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <button onClick={() => navigate(-1)} className="text-purple-600 text-sm mb-2">
          ← Volver
        </button>
        <h1 className="text-xl font-bold mb-1">Confirmar postulación</h1>
        <p className="text-sm text-gray-600 mb-4">
          Revisa los detalles antes de postular al trabajo.
        </p>

        <div className="bg-purple-50 rounded-2xl p-3 mb-4">
          <h2 className="font-bold text-lg">{job.title}</h2>
          <p className="text-sm text-gray-600">{job.commune}, {job.city}</p>
          <div className="flex items-center mt-2">
            <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-800">
              {initials}
            </div>
            <p className="ml-2 text-sm text-gray-700">
              Publicado por {creator ? creator.name : "Usuario desconocido"}
            </p>
          </div>
        </div>

        <div className="mb-3">
          <label className="text-sm font-semibold text-gray-700 block mb-1">
            Escribe un mensaje para el creador:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Ej: Hola, me interesa tu publicación. Tengo experiencia en este tipo de trabajo..."
            className="w-full p-3 border rounded-xl text-sm"
          />
        </div>

        <motion.button
          onClick={handleApply}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-2xl font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? "Enviando..." : "Confirmar postulación"}
        </motion.button>
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default ConfirmApply;

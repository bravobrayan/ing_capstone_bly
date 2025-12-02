import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ArrowLeft } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function Review() {
  const { id } = useParams(); // id = application_id
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Por favor selecciona una calificación ⭐");
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from("reviews").insert([
      {
        application_id: id,
        reviewer_id: session?.user?.id,
        rating,
        comment,
        created_at: new Date(),
      },
    ]);

    setLoading(false);
    if (error) {
      console.error("❌ Error guardando review:", error);
      alert("Ocurrió un error al guardar tu valoración.");
    } else {
      navigate("/my-applications", {
        state: { flash: "¡Gracias por tu feedback! 🌟" },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white shadow-sm border-b border-purple-100 p-4 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-600 flex items-center gap-1 text-sm"
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 className="text-lg font-semibold text-gray-800 flex-1 text-center -ml-5">
          Valorar trabajo
        </h1>
      </div>

      {/* Contenido */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          ¿Cómo fue tu experiencia?
        </h2>

        {/* Estrellas */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hover || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </motion.button>
          ))}
        </div>

        {/* Comentario */}
        <textarea
          placeholder="Cuéntanos cómo fue trabajar con esta persona..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border border-purple-200 rounded-xl p-3 h-32 text-sm shadow-sm focus:ring-2 focus:ring-purple-300 mb-6"
        />

        {/* Botón enviar */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-purple-600 text-white font-semibold rounded-full shadow hover:bg-purple-700 transition"
        >
          {loading ? "Enviando..." : "Enviar valoración"}
        </motion.button>
      </div>
    </div>
  );
}

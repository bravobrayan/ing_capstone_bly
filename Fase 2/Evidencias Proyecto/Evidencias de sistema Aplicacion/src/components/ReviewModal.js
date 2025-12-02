// src/components/ReviewModal.js
import React from "react";

/**
 * Modal de valoración reutilizable y CONSISTENTE.
 * Props:
 * - open, title, subtitle
 * - rating, setRating
 * - comment, setComment
 * - onCancel, onConfirm
 * - confirmLabel
 * - loading
 */
export default function ReviewModal({
  open,
  title = "Valorar",
  subtitle,
  rating,
  setRating,
  comment,
  setComment,
  onCancel,
  onConfirm,
  confirmLabel = "Enviar valoración",
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-end sm:items-center justify-center px-4 py-6">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl ring-1 ring-black/5">
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 text-center mb-4">
            {subtitle}
          </p>
        )}

        {/* Estrellas — mismas medidas que el modal del ofertante */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              disabled={loading}
              className={`w-10 h-10 rounded-full border grid place-content-center transition-transform active:scale-95 ${
                rating >= s
                  ? "bg-yellow-300 border-yellow-400"
                  : "bg-gray-100 border-gray-300"
              }`}
              aria-label={`${s} estrellas`}
            >
              <span className="text-xl leading-none">★</span>
            </button>
          ))}
        </div>

        <textarea
          rows={4}
          className="w-full rounded-2xl border border-gray-200 p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Comentario (opcional)…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={loading}
        />

        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Guardando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

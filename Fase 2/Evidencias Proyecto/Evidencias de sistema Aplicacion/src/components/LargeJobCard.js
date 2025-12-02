import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Card grande para Home. Muestra:
 * - Título, categoría, comuna/ciudad, presupuesto
 * - Perfil del publicador (avatar + nombre)
 * Props esperadas:
 *  - job: { id, title, category, commune, region, budget, budget_numeric, currency, is_volunteer, user_profile?: { full_name, avatar_url } }
 */
export default function LargeJobCard({ job }) {
  const navigate = useNavigate();

  const price =
    job?.is_volunteer
      ? "Voluntariado"
      : job?.budget_numeric
      ? `${new Intl.NumberFormat("es-CL").format(job.budget_numeric)} ${job.currency || "CLP"}`
      : job?.budget || "Presupuesto a convenir";

  const publisherName = job?.user_profile?.full_name || "Usuario";
  const avatarUrl = job?.user_profile?.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(publisherName);

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-4 mb-3 hover:shadow-md transition cursor-pointer"
      onClick={() => navigate(`/job/${job.id}`)}
    >
      {/* Encabezado: perfil del publicador */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src={avatarUrl}
          alt={publisherName}
          className="w-9 h-9 rounded-full object-cover border"
        />
        <div className="text-sm">
          <p className="font-semibold leading-tight">{publisherName}</p>
          <p className="text-xs text-gray-500">Publicador</p>
        </div>
      </div>

      {/* Título */}
      <h3 className="text-base font-bold mb-1">{job.title}</h3>

      {/* Subtítulo / ubicación */}
      <p className="text-sm text-gray-600">
        {job.commune ? `${job.commune}, ` : ""}
        {job.region || "Región no indicada"}
      </p>

      {/* Chips */}
      <div className="flex flex-wrap gap-2 mt-3">
        {job.category ? (
          <span className="px-3 py-1 rounded-full text-xs bg-purple-50 text-purple-700">
            {job.category}
          </span>
        ) : null}
        {job.is_volunteer ? (
          <span className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700">
            Voluntario
          </span>
        ) : null}
      </div>

      {/* Footer: precio y CTA */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm font-semibold">{price}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/job/${job.id}`);
          }}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold"
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
}

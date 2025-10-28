import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getJobById } from "../lib/jobsApi";

function fmtCLP(n){ if(n==null) return "—"; try {return new Intl.NumberFormat("es-CL",{maximumFractionDigits:0}).format(Number(n))} catch {return String(n)} }

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setErrorMsg("");
      try {
        const data = await getJobById(id);
        setJob(data);
      } catch (e) {
        setErrorMsg(e.message || "No se pudo cargar el trabajo.");
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="p-4 text-gray-500">Cargando…</div>;
  if (errorMsg) return <div className="p-4 text-red-600">{errorMsg}</div>;
  if (!job) return null;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link to="/home" className="text-purple-600 hover:underline">← Volver</Link>
      <h1 className="text-2xl font-bold mt-2">{job.title}</h1>
      <p className="text-gray-600">{job.city}{job.commune ? `, ${job.commune}` : ""}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-500">Presupuesto</div>
          <div className="text-xl font-semibold">
            {job.currency === "UF" ? `UF ${job.budget_numeric ?? "—"}` : `${fmtCLP(job.budget_numeric)} CLP`}
          </div>
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-500">Categoría</div>
          <div className="text-xl font-semibold">{job.category || "—"}</div>
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-500">Tipo</div>
          <div className="text-xl font-semibold">{job.is_volunteer ? "Voluntario" : "Remunerado"}</div>
        </div>
      </div>

      {job.address && (
        <div className="border rounded-xl p-4 mt-4">
          <div className="text-sm text-gray-500">Dirección</div>
          <div className="text-gray-800">{job.address}</div>
        </div>
      )}

      <div className="border rounded-xl p-4 mt-4">
        <div className="text-sm text-gray-500">Descripción</div>
        <div className="whitespace-pre-wrap text-gray-800 mt-1">{job.description || "Sin descripción"}</div>
      </div>
    </div>
  );
}

// src/components/JobDetail.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import BottomNav from "./BottomNav";
import ReviewModal from "./ReviewModal";

const moneyCL = (n, cur = "CLP") =>
  typeof n === "number"
    ? `${new Intl.NumberFormat("es-CL").format(n)} ${cur}`
    : "Presupuesto a convenir";

const statusLabel = (s) =>
  ({ pending: "Pendiente", accepted: "Aceptado", rejected: "Rechazado", finished: "Finalizado" }[s] || s);

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);

  const [job, setJob] = useState(null);
  const [publisher, setPublisher] = useState(null);

  const [applicants, setApplicants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");

  const [toast, setToast] = useState({ open: false, type: "success", text: "" });

  // Postulación propia
  const [hasApplied, setHasApplied] = useState(false);
  const [myAppStatus, setMyAppStatus] = useState(null);

  // Modal valoración (dueño al finalizar)
  const [rateOpen, setRateOpen] = useState(false);
  const [rateForApp, setRateForApp] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  const isOwner = useMemo(
    () => !!(session?.user?.id && job?.user_id && session.user.id === job.user_id),
    [session?.user?.id, job?.user_id]
  );

  // Sesión
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
    })();
  }, []);

  // Job
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: j } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
      setJob(j || null);
      setLoading(false);
    })();
  }, [id]);

  // Publisher
  useEffect(() => {
    (async () => {
      if (!job?.user_id) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("user_id, full_name, name, lastname")
        .eq("user_id", job.user_id)
        .maybeSingle();
      setPublisher(p || null);
    })();
  }, [job?.user_id]);

  // Postulaciones (si soy dueño)
  useEffect(() => {
    (async () => {
      if (!isOwner || !job?.id) return;

      const { data, error } = await supabase
        .from("applications")
        .select("id, applicant_id, message, status, created_at, employer_finished")
        .eq("job_id", job.id)
        .order("created_at", { ascending: false });

      if (error || !data) return;

      const merged = [];
      for (const a of data) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("user_id, full_name, name, lastname")
          .eq("user_id", a.applicant_id)
          .maybeSingle();

        merged.push({
          ...a,
          applicant_profile: prof || { full_name: "Usuario" },
        });
      }
      setApplicants(merged);
    })();
  }, [isOwner, job?.id]);

  // ¿ya postulé a este job?
  useEffect(() => {
    (async () => {
      if (!session?.user?.id || !job?.id) return;
      const { data: app } = await supabase
        .from("applications")
        .select("id,status")
        .eq("job_id", job.id)
        .eq("applicant_id", session.user.id)
        .maybeSingle();

      if (app) {
        setHasApplied(true);
        setMyAppStatus(app.status);
      } else {
        setHasApplied(false);
        setMyAppStatus(null);
      }
    })();
  }, [session?.user?.id, job?.id]);

  // Acciones dueño
  const updateApplication = async (applicationId, newStatus) => {
    if (!isOwner) return;
    const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", applicationId);

    if (error) {
      setToast({ open: true, type: "error", text: "No se pudo actualizar." });
      return;
    }

    // Notifica al postulante
    try {
      const target = applicants.find((a) => a.id === applicationId);
      if (target) {
        await supabase.from("notifications").insert({
          user_id: target.applicant_id,
          title: newStatus === "accepted" ? "¡Fuiste aceptado!" : newStatus === "rejected" ? "Postulación rechazada" : "Estado actualizado",
          body: `${job?.title}`,
          is_read: false,
          metadata: {
            kind: "application_status",
            job_id: job?.id,
            application_id: applicationId,
            status: newStatus,
          },
        });
      }
    } catch {
      /* noop */
    }

    setApplicants((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a)));
  };

  // Abrir modal de valoración y finalizar
  const openFinishWithRate = (applicationObj) => {
    if (!isOwner) return;
    setRateForApp(applicationObj);
    setRating(5);
    setComment("");
    setRateOpen(true);
  };

  // Finalizar + review (dueño → postulante)
  const confirmFinishAndReview = async () => {
    if (!isOwner || !rateForApp) return;
    setSavingReview(true);

    // 1) Finaliza la application
    const { error: upErr } = await supabase
      .from("applications")
      .update({ status: "finished", employer_finished: true })
      .eq("id", rateForApp.id);

    if (upErr) {
      setSavingReview(false);
      setToast({ open: true, type: "error", text: "No se pudo finalizar." });
      return;
    }

    // 2) Insertar review del ofertante hacia el postulante
    try {
      await supabase.from("reviews").insert({
        application_id: rateForApp.id,
        reviewer_id: session.user.id,
        // role y target_user_id pueden ser rellenados por trigger; si no tienes trigger, añade:
        // role: "ofertante",
        // target_user_id: rateForApp.applicant_id,
        rating: Number(rating),
        comment: comment?.trim() || "",
      });

      // Notificación al postulante
      await supabase.from("notifications").insert({
        user_id: rateForApp.applicant_id,
        title: "Trabajo finalizado",
        body: `El trabajo ${job?.title} fue finalizado por el empleador.`,
        is_read: false,
        metadata: {
          kind: "job_finished",
          job_id: job?.id,
          application_id: rateForApp.id,
        },
      });
    } catch {
      /* si falla la review, el finish ya quedó */
    }

    // 3) Refrescar UI
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === rateForApp.id ? { ...a, status: "finished", employer_finished: true } : a
      )
    );

    setSavingReview(false);
    setRateOpen(false);
    setRateForApp(null);
    setToast({ open: true, type: "success", text: "Trabajo finalizado y valoración registrada." });
  };

  // Acciones postulante
  const handleApply = async () => {
    if (!session?.user?.id || !job?.id) return;

    try {
      const payload = {
        job_id: job.id,
        applicant_id: session.user.id,
        message: applyMsg?.trim() || null,
        status: "pending",
      };

      const { data, error } = await supabase.from("applications").insert(payload).select("id").single();
      if (error) throw error;

      // Notificar al dueño con nombre
      try {
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("full_name,name,lastname,email")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const applicantName =
          myProfile?.full_name ||
          `${myProfile?.name || ""} ${myProfile?.lastname || ""}`.trim() ||
          session?.user?.email ||
          "Usuario";

        await supabase.from("notifications").insert({
          user_id: job.user_id,
          title: "Nueva postulación",
          body: `${applicantName} postuló a ${job.title}.`,
          is_read: false,
          metadata: {
            kind: "application_created",
            job_id: job.id,
            application_id: data?.id,
            applicant_id: session.user.id,
            applicant_name: applicantName,
          },
        });
      } catch {}

      setHasApplied(true);
      setMyAppStatus("pending");
      setApplyOpen(false);
      setToast({ open: true, type: "success", text: "Postulación enviada. Queda pendiente de aprobación." });
    } catch {
      setToast({ open: true, type: "error", text: "No se pudo enviar la postulación." });
    }
  };

  if (loading || !job) {
    return (
      <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-xl">Cargando…</div>
        <BottomNav />
      </div>
    );
  }

  const publisherName =
    publisher?.full_name ||
    `${publisher?.name || ""} ${publisher?.lastname || ""}`.trim() ||
    "Usuario";

  const price = job?.is_volunteer
    ? "Voluntariado"
    : job?.budget_numeric
    ? moneyCL(job.budget_numeric, job?.currency || "CLP")
    : "Presupuesto a convenir";

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-4 pb-24">
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <button onClick={() => navigate(-1)} className="text-purple-600 text-sm mb-2">
          ← Volver
        </button>

        <h1 className="text-2xl font-bold text-gray-900">{job?.title}</h1>
        <p className="text-gray-500">{job?.commune}</p>

        {/* Publicador */}
        <div className="mt-4 rounded-2xl bg-purple-50 p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-200 text-purple-700 grid place-content-center font-semibold">
              {publisherName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((s) => s[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-800">
                {publisherName} <span className="text-gray-500">| Empleador</span>
              </div>
              <div className="text-xs text-gray-500">Creador del trabajo</div>
            </div>
          </div>
        </div>

        {/* Aviso si ya postuló */}
        {!isOwner && hasApplied && (
          <div className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            Ya postulaste a este trabajo ({statusLabel(myAppStatus)}).
          </div>
        )}

        <div className="mt-4">
          <p className="text-gray-700">
            <span className="font-semibold">Presupuesto:</span> {price}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Categoría:</span> {job?.category}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Ubicación:</span> {job?.region || "Región Metropolitana de Santiago"}
          </p>
          {job?.address && (
            <p className="text-gray-700">
              <span className="font-semibold">Dirección:</span> {job.address}
            </p>
          )}
        </div>

        {/* Postular (si no soy dueño) */}
        {!isOwner && (
          <button
            onClick={() => setApplyOpen(true)}
            disabled={hasApplied}
            className={`w-full py-3 rounded-xl font-semibold mt-4 ${
              hasApplied ? "bg-gray-300 text-gray-500" : "bg-purple-600 text-white"
            }`}
          >
            {hasApplied ? "Ya postulaste" : "Postular"}
          </button>
        )}

        {/* Panel de postulaciones (dueño) */}
        {isOwner && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-2">Postulaciones</h3>
            {applicants.length === 0 ? (
              <div className="text-sm text-gray-500">Aún no hay postulaciones.</div>
            ) : (
              <div className="space-y-3">
                {applicants.map((a) => {
                  const aname =
                    a?.applicant_profile?.full_name ||
                    `${a?.applicant_profile?.name || ""} ${a?.applicant_profile?.lastname || ""}`.trim() ||
                    "Usuario";

                  const isFinished = a.status === "finished";

                  return (
                    <div key={a.id} className="rounded-2xl border bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{aname}</div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            a.status === "accepted"
                              ? "bg-emerald-100 text-emerald-700"
                              : a.status === "rejected"
                              ? "bg-rose-100 text-rose-700"
                              : a.status === "finished"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {statusLabel(a.status)}
                        </span>
                      </div>

                      {a.message && <div className="text-sm text-gray-700 mt-1">{a.message}</div>}

                      <div className="flex gap-2 mt-3">
                        {!isFinished && (
                          <>
                            <button
                              disabled={a.status === "accepted"}
                              onClick={() => updateApplication(a.id, "accepted")}
                              className={`flex-1 py-2 rounded-xl ${
                                a.status === "accepted"
                                  ? "bg-gray-200 text-gray-500"
                                  : "bg-emerald-600 text-white"
                              }`}
                            >
                              Aceptar
                            </button>
                            <button
                              disabled={a.status === "rejected"}
                              onClick={() => updateApplication(a.id, "rejected")}
                              className={`flex-1 py-2 rounded-xl ${
                                a.status === "rejected"
                                  ? "bg-gray-200 text-gray-500"
                                  : "bg-rose-600 text-white"
                              }`}
                            >
                              Rechazar
                            </button>
                            <button
                              onClick={() => openFinishWithRate(a)}
                              className="flex-1 py-2 rounded-xl bg-indigo-600 text-white"
                            >
                              Finalizar trabajo
                            </button>
                          </>
                        )}
                        {isFinished && (
                          <button className="w-full py-2 rounded-xl bg-gray-200 text-gray-500" disabled>
                            Trabajo finalizado
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />

      {/* Modal de postulación (postulante) */}
      {applyOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-1">Confirmar postulación</h3>
            <p className="text-sm text-gray-600 text-center mb-3">
              ¿Deseas postular a <span className="font-medium">{job?.title}</span> publicado por{" "}
              <span className="font-medium">{publisherName}</span>?
            </p>
            <textarea
              className="w-full rounded-xl border p-3 text-sm"
              placeholder="Escribe un mensaje para el empleador…"
              value={applyMsg}
              onChange={(e) => setApplyMsg(e.target.value)}
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setApplyOpen(false)} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700">
                Cancelar
              </button>
              <button onClick={handleApply} className="flex-1 py-2 rounded-xl bg-purple-600 text-white">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal valoración (dueño al finalizar) */}
      <ReviewModal
        open={rateOpen && !!rateForApp}
        title="Valorar postulante"
        subtitle={`Puntúa el desempeño del postulante en ${job?.title}.`}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        onCancel={() => {
          setRateOpen(false);
          setRateForApp(null);
        }}
        onConfirm={confirmFinishAndReview}
        confirmLabel="Finalizar y valorar"
        loading={savingReview}
      />

      {/* Toast */}
      {toast.open && (
        <div
          className={`fixed bottom-16 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-white shadow ${
            toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}
          onAnimationEnd={() => setToast({ open: false, type: "success", text: "" })}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

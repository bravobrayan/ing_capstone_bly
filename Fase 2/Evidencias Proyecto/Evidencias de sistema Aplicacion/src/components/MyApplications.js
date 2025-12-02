// src/components/MyApplications.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import BottomNav from "./BottomNav";
import ReviewModal from "./ReviewModal";

const moneyCL = (n, cur = "CLP") =>
  typeof n === "number"
    ? `${new Intl.NumberFormat("es-CL").format(n)} ${cur}`
    : "Presupuesto a convenir";

const statusLabel = (s) =>
  ({ pending: "Pendiente", accepted: "Aceptado", rejected: "Rechazado", finished: "Finalizado" }[s] || s);

export default function MyApplications() {
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal (postulante → ofertante)
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null); // fila application enriquecida
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "success", text: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data?.session || null));
  }, []);

  const fetchApps = async (uid) => {
    setLoading(true);
    const { data: apps, error } = await supabase
      .from("applications")
      .select("*")
      .eq("applicant_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      setRows([]);
      setLoading(false);
      return;
    }

    // Enriquecer con job, employer profile y flag si YA valoré
    const enriched = [];
    for (const a of apps) {
      const { data: job } = await supabase.from("jobs").select("*").eq("id", a.job_id).maybeSingle();

      let publisher = null;
      if (job?.user_id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("user_id, full_name, name, lastname")
          .eq("user_id", job.user_id)
          .maybeSingle();
        publisher = p || null;
      }

      // ¿ya hice review sobre esta application?
      let hasMyReview = false;
      if (job?.id) {
        const { data: rcv } = await supabase
          .from("reviews")
          .select("id")
          .eq("application_id", a.id)
          .eq("reviewer_id", uid)
          .limit(1)
          .maybeSingle();
        hasMyReview = !!rcv;
      }

      enriched.push({ ...a, job, publisher, has_my_review: hasMyReview });
    }
    setRows(enriched);
    setLoading(false);
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchApps(session.user.id);

    // Realtime: refrescar cuando cambien mis applications o mis reviews
    const ch1 = supabase
      .channel("my-applications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications", filter: `applicant_id=eq.${session.user.id}` },
        () => fetchApps(session.user.id)
      )
      .subscribe();

    const ch2 = supabase
      .channel("my-reviews")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews", filter: `reviewer_id=eq.${session.user.id}` },
        () => fetchApps(session.user.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
  }, [session?.user?.id]);

  // Puedes finalizar (mostrar botón “Valorar y finalizar”) solo si:
  // 1) la application está en 'finished' (el empleador finalizó),
  // 2) AÚN no has dejado review.
  const canFinish = (a) => a?.status === "finished" && a?.has_my_review !== true;

  const openReview = (appRow) => {
    setReviewTarget(appRow);
    setRating(5);
    setComment("");
    setReviewOpen(true);
  };

  const submitReview = async () => {
    if (!session?.user?.id || !reviewTarget) return;
    setSaving(true);

    try {
      // Crear review hacia el empleador (postulante → ofertante)
      await supabase.from("reviews").insert({
        application_id: reviewTarget.id,
        reviewer_id: session.user.id,
        // role/target_user_id pueden resolverse por trigger; si no, añade:
        // role: "postulante",
        // target_user_id: reviewTarget.job?.user_id || null,
        rating,
        comment: comment?.trim() || null,
      });

      // Notificar al empleador
      try {
        await supabase.from("notifications").insert({
          user_id: reviewTarget.job?.user_id || null,
          title: "Nueva valoración recibida",
          body: `Te calificaron en ${reviewTarget?.job?.title}.`,
          is_read: false,
          metadata: {
            kind: "review_created",
            job_id: reviewTarget?.job?.id,
            application_id: reviewTarget?.id,
            rating,
          },
        });
      } catch {
        /* noop */
      }

      setToast({ open: true, type: "success", text: "¡Gracias! Tu valoración fue registrada." });
      setReviewOpen(false);
      setReviewTarget(null);

      // Refrescar (y marcar has_my_review localmente para impedir nuevo click)
      setRows((prev) =>
        prev.map((x) => (x.id === reviewTarget.id ? { ...x, has_my_review: true } : x))
      );
    } catch (e) {
      setToast({ open: true, type: "error", text: "No se pudo guardar la valoración." });
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-xl">Debes iniciar sesión.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pb-20">
      <div className="bg-white rounded-3xl p-5 shadow-xl">
        <button onClick={() => history.back()} className="text-purple-600 text-sm mb-2">
          ← Volver
        </button>
        <h1 className="text-lg font-bold mb-1">Mis postulaciones</h1>
        <p className="text-sm text-gray-500 mb-4">Trabajos a los que has postulado</p>

        {rows.length === 0 && !loading && (
          <div className="text-sm text-gray-500 text-center p-6">
            Aún no has postulado a trabajos.
            <div className="mt-3">
              <Link to="/home" className="inline-flex px-3 py-2 rounded-xl bg-purple-600 text-white text-sm">
                Explorar trabajos
              </Link>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {rows.map((r) => {
            const publisherName =
              r?.publisher?.full_name ||
              `${r?.publisher?.name || ""} ${r?.publisher?.lastname || ""}`.trim() ||
              "Usuario";

            const price =
              r?.job?.is_volunteer
                ? "Voluntariado"
                : r?.job?.budget_numeric
                ? moneyCL(r.job.budget_numeric, r?.job?.currency || "CLP")
                : "Presupuesto a convenir";

            const finishedReviewed = r.status === "finished" && r.has_my_review === true;

            return (
              <div key={r.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{r?.job?.title || "Trabajo"}</div>
                    <div className="text-xs text-gray-500">{r?.job?.category || "Servicio"}</div>
                    <div className="text-xs text-gray-500">
                      {r?.job?.region || "Región Metropolitana de Santiago"}, {r?.job?.commune || ""}
                    </div>
                    <div className="text-xs text-gray-500">
                      Presupuesto: <span className="font-medium">{price}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Publicado por: <span className="underline">{publisherName}</span>
                    </div>
                    {r?.message && (
                      <div className="text-sm text-gray-700 mt-2">“{r.message}”</div>
                    )}
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ml-2 ${
                      r.status === "accepted"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.status === "rejected"
                        ? "bg-rose-100 text-rose-700"
                        : r.status === "finished"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {statusLabel(r.status)}
                  </span>
                </div>

                {/* Finalizar / Valorar */}
                <div className="mt-3">
                  {canFinish(r) ? (
                    <button
                      onClick={() => openReview(r)}
                      className="w-full py-2 rounded-xl bg-purple-600 text-white font-semibold"
                    >
                      Valorar y finalizar
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 rounded-xl bg-gray-100 text-gray-400"
                      title={
                        finishedReviewed
                          ? "Ya enviaste tu valoración."
                          : "Disponible cuando el empleador finalice el trabajo."
                      }
                    >
                      {finishedReviewed ? "Valoración enviada" : "Finalizar trabajo"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />

      {/* Modal Review (postulante) */}
      <ReviewModal
        open={reviewOpen && !!reviewTarget}
        title="Valora tu experiencia"
        subtitle="Cuéntanos cómo fue trabajar con el empleador."
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        onCancel={() => setReviewOpen(false)}
        onConfirm={submitReview}
        confirmLabel="Enviar valoración"
        loading={saving}
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

import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import BottomNav from "./BottomNav";

export default function Notifications() {
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  const fetchAll = async (uid) => {
    const { data } = await supabase
      .from("notifications")
      .select("id, title, message, is_read, created_at, metadata")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setRows(data || []);
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchAll(session.user.id);

    const ch = supabase
      .channel("notif-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${session.user.id}` }, () => fetchAll(session.user.id))
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [session?.user?.id]);

  const markRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setRows(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pb-20">
      <div className="bg-white rounded-3xl p-5 shadow-xl">
        <h1 className="text-lg font-bold mb-4">Notificaciones</h1>
        <div className="space-y-3">
          {rows.map(n => (
            <div key={n.id} className={`rounded-2xl border p-3 ${n.is_read ? "bg-white border-gray-100" : "bg-purple-50 border-purple-100"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-sm text-gray-700 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} className="text-xs bg-purple-600 text-white px-2 py-1 rounded-lg">
                    Marcar leído
                  </button>
                )}
              </div>
            </div>
          ))}
          {!rows.length && <p className="text-sm text-gray-500">No hay notificaciones aún.</p>}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

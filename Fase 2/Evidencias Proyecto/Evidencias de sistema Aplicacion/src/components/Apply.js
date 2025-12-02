import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import BottomNav from "./BottomNav";

const Apply = () => {
  const [applications, setApplications] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  useEffect(() => {
    if (!session) return;
    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("applicant_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setApplications(data || []);
    };
    fetchApplications();
  }, [session]);

  if (!applications.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 text-gray-600">
        <p>No tienes postulaciones aún.</p>
        <BottomNav />
      </div>
    );

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-4 pb-20">
      <h1 className="text-2xl font-bold text-center mb-4">Mis postulaciones</h1>

      <div className="space-y-3">
        {applications.map((a) => (
          <motion.div
            key={a.id}
            className="bg-white p-4 rounded-2xl shadow-md"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="font-bold text-lg mb-1">Trabajo #{a.job_id}</h2>
            <p className="text-sm text-gray-500 mb-1">
              Estado:{" "}
              <span className="font-semibold text-purple-700">{a.status}</span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              {new Date(a.created_at).toLocaleDateString("es-CL")}
            </p>
            <p className="text-sm text-gray-700">{a.message}</p>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Apply;

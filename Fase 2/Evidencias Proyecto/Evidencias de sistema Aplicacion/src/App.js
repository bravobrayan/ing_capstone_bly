import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// Componentes principales
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Publish from "./components/Publish";
import Settings from "./components/Settings";
import JobDetail from "./components/JobDetail";
import Chat from "./components/Chat";
import Profile from "./components/Profile";
import ProfileCreate from "./components/ProfileCreate";
import MapView from "./components/MapView";
import Apply from "./components/Apply";
import MyJobs from "./components/MyJobs";
import MyApplications from "./components/MyApplications";
import Review from "./components/Review";
import ConfirmApply from "./components/ConfirmApply";
import Notifications from "./components/Notifications"; // ✅ nuevo

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- Manejo de sesión Supabase ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      setSession(initial);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setAuthLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // --- Loader mientras verifica sesión ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <p className="text-gray-600">Verificando sesión…</p>
      </div>
    );
  }

  // --- Rutas protegidas ---
  const requireAuth = (element) =>
    session ? element : <Navigate to="/login" replace />;

  return (
    <Router>
      <Routes>
        {/* --- PÚBLICAS --- */}
        <Route
          path="/login"
          element={session ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={session ? <Navigate to="/home" replace /> : <Signup />}
        />

        {/* --- ROOT --- */}
        <Route
          path="/"
          element={session ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
        />

        {/* --- PROTEGIDAS --- */}
        <Route path="/home" element={requireAuth(<Home />)} />
        <Route path="/publish" element={requireAuth(<Publish />)} />
        <Route path="/settings" element={requireAuth(<Settings />)} />
        <Route path="/job/:id" element={requireAuth(<JobDetail />)} />

        {/* Postular */}
        <Route path="/apply/:id" element={requireAuth(<ConfirmApply />)} />
        <Route path="/apply/review/:id" element={requireAuth(<Apply />)} />

        <Route path="/chat/:jobId" element={requireAuth(<Chat />)} />
        <Route path="/map" element={requireAuth(<MapView />)} />
        <Route path="/my-applications" element={requireAuth(<MyApplications />)} />
        <Route path="/review/:id" element={requireAuth(<Review />)} />
        <Route path="/my-jobs" element={requireAuth(<MyJobs />)} />

        {/* ✅ PERFIL */}
        <Route path="/profile" element={requireAuth(<Profile />)} />
        <Route path="/profile/create" element={requireAuth(<ProfileCreate />)} />
        <Route path="/profile/:action" element={requireAuth(<Profile />)} />
        <Route path="/profile/:action/:userId" element={requireAuth(<Profile />)} />

        {/* ✅ NOTIFICACIONES */}
        <Route path="/notifications" element={requireAuth(<Notifications />)} />

        {/* --- FALLBACK --- */}
        <Route
          path="*"
          element={<Navigate to={session ? "/home" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;

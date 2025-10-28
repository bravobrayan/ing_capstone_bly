import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

import Login from "./components/Login";
import Signup from "./components/Signup";
import CreateProfile from "./components/CreateProfile";
import Home from "./components/Home";
import Publish from "./components/Publish";
import Notifications from "./components/Notifications";
import Settings from "./components/Settings";
import JobDetail from "./components/JobDetail";
import Chat from "./components/Chat";
import UserProfile from "./components/UserProfile";
import MapView from "./components/MapView";

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      setSession(initial);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setAuthLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // wrapper para proteger rutas
  const RequireAuth = ({ children }) => {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-purple-50 flex items-center justify-center">
          <p className="text-gray-600">Verificando sesión…</p>
        </div>
      );
    }
    if (!session) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Público */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Si entra a "/", redirige según sesión */}
        <Route
          path="/"
          element={
            session ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Protegidas */}
        <Route
          path="/create-profile"
          element={
            <RequireAuth>
              <CreateProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/publish"
          element={
            <RequireAuth>
              <Publish />
            </RequireAuth>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <Notifications />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        {/* Detalle de trabajo (dos aliases: /job/:id y /jobs/:id) */}
        <Route
          path="/job/:id"
          element={
            <RequireAuth>
              <JobDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <RequireAuth>
              <JobDetail />
            </RequireAuth>
          }
        />
        {/* Chat por job */}
        <Route
          path="/chat/:jobId"
          element={
            <RequireAuth>
              <Chat />
            </RequireAuth>
          }
        />
        {/* Perfil (alias /my-profile) */}
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <UserProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <RequireAuth>
              <UserProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/my-profile"
          element={
            <RequireAuth>
              <UserProfile />
            </RequireAuth>
          }
        />

        {/* Mapa */}
        <Route
          path="/map"
          element={
            <RequireAuth>
              <MapView />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={session ? "/home" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;

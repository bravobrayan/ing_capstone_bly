import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home";
import Publish from "./components/Publish";
import MapView from "./components/MapView";
import MyProfile from "./components/MyProfile";
import ProfileCreate from "./components/ProfileCreate";
import Chat from "./components/Chat";

// ⬇️ importa estos:
import JobDetail from "./components/JobDetail";
import JobsFeed from "./components/JobsFeed"; // si no lo tienes, puedes comentar esta línea

import { Auth } from "./components/Auth";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/profile-create" element={<ProfileCreate />} />
        <Route path="/chat" element={<Chat />} />

        {/* ⬇️ rutas de Jobs */}
        <Route path="/jobs" element={<JobsFeed />} />        {/* opcional si usas feed */}
        <Route path="/jobs/:id" element={<JobDetail />} />   {/* necesaria para el detalle */}

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

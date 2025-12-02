import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, ClipboardList, Settings } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname;

  const items = [
    { name: "Inicio", icon: Home, path: "/home" },
    { name: "Mis publicaciones", icon: ClipboardList, path: "/my-jobs" },
    { name: "Postulaciones", icon: Briefcase, path: "/my-applications" },
    { name: "Configuración", icon: Settings, path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-sm z-50 h-[70px] flex justify-evenly items-center">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.path;
        return (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center gap-0.5 transition ${
              isActive ? "text-purple-600" : "text-gray-500"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.name}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-0.5"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

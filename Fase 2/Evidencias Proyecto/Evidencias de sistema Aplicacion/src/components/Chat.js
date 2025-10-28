import React from "react";
import BottomNav from "./BottomNav";

export default function Chat() {
  return (
    <div className="min-h-screen bg-purple-50 pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-purple-100">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Chat</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 text-gray-600">
          Próximamente: mensajes en tiempo real.
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

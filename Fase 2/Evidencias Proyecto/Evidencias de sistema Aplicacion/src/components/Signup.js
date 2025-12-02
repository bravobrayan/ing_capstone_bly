import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// 🔹 Popup Modal simple (integrado visualmente)
const Popup = ({ show, title, message, onClose }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white p-6 rounded-3xl shadow-xl max-w-sm text-center mx-3"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <h2 className="text-lg font-semibold mb-2 text-purple-700">{title}</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <button
            onClick={onClose}
            className="bg-purple-600 text-white rounded-xl px-4 py-2 w-full"
          >
            Aceptar
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, title: '', message: '' });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPopup({
        show: true,
        title: 'Error',
        message: 'Las contraseñas no coinciden.'
      });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setPopup({
        show: true,
        title: 'Error en registro',
        message: error.message
      });
    } else {
      setPopup({
        show: true,
        title: '✅ Registro exitoso',
        message: 'Completa tu perfil para continuar.'
      });
      setTimeout(() => navigate('/profile/create'), 1500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4 max-w-md mx-auto relative">
      <motion.div
        className="bg-white rounded-3xl p-8 w-full shadow-xl border border-purple-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Crear Cuenta
        </h1>
        <form onSubmit={handleSignup} className="space-y-6">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
            required
          />

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-2xl font-semibold flex justify-center items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            {loading ? 'Creando...' : <>Crear Cuenta <ArrowRight className="w-5 h-5" /></>}
          </motion.button>
        </form>
      </motion.div>

      {/* Popup integrado */}
      <Popup
        show={popup.show}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup({ ...popup, show: false })}
      />
    </div>
  );
};

export default Signup;

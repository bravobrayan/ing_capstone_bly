import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      alert(error.message);
    } else {
      // Verificar si el usuario tiene perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', data.user.id)
        .single();

      if (profile) navigate('/home');
      else navigate('/create-profile');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4 max-w-md mx-auto">
      <motion.div
        className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 w-full shadow-xl border border-purple-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-center mb-2 text-purple-700">SWAPPING</h1>
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">TALENTOS</h2>

        <form onSubmit={handleLogin} className="space-y-6">
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
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            {loading ? 'Entrando...' : <>Entrar <ArrowRight className="w-5 h-5" /></>}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          ¿No tienes cuenta?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-purple-600 hover:underline font-semibold"
          >
            Regístrate
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

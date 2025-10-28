import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { User, MapPin } from 'lucide-react';

const CreateProfile = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [commune, setCommune] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Verifica sesión actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Debes iniciar sesión primero.');
      setLoading(false);
      return;
    }

    // Convierte habilidades separadas por coma en arreglo
    const skillsArray = skills.split(',').map(i => i.trim()).filter(Boolean);

    // Inserta el perfil
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        full_name: name,
        bio,
        city,
        commune,
        skills: skillsArray
      });

    if (error) {
      console.error(error);
      alert(`❌ Error al guardar perfil: ${error.message}`);
    } else {
      alert('✅ Perfil creado correctamente');
      navigate('/home');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-20">
      <motion.div
        className="bg-white rounded-3xl p-6 shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Crea tu Perfil</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-purple-600" />
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <textarea
            placeholder="Biografía (quién eres y qué haces)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
            rows="3"
          />

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-purple-600 mt-2" />
            <div className="flex-1 space-y-2">
              <input
                type="text"
                placeholder="Ciudad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
              />

              <input
                type="text"
                placeholder="Comuna"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="Habilidades (separadas por comas: plomería, jardinería, etc.)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
          />

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-2xl font-semibold"
            whileHover={{ scale: 1.02 }}
          >
            {loading ? 'Guardando...' : 'Guardar y Continuar'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateProfile;

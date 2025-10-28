import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import BottomNav from './BottomNav';

const ProfileCreate = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [age, setAge] = useState('');
  const [skills, setSkills] = useState([]);
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [commune, setCommune] = useState('');
  const [phone, setPhone] = useState('');
  const [portfolio, setPortfolio] = useState(['', '', '']);
  const [availability, setAvailability] = useState('');
  const [bioCount, setBioCount] = useState(0);
  const [isValid, setIsValid] = useState(false);

  const skillsOptions = [
    'Plomería', 'Jardinería', 'Limpieza', 'Soporte TI', 'Electricidad',
    'Carpintería', 'Pintura', 'Cocina', 'Cuidado Niños', 'Tutorías',
    'Mecánica', 'Mantenimiento'
  ];

  const cities = ['Santiago', 'Puente Alto', 'Maipú', 'La Florida', 'San Bernardo', 'Talagante', 'Melipilla'];

  const getComunas = (city) => {
    const comunas = {
      Santiago: ['Providencia', 'Ñuñoa', 'Las Condes', 'La Reina', 'Vitacura', 'Independencia', 'Recoleta', 'Macul', 'Santiago Centro'],
      'Puente Alto': ['Puente Alto Centro', 'Las Vizcachas'],
      Maipú: ['Maipú Centro', 'El Abrazo', 'Ciudad Satélite'],
      'La Florida': ['Trinidad', 'Vicuña Mackenna', 'Los Quillayes'],
      'San Bernardo': ['San Bernardo Centro', 'Lo Herrera'],
      Talagante: ['Peñaflor', 'El Monte'],
      Melipilla: ['Melipilla Centro', 'Pomaire']
    };
    return comunas[city] || [];
  };

  // 🔹 Obtener sesión activa apenas entra al componente
  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error.message);
        return;
      }
      if (!data.session) {
        navigate('/login');
      } else {
        setSession(data.session);
      }
    };
    fetchSession();
  }, [navigate]);

  // 🔹 Contador bio
  useEffect(() => {
    setBioCount(bio.length);
  }, [bio]);

  // 🔹 Validar formulario
  useEffect(() => {
    const valid =
      name &&
      lastname &&
      age &&
      parseInt(age) >= 18 &&
      skills.length > 0 &&
      bio &&
      city &&
      commune &&
      phone;
    setIsValid(valid);
  }, [name, lastname, age, skills.length, bio, city, commune, phone]);

  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  // 🔹 Guardar perfil
  const handleSave = async (e) => {
    e.preventDefault();
    if (!isValid || !session) return;

    setLoading(true);
    setError('');

    try {
      const userId = session.user?.id;
      if (!userId) {
        setError('No se pudo obtener el ID del usuario.');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: `${name} ${lastname}`,
          age: parseInt(age),
          specialties: skills,
          bio,
          city,
          comuna: commune,
          phone,
          portfolio,
          availability,
        });

      if (error) throw error;

      alert('✅ Perfil creado correctamente');
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <div>Cargando sesión...</div>;

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-4 pb-20">
      <motion.div
        className="bg-white rounded-3xl p-6 shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-2xl font-bold text-center mb-6">Crear Perfil</h1>

        <form onSubmit={handleSave} className="space-y-4">
          <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 rounded-xl border" required />
          <input type="text" placeholder="Apellido" value={lastname} onChange={(e) => setLastname(e.target.value)} className="w-full p-3 rounded-xl border" required />
          <input type="number" placeholder="Edad" value={age} onChange={(e) => setAge(e.target.value)} min="18" className="w-full p-3 rounded-xl border" required />

          <div>
            <p>Oficios (elige al menos 1)</p>
            <div className="flex flex-wrap gap-2">
              {skillsOptions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-2 py-1 rounded border ${skills.includes(skill) ? 'bg-purple-100 border-purple-500' : ''}`}
                >
                  {skills.includes(skill) ? '✓' : ''} {skill}
                </button>
              ))}
            </div>
          </div>

          <textarea placeholder="Bio (máx. 300 caracteres)" value={bio} onChange={(e) => setBio(e.target.value)} maxLength="300" rows="3" className="w-full p-3 rounded-xl border" required />
          <p className="text-right text-sm text-gray-500">{bioCount}/300</p>

          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-3 rounded-xl border" required>
            <option value="">Ciudad</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select value={commune} onChange={(e) => setCommune(e.target.value)} className="w-full p-3 rounded-xl border" required>
            <option value="">Comuna</option>
            {getComunas(city).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input type="text" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 rounded-xl border" required />

          <textarea placeholder="Disponibilidad (opcional)" value={availability} onChange={(e) => setAvailability(e.target.value)} rows="2" className="w-full p-3 rounded-xl border" />

          <motion.button type="submit" disabled={!isValid || loading} className="w-full bg-purple-600 text-white p-3 rounded-xl font-semibold disabled:bg-gray-400" whileHover={{ scale: 1.02 }}>
            {loading ? 'Guardando...' : <><Save className="inline w-5 h-5 mr-1" /> Guardar Perfil</>}
          </motion.button>
        </form>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default ProfileCreate;

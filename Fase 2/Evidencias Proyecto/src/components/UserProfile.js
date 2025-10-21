import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, LogOut } from 'lucide-react';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error(userError);
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error cargando perfil:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Cargando perfil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p>No se encontró el perfil.</p>
        <button
          onClick={() => navigate('/create-profile')}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          Crear Perfil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-auto mt-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
          <button onClick={handleLogout} title="Cerrar sesión">
            <LogOut className="w-6 h-6 text-gray-600 hover:text-purple-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-purple-600" />
            <p className="text-lg font-semibold">{profile.full_name || 'Sin nombre'}</p>
          </div>

          {profile.bio && (
            <p className="text-gray-700 italic">“{profile.bio}”</p>
          )}

          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-5 h-5 text-purple-600" />
            <p>
              {profile.city ? `${profile.city}` : 'Ciudad no especificada'}
              {profile.commune ? `, ${profile.commune}` : ''}
            </p>
          </div>

          {profile.skills?.length > 0 && (
            <div>
              <p className="font-semibold text-gray-800 mb-2">Habilidades:</p>
              <ul className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <li
                    key={idx}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

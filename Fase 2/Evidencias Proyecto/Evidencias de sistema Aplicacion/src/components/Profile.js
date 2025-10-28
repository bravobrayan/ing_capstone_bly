import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { supabase } from '../supabaseClient';  
import { useNavigate, useParams } from 'react-router-dom';  
import { Edit, Star, Clock, Building, Phone, Mail } from 'lucide-react';  
import BottomNav from './BottomNav';  

const Profile = () => {  
  const navigate = useNavigate();  
  const { action, userId } = useParams(); // action: 'create', 'edit', 'view'; userId for other users  
  const isCreate = action === 'create';  
  const isEdit = action === 'edit';  
  const isView = action === 'view';  
  const [session, setSession] = useState(null);  
  const [profile, setProfile] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [errorMsg, setErrorMsg] = useState('');  
  const [name, setName] = useState('');  
  const [lastname, setLastname] = useState('');  
  const [age, setAge] = useState('');  
  const [skills, setSkills] = useState([]);  
  const [bio, setBio] = useState('');  
  const [city, setCity] = useState('');  
  const [commune, setCommune] = useState('');  
  const [phone, setPhone] = useState('');  
  const [photoFile, setPhotoFile] = useState(null);  
  const [portfolio, setPortfolio] = useState(['', '', '']);  
  const [availability, setAvailability] = useState('');  
  const [bioCount, setBioCount] = useState(0);  
  const [ciudades, setCiudades] = useState([]);  
  const [comunas, setComunas] = useState([]);  
  const [oficios, setOficios] = useState(['Plomería', 'Jardinería', 'Limpieza', 'Soporte TI', 'Construcción', 'Cocina', 'Cuidado Niños', 'Educación', 'Tutorías', 'Mantenimiento']);  
  const [selectedOficios, setSelectedOficios] = useState([]);  
  const [jobs, setJobs] = useState([]);  

  const currentUserId = session?.user?.id;  
  const isOwnProfile = !userId || userId === currentUserId;  

  // Get session
  useEffect(() => {  
    const getSession = async () => {  
      const { data: { session } } = await supabase.auth.getSession();  
      setSession(session);  
      if (!session && !isView) navigate('/login');  
    };  
    getSession();  
  }, [navigate]);  

  // Load profile data
  useEffect(() => {  
    if (!session) return;  
    const loadProfile = async () => {  
      const id = userId || currentUserId;  
      if (!id) return;  
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', id).single();  
      if (error && error.code !== 'PGRST116') {  
        setErrorMsg('Error cargando perfil.');  
        return;  
      }  
      if (data) {  
        setProfile(data);  
        setName(data.name || '');  
        setLastname(data.lastname || '');  
        setAge(data.age || '');  
        setSelectedOficios(data.skills || []);  
        setBio(data.bio || '');  
        setBioCount(data.bio ? data.bio.length : 0);  
        setCity(data.city || '');  
        setCommune(data.commune || '');  
        setPhone(data.phone || '');  
        setPortfolio(data.portfolio || ['', '', '']);  
        setAvailability(data.availability || '');  
        setLoading(false);  
      } else {  
        setLoading(false);  
        if (isOwnProfile) setProfile({}); // Empty for create/edit  
      }  
    };  
    loadProfile();  
  }, [session, userId, currentUserId, isOwnProfile]);  

  // Load jobs for profile (published/realized)
  useEffect(() => {  
    if (!profile?.user_id) return;  
    const loadJobs = async () => {  
      const { data, error } = await supabase.from('jobs').select('*').eq('user_id', profile.user_id).eq('status', 'active').limit(3);  
      if (error) console.error('Jobs error:', error);  
      setJobs(data || []);  
    };  
    loadJobs();  
  }, [profile?.user_id]);  

  // Bio count
  useEffect(() => {  
    setBioCount(bio.length);  
  }, [bio]);  

  // Comunas dependent
  useEffect(() => {  
    if (city) {  
      const comunasData = {  
        Santiago: ['Providencia', 'Ñuñoa', 'Las Condes', 'La Reina', 'Vitacura', 'Independencia', 'Recoleta', 'Macul', 'Santiago Centro'],  
        'Puente Alto': ['Puente Alto Centro', 'Las Vizcachas'],  
        Maipú: ['Maipú Centro', 'El Abrazo', 'Ciudad Satélite'],  
        'La Florida': ['Trinidad', 'Vicuña Mackenna', 'Los Quillayes'],  
        'San Bernardo': ['San Bernardo Centro', 'Lo Herrera'],  
        Talagante: ['Peñaflor', 'El Monte'],  
        Melipilla: ['Melipilla Centro', 'Pomaire']  
      };  
      setComunas(comunasData[city] || []);  
      if (!comunas.includes(commune)) setCommune('');  
    } else {  
      setComunas([]);  
    }  
  }, [city, commune]);  

  // Photo upload
  const uploadPhoto = async (file) => {  
    if (!file) return;  
    const fileName = `${userId}_${Date.now()}.jpg`;  
    const { data, error } = await supabase.storage.from('avatars').upload(fileName, file);  
    if (error) {  
      setErrorMsg('Error subiendo foto.');  
      return null;  
    }  
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);  
    return publicUrl;  
  };  

  // Save profile  
  const handleSave = async () => {  
    setErrorMsg('');  

    if (!name || !lastname || !age || selectedOficios.length === 0 || !bio || !city || !commune || !phone) {  
      setErrorMsg('Completa todos los campos obligatorios. Edad mínima 18.');  
      return;  
    }  

    if (parseInt(age) < 18) {  
      setErrorMsg('Edad mínima 18 años.');  
      return;  
    }  

    if (bio.length > 300) {  
      setErrorMsg('Biografía máxima 300 caracteres.');  
      return;  
    }  

    if (!phone.match(/^\+56\s?9\s?\d{8}$/)) {  
      setErrorMsg('Teléfono formato inválido (ej. +56 9 12345678).');  
      return;  
    }  

    const portfolioFiltered = portfolio.filter(link => link.trim() !== '');  
    if (portfolioFiltered.length > 3) {  
      setErrorMsg('Máximo 3 enlaces en portafolio.');  
      return;  
    }  

    setLoading(true);  

    try {  
      const photoUrl = photoFile ? await uploadPhoto(photoFile) : profile?.photo_url;  

      const { data, error } = await supabase  
        .from('profiles')  
        .upsert({  
          user_id: currentUserId,  
          name,  
          lastname,  
          age: parseInt(age),  
          skills: selectedOficios,  
          bio,  
          city,  
          commune,  
          phone,  
          photo_url: photoUrl,  
          portfolio: portfolioFiltered,  
          availability  
        }, { count: 'exact' });  

      if (error) throw error;  

      setProfile(data[0]);  
      alert('Perfil guardado!');  
      if (isCreate) navigate('/home');  
      else navigate('/profile/view');  
    } catch (error) {  
      setErrorMsg(error.message);  
    } finally {  
      setLoading(false);  
    }  
  };  

  // Skip (block publish)
  const handleSkip = () => {  
    setErrorMsg('Completa tu perfil para publicar trabajos.');  
    navigate('/home');  
  };  

  // Toggle oficio
  const toggleOficio = (oficio) => {  
    setSelectedOficios(prev => prev.includes(oficio) ? prev.filter(s => s !== oficio) : [...prev, oficio]);  
  };  

  // Portfolio handlers
  const updatePortfolio = (index, value) => {  
    const newPortfolio = [...portfolio];  
    newPortfolio[index] = value;  
    setPortfolio(newPortfolio);  
  };  

  const removePortfolio = (index) => {  
    const newPortfolio = portfolio.filter((_, i) => i !== index);  
    while (newPortfolio.length < 3) newPortfolio.push('');  
    setPortfolio(newPortfolio);  
  };  

  const addPortfolio = () => {  
    if (portfolio.filter(link => link.trim()).length < 3) setPortfolio([...portfolio, '']);  
  };  

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Cargando...</p></div>;  

  if (isView && !profile) return <div className="min-h-screen flex items-center justify-center"><p>Perfil no encontrado.</p></div>;  

  if (!session && !isView) return <div className="min-h-screen flex items-center justify-center"><p>Inicia sesión.</p></div>;  

  return (  
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-4 pb-20">  
      <motion.div className="bg-white rounded-3xl p-6 shadow-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>  
        <h1 className="text-2xl font-bold text-center mb-6">{isCreate ? 'Crea tu Perfil' : isEdit ? 'Editar Perfil' : 'Mi Perfil'}</h1>  

        {isView ? (  
          <div className="space-y-4">  
            <div className="text-center">  
              <img src={profile.photo_url || '/default-avatar.png'} alt="Avatar" className="w-20 h-20 rounded-full mx-auto border-2 border-purple-200" />  
              <h2 className="text-xl font-bold mt-2">{profile.name} {profile.lastname}</h2>  
              <p className="text-sm text-gray-600">Edad: {profile.age} | {profile.city}, {profile.commune}</p>  
              <p className="text-sm text-gray-600">Tel: {profile.phone}</p>  
            </div>  

            <div className="flex space-x-1 border-b mb-4">  
              <button className="flex-1 pb-2 border-b-2 border-purple-600 font-semibold">Sobre mí</button>  
              <button className="flex-1 pb-2">Reseñas</button>  
              <button className="flex-1 pb-2">Trabajos publicados</button>  
              <button className="flex-1 pb-2">Trabajos realizados</button>  
            </div>  

            <div className="space-y-3">  
              <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>  
              <div className="flex flex-wrap gap-2">  
                {profile.skills.map(skill => <span key={skill} className="px-2 py-1 bg-purple-100 rounded-full text-sm">{skill}</span>)}  
              </div>  
              <p className="text-sm text-gray-600">Disponibilidad: {profile.availability || 'No especificada'}</p>  

              {profile.portfolio && profile.portfolio.length > 0 && profile.portfolio.filter(link => link.trim()).length > 0 && (  
                <div>  
                  <h4 className="font-semibold mb-1">Portafolio:</h4>  
                  {profile.portfolio.filter(link => link.trim()).map((link, i) => (  
                    <a key={i} href={link} target="_blank" className="block text-purple-600 text-sm hover:underline">{link}</a>  
                  ))}  
                </div>  
              )}  
            </div>  

            <div className="grid grid-cols-2 gap-4 mb-4">  
              <div className="text-center p-3 bg-gray-50 rounded-lg">  
                <h3 className="text-lg font-bold">{jobs.length}</h3>  
                <p className="text-sm text-gray-600">Trabajos publicados</p>  
              </div>  
              <div className="text-center p-3 bg-gray-50 rounded-lg">  
                <h3 className="text-lg font-bold">4.5</h3>  
                <p className="text-sm text-gray-600">Calificación</p>  
              </div>  
            </div>  

            <div className="space-y-3 mb-6">  
              <h3 className="font-semibold">Últimos trabajos publicados</h3>  
              {jobs.length === 0 ? <p className="text-gray-600">No hay trabajos.</p> : jobs.map(job => (  
                <motion.div key={job.id} className="p-3 bg-gray-50 rounded-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>  
                  <p className="font-medium">{job.title}</p>  
                  <p className="text-sm text-gray-600">{job.description.substring(0, 50)}...</p>  
                </motion.div>  
              ))}  
            </div>  

            {isOwnProfile && <motion.button onClick={() => navigate('/profile/edit')} className="w-full bg-purple-600 text-white py-3 rounded-2xl font-semibold" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Editar Perfil</motion.button>}  
          </div>  

        ) : (  
          <form onSubmit={handleSave} className="space-y-4">  
            <div className="text-center mb-4">  
              <label htmlFor="photo-upload" className="cursor-pointer block">  
                <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center border-2 border-dashed border-gray-300">  
                  <img src={photoFile ? URL.createObjectURL(photoFile) : (profile?.photo_url || '/default-avatar.png')} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />  
                </div>  
                <p className="text-sm text-purple-600">Cambiar foto (opcional)</p>  
              </label>  
              <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} className="hidden" />  
            </div>  

            <div className="grid grid-cols-2 gap-4 mb-4">  
              <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 w-full" required />  
              <input type="text" placeholder="Apellido" value={lastname} onChange={(e) => setLastname(e.target.value)} className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 w-full" required />  
            </div>  

            <input type="number" placeholder="Edad (18+)" value={age} onChange={(e) => setAge(e.target.value)} min={18} max={100} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500" required />  

            <div>  
              <label className="block text-sm font-medium mb-1">Oficios (selecciona al menos 1)</label>  
              <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">  
                {oficios.map(oficio => (  
                  <button key={oficio} type="button" onClick={() => toggleOficio(oficio)} className={`p-2 rounded-lg border ${selectedOficios.includes(oficio) ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-300 bg-white'}`}>  
                    {selectedOficios.includes(oficio) ? '✓' : '○'} {oficio}  
                  </button>  
                ))}  
              </div>  
              {selectedOficios.length === 0 && <p className="text-red-500 text-sm mt-1">Selecciona al menos 1 oficio.</p>}  
            </div>  

            <div>  
              <label className="block text-sm font-medium mb-1">Biografía (max 300 chars)</label>  
              <textarea placeholder="Breve biografía sobre ti y tu experiencia..." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={300} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500" required />  
              <p className="text-sm text-gray-500 text-right">{bioCount}/300</p>  
            </div>  

            <div className="grid grid-cols-2 gap-4">  
              <select value={city} onChange={(e) => setCity(e.target.value)} className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500" required>  
                <option value="">Ciudad RM</option>  
                {ciudades.map(c => <option key={c} value={c}>{c}</option>)}  
              </select>  
              <select value={commune} onChange={(e) => setCommune(e.target.value)} className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500" required>  
                <option value="">Comuna</option>  
                {comunas.map(c => <option key={c} value={c}>{c}</option>)}  
              </select>  
            </div>  

            <input type="tel" placeholder="Teléfono/WhatsApp (+56 9 1234 5678)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500" required pattern="^\+56\s?9\s?\d{8}$" title="Formato +56 9 1234 5678" />  

            <details className="border rounded-xl p-3">  
              <summary className="cursor-pointer font-medium mb-2">Disponibilidad (opcional)</summary>  
              <textarea placeholder="Ej. Lunes a Viernes 9-18h" value={availability} onChange={(e) => setAvailability(e.target.value)} rows={2} className="w-full p-3 rounded-xl border border-gray-200" />  
            </details>  

            <details className="border rounded-xl p-3">  
              <summary className="cursor-pointer font-medium mb-2">Portafolio (máx 3 enlaces, opcional)</summary>  
              {portfolio.map((link, index) => {  
                if (link.trim() === '') return null;  
                return (  
                  <div key={index} className="flex gap-2 mb-2">  
                    <input type="url" placeholder="Enlace" value={link} onChange={(e) => updatePortfolio(index, e.target.value)} className="flex-1 p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500" />  
                    <button type="button" onClick={() => removePortfolio(index)} className="px-3 py-2 bg-red-500 text-white rounded-lg">X</button>  
                  </div>  
                );  
              })}  
              {portfolio.filter(link => link.trim()).length < 3 && <button type="button" onClick={addPortfolio} className="text-purple-600 font-medium">+ Agregar enlace</button>}  
            </details>  

            {errorMsg && <p className="text-red-500 text-sm p-3 bg-red-50 rounded-xl">{errorMsg}</p>}  

            <motion.button type="submit" disabled={loading || !validationOK()} className={`w-full py-3 rounded-2xl font-semibold disabled:opacity-50 ${validationOK() ? 'bg-purple-600 text-white' : 'bg-gray-300'}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>  
              {loading ? 'Guardando...' : 'Guardar Perfil'}  
            </motion.button>  

            {isCreate && <button type="button" onClick={handleSkip} className="w-full py-3 bg-gray-300 rounded-2xl font-semibold">Más tarde</button>}  
          </form>  

        )}  
      </motion.div>  
      <BottomNav />  
    </div>  
  );  

  const validationOK = () => name && lastname && age >= 18 && selectedOficios.length > 0 && bio && bio.length <= 300 && city && commune && phone.match(/^\+56\s?9\s?\d{8}$/);  

  const toggleOficio = (oficio) => {  
    setSelectedOficios(prev => prev.includes(oficio) ? prev.filter(s => s !== oficio) : [...prev, oficio]);  
  };  

  const updatePortfolio = (index, value) => {  
    const newPortfolio = [...portfolio];  
    newPortfolio[index] = value;  
    setPortfolio(newPortfolio);  
  };  

  const removePortfolio = (index) => {  
    const newPortfolio = portfolio.filter((_, i) => i !== index);  
    while (newPortfolio.length < 3) newPortfolio.push('');  
    setPortfolio(newPortfolio);  
  };  

  const addPortfolio = () => {  
    if (portfolio.filter(l => l.trim()).length < 3) setPortfolio([...portfolio, '']);  
  };  

  const handleSkip = () => {  
    navigate('/home');  
  };  

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Cargando perfil...</p></div>;  

  return (  
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-4 pb-20">  
      <motion.div className="bg-white rounded-3xl p-6 shadow-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>  
        <h1 className="text-2xl font-bold text-center mb-6">Mi Perfil</h1>  
        <div className="space-y-4">  
          <div className="text-center mb-4">  
            <img src={profile?.photo_url || '/default-avatar.png'} alt="Avatar" className="w-20 h-20 rounded-full mx-auto border-2 border-purple-200" />  
            <h2 className="text-xl font-bold mt-2">{profile?.name} {profile?.lastname}</h2>  
            <p className="text-sm text-gray-600">Edad: {profile?.age} | {profile?.city}, {profile?.commune}</p>  
            <p className="text-sm text-gray-600">Tel: {profile?.phone}</p>  
          </div>  

          <div className="flex space-x-1 border-b mb-4">  
            <button className="flex-1 pb-2 border-b-2 border-purple-600 font-semibold">Sobre mí</button>  
            <button className="flex-1 pb-2">Reseñas</button>  
            <button className="flex-1 pb-2">Trabajos publicados</button>  
            <button className="flex-1 pb-2">Trabajos realizados</button>  
          </div>  

          <div className="space-y-3">  
            <p className="text-sm text-gray-700">{profile?.bio}</p>  
            <div className="flex flex-wrap gap-2">  
              {profile?.skills?.map(skill => <span key={skill} className="px-2 py-1 bg-purple-100 rounded-full text-sm">{skill}</span>)}  
            </div>  
            <p className="text-sm text-gray-600">Disponibilidad: {profile?.availability || 'No especificada'}</p>  

            {profile?.portfolio && profile.portfolio.length > 0 && (  
              <div>  
                <h4 className="font-semibold mb-1">Portafolio:</h4>  
                {profile.portfolio.filter(link => link.trim()).map((link, i) => <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="block text-purple-600 text-sm hover:underline mb-1">{link}</a>)}  
              </div>  
            )}  
          </div>  

          <div className="grid grid-cols-2 gap-4 mb-4">  
            <div className="text-center p-3 bg-gray-50 rounded-lg">  
              <h3 className="text-lg font-bold">{jobs.length}</h3>  
              <p className="text-sm text-gray-600">Trabajos publicados</p>  
            </div>  
            <div className="text-center p-3 bg-gray-50 rounded-lg">  
              <h3 className="text-lg font-bold">4.5</h3>  
              <p className="text-sm text-gray-600">Calificación promedio</p>  
            </div>  
          </div>  

          <div className="space-y-3 mb-6">  
            <h3 className="font-semibold">Últimos trabajos publicados</h3>  
            {jobs.length === 0 ? <p className="text-gray-600">No hay trabajos.</p> : jobs.map(job => (  
              <div key={job.id} className="p-3 bg-gray-50 rounded-lg mb-2">  
                <p className="font-medium">{job.title}</p>  
                <p className="text-sm text-gray-600">{job.description.substring(0, 50)}...</p>  
              </div>  
            ))}  
          </div>  

          <motion.button onClick={() => navigate('/profile/edit')} className="w-full bg-purple-600 text-white py-3 rounded-2xl font-semibold" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Editar Perfil</motion.button>  
        </div>  
      </motion.div>  
      <BottomNav />  
    </div>  
  );  
};  

export default Profile;
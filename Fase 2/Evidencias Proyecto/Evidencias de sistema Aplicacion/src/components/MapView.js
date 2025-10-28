import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';  
import L from 'leaflet';  
import { MapPin, ArrowLeft } from 'lucide-react';  
import { supabase } from '../supabaseClient';  
import { useNavigate } from 'react-router-dom';  
import 'leaflet/dist/leaflet.css';  

const MapView = () => {  
  const [userLocation, setUserLocation] = useState(null);  
  const [jobs, setJobs] = useState([]);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState('');  
  const navigate = useNavigate();  

  useEffect(() => {  
    if (navigator.geolocation) {  
      navigator.geolocation.getCurrentPosition(  
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),  
        () => setUserLocation({ lat: -33.4489, lng: -70.6693 })  
      );  
    } else {  
      setUserLocation({ lat: -33.4489, lng: -70.6693 });  
    }  

    const fetchJobs = async () => {  
      const { data, error } = await supabase  
        .from('jobs')  
        .select('*, addresses(full_address, latitud, longitud, ciudad, comuna)')  
        .eq('status', 'active');  

      if (error) {  
        setError('Error trabajos.');  
        setLoading(false);  
        return;  
      }  

      const rmJobs = data?.filter(job => {  
        const address = job.addresses;  
        if (!address || !address.latitud || !address.longitud) return false;  
        return address.latitud >= -34 && address.latitud <= -33 && address.longitud >= -71 && address.longitud <= -70;  
      }) || [];  

      setJobs(rmJobs);  
      setLoading(false);  
      if (rmJobs.length === 0) setError('No trabajos en RM.');  
    };  

    fetchJobs();  
  }, []);  

  const handleBack = () => navigate('/home');  

  if (loading) {  
    return <div className="min-h-screen bg-purple-50 p-4 flex items-center justify-center"><p>Cargando...</p></div>;  
  }  

  return (  
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-4 pb-20 relative">  
      <motion.button  
        onClick={handleBack}  
        className="absolute top-4 left-4 z-50 bg-white p-3 rounded-full shadow-lg border flex gap-2 hover:shadow-xl"  
        whileHover={{ scale: 1.05 }}  
        whileTap={{ scale: 0.95 }}  
      >  
        <ArrowLeft className="w-5 h-5 text-purple-600" /> Volver  
      </motion.button>  

      {error && <motion.p className="text-yellow-600 bg-yellow-50 p-3 rounded-2xl mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}  

      <h1 className="text-2xl font-bold text-center mb-4 text-gray-800 bg-white p-2 rounded-xl">Trabajos RM</h1>  

      <MapContainer center={userLocation || [-33.4489, -70.6693]} zoom={10} style={{ height: 'calc(100vh - 160px)', width: '100%', borderRadius: '1rem' }} className="rounded-2xl shadow-lg">  
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />  
        {userLocation && <Marker position={[userLocation.lat, userLocation.lng]}><Popup>Tu ubicación</Popup></Marker>}  
        {jobs.map(job => {  
          const address = job.addresses;  
          if (!address?.latitud || !address?.longitud) return null;  
          return <Marker key={job.id} position={[address.latitud, address.longitud]}>  
            <Popup>  
              <div className="min-w-64 p-3">  
                <h3 className="font-bold text-purple-600">{job.title}</h3>  
                <p className="text-sm mb-2">{address.full_address}</p>  
                <p className="text-sm text-gray-600 mb-2">{job.description.substring(0, 80)}...</p>  
                <p className="text-xs font-medium">${job.payment || 'Voluntario'}</p>  
                <button onClick={() => navigate(`/job/${job.id}`)} className="mt-2 w-full bg-purple-600 text-white py-1 rounded text-sm">Ver Detalles</button>  
              </div>  
            </Popup>  
          </Marker>;  
        })}  
      </MapContainer>  
      <p className="text-center text-sm text-gray-500 mt-4">{jobs.length} trabajos en RM</p>  
    </div>  
  );  
};  

export default MapView;
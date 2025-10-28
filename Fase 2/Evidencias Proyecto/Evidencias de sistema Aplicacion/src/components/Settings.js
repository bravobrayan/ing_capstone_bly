import React from 'react'  
import { motion } from 'framer-motion'  
import { supabase } from '../supabaseClient'  
import { Settings as SettingsIcon, LogOut } from 'lucide-react'  
import BottomNav from './BottomNav'  

const Settings = () => {  
  const handleLogout = async () => {  
    await supabase.auth.signOut()  
    window.location.href = '/login'  
  }  

  return (  
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-4 pb-20">  
      <motion.div className="bg-white rounded-3xl p-6 shadow-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>  
        <div className="flex items-center gap-3 mb-6">  
          <SettingsIcon className="w-6 h-6 text-purple-600" />  
          <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>  
        </div>  
        <div className="space-y-4">  
          <button className="w-full text-left p-4 rounded-2xl bg-gray-50 hover:bg-gray-100">Cambiar Contraseña</button>  
          <button className="w-full text-left p-4 rounded-2xl bg-gray-50 hover:bg-gray-100">Notificaciones Push</button>  
          <button className="w-full text-left p-4 rounded-2xl bg-gray-50 hover:bg-gray-100">Preferencias de Trabajo</button>  
          <motion.button  
            onClick={handleLogout}  
            className="w-full flex items-center gap-3 p-4 text-red-600 font-semibold rounded-2xl bg-red-50 hover:bg-red-100"  
            whileTap={{ scale: 0.98 }}  
          >  
            <LogOut className="w-5 h-5" />  
            Cerrar Sesión  
          </motion.button>  
        </div>  
      </motion.div>  
      <BottomNav />  
    </div>  
  )  
}  

export default Settings
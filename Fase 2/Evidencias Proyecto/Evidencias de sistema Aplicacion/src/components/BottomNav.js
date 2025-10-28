import React from 'react'  
import { motion } from 'framer-motion'  
import { Home, Plus, Bell, Settings } from 'lucide-react'  
import { useLocation, useNavigate } from 'react-router-dom'  

const BottomNav = () => {  
  const location = useLocation()  
  const navigate = useNavigate()  
  const navItems = [  
    { path: '/home', icon: Home, label: 'Inicio' },  
    { path: '/publish', icon: Plus, label: 'Publicar' },  
    { path: '/notifications', icon: Bell, label: 'Notificaciones' },  
    { path: '/settings', icon: Settings, label: 'Configuración' }  
  ]  

  return (  
    <motion.div  
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 max-w-md mx-auto"  
      initial={{ y: 100 }}  
      animate={{ y: 0 }}  
      transition={{ duration: 0.3 }}  
    >  
      <div className="flex justify-around py-2">  
        {navItems.map((item) => (  
          <motion.button  
            key={item.path}  
            onClick={() => navigate(item.path)}  
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${  
              location.pathname === item.path  
                ? 'text-purple-600'  
                : 'text-gray-500 hover:text-purple-500'  
            }`}  
            whileTap={{ scale: 0.95 }}  
          >  
            <item.icon className="w-6 h-6 mb-1" />  
            <span className="text-xs font-medium">{item.label}</span>  
          </motion.button>  
        ))}  
      </div>  
    </motion.div>  
  )  
}  

export default BottomNav
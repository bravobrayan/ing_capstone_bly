import React, { useState, useEffect } from 'react'  
import { motion } from 'framer-motion'  
import { supabase } from '../supabaseClient'  
import { Bell } from 'lucide-react'  
import BottomNav from './BottomNav'  

const Notifications = () => {  
  const [notifications, setNotifications] = useState([])  
  const [currentUserId, setCurrentUserId] = useState(null)  
  const [channel, setChannel] = useState(null)  

  const fetchNotifications = async (userId) => {  
    if (!userId) return  
    const { data, error } = await supabase  
      .from('notifications')  
      .select('*')  
      .eq('user_id', userId)  
      .order('created_at', { ascending: false })  
    if (error) {  
      console.error(error)  
    } else {  
      setNotifications(data || [])  
    }  
  }  

  // Cargar user y notificaciones iniciales  
  useEffect(() => {  
    const initUser = async () => {  
      const { data: { user } } = await supabase.auth.getUser()  
      if (user) {  
        setCurrentUserId(user.id)  
        fetchNotifications(user.id)  
      }  
    }  
    initUser()  
  }, [])  

  // Configurar suscripción real-time solo después de tener userId  
  useEffect(() => {  
    if (!currentUserId) return  

    const subscription = supabase  
      .channel('notifications')  
      .on(  
        'postgres_changes',  
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUserId}` },  
        (payload) => {  
          fetchNotifications(currentUserId)  
        }  
      )  
      .subscribe((status, err) => {  
        if (status === 'SUBSCRIBED') {  
          setChannel(subscription)  
        } else if (err) {  
          console.error('Error en suscripción:', err)  
        }  
      })  

    // Cleanup: remover canal al desmontar  
    return () => {  
      if (subscription) {  
        supabase.removeChannel(subscription)  
      }  
    }  
  }, [currentUserId])  

  // Recargar notificaciones si cambia userId  
  useEffect(() => {  
    if (currentUserId) {  
      fetchNotifications(currentUserId)  
    }  
  }, [currentUserId])  

  const markAsRead = async (id) => {  
    const { error } = await supabase  
      .from('notifications')  
      .update({ is_read: true })  
      .eq('id', id)  

    if (!error) {  
      setNotifications(prev =>  
        prev.map(notif =>  
          notif.id === id ? { ...notif, is_read: true } : notif  
        )  
      )  
    }  
  }  

  return (  
    <div className="min-h-screen bg-purple-50 p-4 max-w-md mx-auto pt-4 pb-20">  
      <motion.div className="bg-white rounded-3xl p-6 shadow-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>  
        <div className="flex items-center gap-3 mb-6">  
          <Bell className="w-6 h-6 text-purple-600" />  
          <h1 className="text-2xl font-bold text-gray-800">Notificaciones</h1>  
        </div>  
        <div className="space-y-4">  
          {notifications.map((notif) => (  
            <motion.div  
              key={notif.id}  
              className={`p-4 rounded-2xl border cursor-pointer ${  
                notif.is_read ? 'border-gray-200 bg-gray-50' : 'border-purple-200 bg-purple-50'  
              }`}  
              onClick={() => markAsRead(notif.id)}  
              whileTap={{ scale: 0.98 }}  
            >  
              <h3 className="font-semibold text-gray-800">{notif.title}</h3>  
              <p className="text-sm text-gray-600">{notif.message}</p>  
              <p className="text-xs text-gray-500 mt-2">{new Date(notif.created_at).toLocaleString()}</p>  
            </motion.div>  
          ))}  
          {notifications.length === 0 && (  
            <p className="text-center text-gray-500 py-8">No hay notificaciones nuevas.</p>  
          )}  
        </div>  
      </motion.div>  
      <BottomNav />  
    </div>  
  )  
}  

export default Notifications
import { createClient } from '@supabase/supabase-js'

// 👇 Credenciales reales de tu proyecto Supabase
const supabaseUrl = 'https://cbjjuuoffscgbcjihbxo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiamp1dW9mZnNjZ2JjamloYnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjg3NDIsImV4cCI6MjA3NjY0NDc0Mn0.e0Toi1lYl7P0XIuIsRduViP0TuB6_jB96qmVdGN3Obs'

// ⚙️ Inicialización del cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// (opcional) Callback URL si usas magic links o recuperación
export const getRedirectUrl = () => `${window.location.origin}/auth/callback`

// 🔍 Prueba automática al iniciar
supabase
  .from('profiles')
  .select('*')
  .limit(1)
  .then(({ error }) => {
    if (error) {
      console.error('❌ Error de conexión con Supabase:', error.message)
    } else {
      console.log('✅ Conexión exitosa a Supabase!')
    }
  })

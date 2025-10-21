// Updated to check profile complete before insert  
const handlePublish = async (e) => {  
  e.preventDefault();  
  setErrorMsg('');  

  if (!title || !description || !category || !ciudad || !comuna || !direccionExacta || !availableDate) {  
    setErrorMsg('Por favor completa todos los campos antes de publicar.');  
    return;  
  }  

  // Check profile complete  
  const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single();  
  if (profileError || !profileData || !profileData.name || !profileData.bio || profileData.skills.length === 0) {  
    setErrorMsg('Completa tu perfil para publicar.');  
    navigate('/profile/create');  
    return;  
  }  

  // Rest same as before...  
  // (RPC, insert job, etc.)  

  // ...  
};
// Update Auth component to redirect to /profile-create after signup (mandatory)
const Auth = () => {  
  useEffect(() => {  
    supabase.auth.signUp({ email, password }).then(({ error }) => {  
      if (!error) {  
        navigate('/profile-create'); // Post-signup to create profile  
      }  
    });  
  }, []);  

  return (  
    <div className="min-h-screen bg-purple-50 p-4 flex items-center justify-center">  
      {/* Auth form code... */}  
    </div>  
  );  
};  

// Note: Complete Auth component as per your existing, with redirect after sign up.
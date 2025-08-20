import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const afterAuth = () => {
    const redirect = router.query.redirect || '/employer'; // default 
target
    router.replace(String(redirect));
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);
    afterAuth();
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, 
password });
    if (error) return alert(error.message);
    afterAuth();
  };

  return (
    <main style={{maxWidth:420, margin:'40px auto', 
fontFamily:'system-ui'}}>
      <h1>Login / Sign Up</h1>
      <input type="email" placeholder="Email" value={email}
             onChange={e=>setEmail(e.target.value)} 
style={{width:'100%',padding:10,marginBottom:8}}/>
      <input type="password" placeholder="Password" value={password}
             onChange={e=>setPassword(e.target.value)} 
style={{width:'100%',padding:10,marginBottom:12}}/>
      <div style={{display:'flex', gap:8}}>
        <button onClick={signUp}>Sign Up</button>
        <button onClick={signIn}>Sign In</button>
      </div>
    </main>
  );
}


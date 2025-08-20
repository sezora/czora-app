import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', pay: '' });
  const [employerId, setEmployerId] = useState(null);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSession(data.session);
        const user = data.session.user;

        // Upsert employer profile
        const { data: existing, error: selErr } = await supabase
          .from('employers')
          .select(`id, company_name, contact_email`)
          .eq('user_id', user.id)
          .maybeSingle();

        if (selErr) {
          alert(selErr.message);
          return;
        }

        if (existing) {
          setEmployerId(existing.id);
          setCompanyName(existing.company_name);
        } else {
          const draft = {
            user_id: user.id,
            company_name: 'My Company',
            contact_email: user.email,
          };
          const { data: inserted, error: insErr } = await supabase
            .from('employers')
            .insert(draft)
            .select(`id, company_name, contact_email`)
            .single();
          if (insErr) {
            alert(insErr.message);
            return;
          }
          setEmployerId(inserted.id);
          setCompanyName(inserted.company_name);
        }
      }
    };
    init();
  }, []);

  const afterAuth = () => {
    const redirect = router.query.redirect || '/employer';
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

  const createJob = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.pay) return alert('All fields required');
    const { error } = await supabase.from('jobs').insert({
      employer_id: employerId,
      name: form.name,
      location: form.location,
      pay: form.pay,
      is_published: true,
    });
    if (error) return alert(error.message);
    alert('Job posted!');
    setForm({ name: '', location: '', pay: '' });
  };

  if (!session) {
    return (
      <main style={{ maxWidth: 420, margin: '40px auto', fontFamily: 
'system-ui' }}>
        <h1>Login / Sign Up</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 12 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={signUp}>Sign Up</button>
          <button onClick={signIn}>Sign In</button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 420, margin: '40px auto', fontFamily: 
'system-ui' }}>
      <h1>Welcome, {companyName || 'employer'}</h1>
      <form onSubmit={createJob}>
        <input
          placeholder="Job name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ width: '100%', padding: 10, marginBottom: 8 }}
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          style={{ width: '100%', padding: 10, marginBottom: 8 }}
        />
        <input
          placeholder="Pay"
          value={form.pay}
          onChange={(e) => setForm({ ...form, pay: e.target.value })}
          style={{ width: '100%', padding: 10, marginBottom: 12 }}
        />
        <button type="submit">Post Job</button>
      </form>
    </main>
  );
}


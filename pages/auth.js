import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Employer() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [employerId, setEmployerId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ name:'', location:'', pay:'' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return 
router.replace('/auth?redirect=/employer');
      setSession(data.session);
    });
  }, [router]);

  useEffect(() => {
    if (!session) return;
    // Ensure employer profile exists; if not, create a lightweight one
    const upsertEmployer = async () => {
      const user = session.user;
      const { data: existing, error: selErr } = await supabase
        .from('employers').select('id, company_name, contact_email').eq('user_id', user.id).maybeSingle();
      if (selErr) { alert(selErr.message); return; }
      if (existing) {
        setEmployerId(existing.id);
        setCompanyName(existing.company_name);
        setContactEmail(existing.contact_email);
      } else {
        const draft = { user_id: user.id, company_name: 'My Company', 
contact_email: user.email };
        const { data: inserted, error: insErr } = await 
supabase.from('employers').insert(draft).select('id, company_name, contact_email').single();
        if (insErr) { alert(insErr.message); return; }
        setEmployerId(inserted.id);
        setCompanyName(inserted.company_name);
        setContactEmail(inserted.contact_email);
      }
    };
    upsertEmployer();
  }, [session]);

  const loadJobs = async () => {
    if (!employerId) return;
    const { data, error } = await supabase.from('jobs')
      .select('id,name,location,pay,is_published,created_at')
      .eq('employer_id', employerId).order('created_at', { ascending:false 
});
    if (error) return alert(error.message);
    setJobs(data || []);
  };

  useEffect(() => { loadJobs(); }, [employerId]);

  const createJob = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.pay) return alert('All 
fields required');
    const { error } = await supabase.from('jobs').insert({
      employer_id: employerId, name: form.name, location: form.location, 
pay: form.pay, is_published: true
    });
    if (error) return alert(error.message);
    setForm({ name:'', location:'', pay:'' });
    loadJobs();
  };

  const signOut = async () => { await supabase.auth.signOut(); 
router.replace('/auth'); };

  if (!session) return <p style={{padding:20}}>Loading…</p>;

  return (
    <main style={{maxWidth:720, margin:'40px auto', 
fontFamily:'system-ui'}}>
      <h1>Employer Dashboard</h1>
      <p><b>Company:</b> {companyName} — <b>Contact:</b> 
{contactEmail}</p>

      <form onSubmit={createJob} style={{display:'grid', gap:8, 
margin:'16px 0'}}>
        <input placeholder="Job name" value={form.name} 
onChange={e=>setForm({...form, name:e.target.value})}/>
        <input placeholder="Location" value={form.location} 
onChange={e=>setForm({...form, location:e.target.value})}/>
        <input placeholder="Pay" value={form.pay} 
onChange={e=>setForm({...form, pay:e.target.value})}/>
        <button type="submit">Create Job</button>
      </form>

      <h2>Your Jobs</h2>
      <ul>
        {jobs.map(j => (
          <li key={j.id} style={{marginBottom:8}}>
            <b>{j.name}</b> — {j.location} — {j.pay} {j.is_published ? '' 
: '(hidden)'}
          </li>
        ))}
      </ul>

      <button onClick={signOut} style={{marginTop:16}}>Sign Out</button>
    </main>
  );
}


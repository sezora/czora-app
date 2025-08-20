import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const ADMIN_EMAIL = 'you@example.com'; // <-- set yours

export default function Admin() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return router.replace('/auth?redirect=/admin');
      if (data.session.user.email !== ADMIN_EMAIL) return 
router.replace('/auth');
      setSession(data.session);
    });
  }, [router]);

  useEffect(() => {
    const load = async () => {
      const j = await 
supabase.from('jobs').select('id,name,location,pay,created_at,is_published,employer_id');
      const e = await 
supabase.from('employers').select('id,company_name,contact_email,created_at');
      const a = await 
supabase.from('applications').select('id,job_id,applicant_user_id,created_at');
      if (j.error || e.error || a.error) return alert('Admin load error');
      setJobs(j.data || []); setEmployers(e.data || []); setApps(a.data || 
[]);
    };
    if (session) load();
  }, [session]);

  if (!session) return <p style={{padding:20}}>Loading…</p>;

  return (
    <main style={{maxWidth:960, margin:'40px auto', 
fontFamily:'system-ui'}}>
      <h1>Admin</h1>
      <h2>Employers</h2>
      <pre>{JSON.stringify(employers, null, 2)}</pre>
      <h2>Jobs</h2>
      <pre>{JSON.stringify(jobs, null, 2)}</pre>
      <h2>Applications</h2>
      <pre>{JSON.stringify(apps, null, 2)}</pre>
    </main>
  );
}


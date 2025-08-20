import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function ApplyJob() {
  const router = useRouter();
  const { jobId } = router.query;
  const [status, setStatus] = useState('Checking session…');

  useEffect(() => {
    const go = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace(`/auth?redirect=/apply/${jobId}`);
        return;
      }
      const userId = data.session.user.id;

      // Ensure student profile exists (lightweight)
      await supabase.from('student_profiles')
        .upsert({ user_id: userId, email: data.session.user.email }, { 
onConflict: 'user_id' });

      // Create application
      const { error } = await supabase.from('applications').insert({
        job_id: jobId,
        applicant_user_id: userId
      });
      if (error) { setStatus('Error: ' + error.message); return; }

      setStatus('Applied! Redirecting to employer…');
      setTimeout(() => router.replace('/auth?redirect=/employer'), 1200);
    };
    if (jobId) go();
  }, [jobId, router]);

  return <p style={{padding:20, fontFamily:'system-ui'}}>{status}</p>;
}


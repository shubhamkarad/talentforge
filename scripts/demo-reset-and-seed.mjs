// Reset the local Supabase DB and seed demo data — employer + candidate user,
// a company, a job, and an application linking them. Everything beyond the raw
// schema has to be created through the auth API (so auth.users rows exist and
// the public.profiles trigger fires correctly).
//
// Usage:
//   SUPABASE_URL=http://localhost:54321 \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   node scripts/demo-reset-and-seed.mjs
//
// Typically called via: pnpm demo:seed

import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMPLOYER = { email: 'employer@talentforge.dev', password: 'Demo-employer-1', fullName: 'Avery Employer' };
const CANDIDATE = { email: 'candidate@talentforge.dev', password: 'Demo-candidate-1', fullName: 'Jordan Candidate' };

async function reset() {
  console.log('==> supabase db reset');
  execSync('supabase db reset', { stdio: 'inherit' });
}

async function createUser({ email, password, fullName, role }) {
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user;
}

async function main() {
  await reset();

  // brief pause so migration triggers settle.
  await new Promise((r) => setTimeout(r, 1000));

  console.log('==> seed users');
  const employer = await createUser({ ...EMPLOYER, role: 'employer' });
  const candidate = await createUser({ ...CANDIDATE, role: 'candidate' });

  console.log('==> seed company');
  const { data: company, error: companyErr } = await sb
    .from('companies')
    .insert({
      owner_id: employer.id,
      name: 'Nimbus Systems',
      description: 'Small team building observability tooling.',
      website: 'https://nimbus.example',
      industry: 'SaaS',
      size: '11-50',
    })
    .select()
    .single();
  if (companyErr) throw companyErr;

  console.log('==> seed job');
  const { data: job, error: jobErr } = await sb
    .from('jobs')
    .insert({
      company_id: company.id,
      employer_id: employer.id,
      title: 'Senior TypeScript Engineer',
      description:
        'Own a slice of the frontend stack. Ship a feature a week. Obsess over instrumentation.',
      requirements: ['5+ years of TS/React', 'Experience debugging production issues', 'Ownership instinct'],
      responsibilities: ['Build and own core UI features', 'Instrument everything', 'Mentor juniors'],
      skills_required: ['TypeScript', 'React', 'Postgres', 'Observability'],
      experience_level: 'senior',
      employment_type: 'full-time',
      remote_type: 'remote',
      location: 'Remote · EU',
      salary_min: 140000,
      salary_max: 180000,
      salary_currency: 'USD',
      salary_period: 'year',
      show_salary: true,
      status: 'active',
      published_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (jobErr) throw jobErr;

  console.log('==> seed candidate profile');
  await sb
    .from('candidate_profiles')
    .update({
      headline: 'Senior full-stack engineer · infra focus',
      bio: 'Shipped production TS/React for 7 years. Ran observability at a Series B.',
      skills: [
        { name: 'TypeScript' },
        { name: 'React' },
        { name: 'Postgres' },
        { name: 'Observability' },
      ],
      experience: [
        {
          title: 'Senior Engineer',
          company: 'Acme',
          startDate: '2021-01',
          endDate: null,
          current: true,
          description: 'Led the frontend platform for the analytics product.',
        },
      ],
      education: [
        {
          institution: 'University of Somewhere',
          degree: 'B.Sc. Computer Science',
          year: '2017',
        },
      ],
      linkedin_url: 'https://linkedin.com/in/demo',
      open_to_work: true,
      open_to_remote: true,
    })
    .eq('id', candidate.id);

  console.log('==> seed application');
  await sb.from('applications').insert({
    job_id: job.id,
    candidate_id: candidate.id,
    cover_letter: 'Genuinely excited about observability. Would love to chat.',
    status: 'pending',
  });

  console.log('==> seed saved job');
  await sb.from('saved_jobs').insert({ candidate_id: candidate.id, job_id: job.id });

  console.log('\nDone. Sign in with:');
  console.log(`  employer:  ${EMPLOYER.email}  /  ${EMPLOYER.password}`);
  console.log(`  candidate: ${CANDIDATE.email} /  ${CANDIDATE.password}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

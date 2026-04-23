// Reset the local Supabase DB and seed a reviewer-ready dataset:
//   - 2 employers (each owning a company)
//   - 3 candidates (each with a polished profile)
//   - 3 jobs across the two companies
//   - 5 applications spanning pending / reviewing / interviewing / offer
//   - Precomputed match_scores so the score panel renders without a live
//     Cerebras call (the live flow still works once the key is set)
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

// ---------------------------------------------------------------------------
// Test accounts — keep these stable so README + demo video stay valid.
// ---------------------------------------------------------------------------

const EMPLOYERS = [
  {
    email: 'employer1@talentforge.dev',
    password: 'Employer1-Demo!',
    fullName: 'Avery Chen',
    role: 'employer',
  },
  {
    email: 'employer2@talentforge.dev',
    password: 'Employer2-Demo!',
    fullName: 'Morgan Patel',
    role: 'employer',
  },
];

const CANDIDATES = [
  {
    email: 'candidate1@talentforge.dev',
    password: 'Candidate1-Demo!',
    fullName: 'Jordan Rivera',
    role: 'candidate',
    profile: {
      headline: 'Senior full-stack engineer · TypeScript + observability',
      bio: 'Seven years shipping production React/TS. Led the analytics frontend at a Series B. Obsessed with instrumentation and build tooling.',
      skills: [
        { name: 'TypeScript' },
        { name: 'React' },
        { name: 'Node.js' },
        { name: 'Postgres' },
        { name: 'Observability' },
        { name: 'Datadog' },
      ],
      experience: [
        {
          title: 'Senior Engineer',
          company: 'Acme Analytics',
          startDate: '2021-01',
          endDate: null,
          current: true,
          description: 'Led the frontend platform; shipped a feature a week.',
        },
        {
          title: 'Software Engineer',
          company: 'Beacon',
          startDate: '2017-06',
          endDate: '2020-12',
          current: false,
          description: 'Built the billing and reporting surfaces.',
        },
      ],
      education: [{ institution: 'University of Toronto', degree: 'B.Sc. Computer Science', year: '2017' }],
      linkedin_url: 'https://linkedin.com/in/jordan-rivera-demo',
      open_to_work: true,
      open_to_remote: true,
    },
  },
  {
    email: 'candidate2@talentforge.dev',
    password: 'Candidate2-Demo!',
    fullName: 'Sam Kim',
    role: 'candidate',
    profile: {
      headline: 'Junior frontend engineer · eager to ship',
      bio: 'Two years building internal tools in React. Looking for a team where I can grow into a senior role and pair with strong mentors.',
      skills: [
        { name: 'JavaScript' },
        { name: 'React' },
        { name: 'CSS' },
        { name: 'Figma' },
      ],
      experience: [
        {
          title: 'Frontend Developer',
          company: 'Quill Labs',
          startDate: '2023-02',
          endDate: null,
          current: true,
          description: 'Internal dashboards and marketing pages.',
        },
      ],
      education: [{ institution: 'General Assembly', degree: 'Software Engineering Immersive', year: '2022' }],
      linkedin_url: 'https://linkedin.com/in/sam-kim-demo',
      open_to_work: true,
      open_to_remote: true,
    },
  },
  {
    email: 'candidate3@talentforge.dev',
    password: 'Candidate3-Demo!',
    fullName: 'Riley Park',
    role: 'candidate',
    profile: {
      headline: 'ML platform engineer · LLM serving + observability',
      bio: 'Five years building the guts of ML systems: model serving, feature stores, cost dashboards. Most recent: shipped a 10× throughput win on a fine-tuning pipeline.',
      skills: [
        { name: 'Python' },
        { name: 'PyTorch' },
        { name: 'Ray' },
        { name: 'Kubernetes' },
        { name: 'Postgres' },
        { name: 'Triton' },
      ],
      experience: [
        {
          title: 'ML Platform Engineer',
          company: 'Vector Systems',
          startDate: '2020-09',
          endDate: null,
          current: true,
          description: 'Model-serving + LLM fine-tuning pipelines.',
        },
      ],
      education: [{ institution: 'Georgia Tech', degree: 'M.Sc. Computer Science (ML specialization)', year: '2020' }],
      linkedin_url: 'https://linkedin.com/in/riley-park-demo',
      open_to_work: true,
      open_to_remote: true,
    },
  },
];

// ---------------------------------------------------------------------------
// Companies + jobs — each employer's seed data keyed by their index above.
// ---------------------------------------------------------------------------

const COMPANIES = [
  {
    ownerIdx: 0,
    name: 'Nimbus Systems',
    description: 'Small team building observability tooling for backend engineers.',
    website: 'https://nimbus.example',
    industry: 'Developer tools',
    size: '11-50',
  },
  {
    ownerIdx: 1,
    name: 'Helio Labs',
    description: 'AI infrastructure: model serving, eval tooling, cost dashboards.',
    website: 'https://helio.example',
    industry: 'AI / ML',
    size: '2-10',
  },
];

const JOBS = [
  {
    companyIdx: 0,
    title: 'Senior TypeScript Engineer',
    description:
      'Own a slice of our frontend platform. Ship a feature a week. Care deeply about build pipelines, instrumentation, and the kind of code reviewers actually read.',
    requirements: ['5+ years of TypeScript / React', 'Experience debugging production issues', 'Strong ownership instinct'],
    responsibilities: ['Build and own core UI features', 'Instrument everything', 'Mentor juniors'],
    skills_required: ['TypeScript', 'React', 'Postgres', 'Observability'],
    experience_level: 'senior',
    employment_type: 'full-time',
    remote_type: 'remote',
    location: 'Remote · EU',
    salary_min: 140000,
    salary_max: 180000,
  },
  {
    companyIdx: 0,
    title: 'Full-Stack Product Engineer',
    description:
      'Work across Next-style React UI and a Node + Postgres backend. Scope features end-to-end from a wireframe to a shipped release.',
    requirements: ['2-4 years full-stack experience', 'Comfortable with SQL', 'Bias to ship, then measure'],
    responsibilities: ['Prototype, ship, and instrument features', 'Own bugs to root cause'],
    skills_required: ['JavaScript', 'React', 'Node.js', 'Postgres'],
    experience_level: 'mid',
    employment_type: 'full-time',
    remote_type: 'hybrid',
    location: 'Berlin (hybrid)',
    salary_min: 80000,
    salary_max: 110000,
  },
  {
    companyIdx: 1,
    title: 'ML Platform Engineer',
    description:
      'Build the guts of our LLM platform: serving, eval, cost attribution. We have a tiny team and a lot of runway — ideal for someone who wants leverage over the whole stack.',
    requirements: ['4+ years ML platform / infra', 'Python + Kubernetes', 'Familiarity with model serving'],
    responsibilities: ['Ship the serving layer', 'Own the cost dashboard', 'Design the eval harness'],
    skills_required: ['Python', 'PyTorch', 'Kubernetes', 'Ray'],
    experience_level: 'senior',
    employment_type: 'full-time',
    remote_type: 'remote',
    location: 'Remote · worldwide',
    salary_min: 160000,
    salary_max: 210000,
  },
];

// ---------------------------------------------------------------------------
// Applications + precomputed AI match scores. The score panel renders from
// `match_scores` so having these precomputed means the demo works even
// without a live Cerebras key. Numbers chosen to be consistent with each
// candidate's profile vs. job requirements.
// ---------------------------------------------------------------------------

const APPLICATIONS = [
  // Jordan Rivera (senior TS) applied to both senior roles
  {
    candidateIdx: 0,
    jobIdx: 0,
    status: 'interviewing',
    cover_letter:
      'Observability is the stack I love most — I ran Datadog + custom Prom exporters at Acme. Would love to talk.',
    score: {
      overall_score: 92,
      skills_score: 94,
      experience_score: 90,
      summary:
        'Strong match. Direct TypeScript + observability background aligns with the core job description; tenure matches the seniority level.',
      strengths: [
        '7 years of production TypeScript + React exactly mirrors the "5+ years" requirement.',
        'Led an analytics-frontend platform — directly relevant to the observability product area.',
        'Demonstrated ownership (led a team) aligns with the "ownership instinct" signal the posting asks for.',
      ],
      concerns: [
        'No explicit Datadog or Grafana experience listed on profile — worth probing in the interview.',
      ],
    },
  },
  {
    candidateIdx: 0,
    jobIdx: 2,
    status: 'pending',
    cover_letter:
      'I lean frontend but I have shipped Node services and am eager to get deeper into ML infra.',
    score: {
      overall_score: 54,
      skills_score: 45,
      experience_score: 62,
      summary:
        'Mixed fit. Strong engineering fundamentals but almost no ML infra experience. Would onboard slowly into an ML platform team.',
      strengths: [
        'Senior-level engineering tenure; can ramp on new systems quickly.',
        'Has shipped Postgres-backed services, which overlaps with feature-store work.',
      ],
      concerns: [
        'No Python / PyTorch / Kubernetes experience listed — the core stack is a gap.',
        'No exposure to model serving or eval systems.',
        'Mostly frontend-focused tenure; backend ownership signals are weaker.',
      ],
    },
  },
  // Sam Kim (junior frontend) applied to the mid-level full-stack role
  {
    candidateIdx: 1,
    jobIdx: 1,
    status: 'reviewing',
    cover_letter:
      'I have 2 years of React at Quill Labs and I am ready to take on more ownership across the stack.',
    score: {
      overall_score: 58,
      skills_score: 55,
      experience_score: 60,
      summary:
        'Junior candidate applying to a mid-level role. Frontend basics are solid; backend experience is light.',
      strengths: [
        'Solid React fundamentals and a year of internal-tool frontend work.',
        'Coming out of a bootcamp — high learning velocity signal.',
      ],
      concerns: [
        'Only 2 years of experience against a 2-4 year requirement — on the low end.',
        'Node.js and Postgres not on the profile; backend is a gap for a full-stack role.',
      ],
    },
  },
  // Riley Park (ML) applied to both — one mismatched, one great
  {
    candidateIdx: 2,
    jobIdx: 0,
    status: 'pending',
    cover_letter:
      'I know it is a stretch but I have shipped React dashboards for my ML platform and I am curious about the product-eng side.',
    score: {
      overall_score: 32,
      skills_score: 24,
      experience_score: 42,
      summary:
        'Low fit. Background is ML platform / Python, not TypeScript. Could contribute to internal tooling but not to the core frontend product.',
      strengths: [
        'Senior-level tenure; strong systems thinking.',
        'Has shipped some React dashboards as side-of-desk ML tooling.',
      ],
      concerns: [
        'No production TypeScript experience of any depth.',
        'No React ecosystem expertise (router, state management, build tooling).',
        'Career trajectory is pointed at ML platform, not product frontend — cultural fit risk.',
      ],
    },
  },
  {
    candidateIdx: 2,
    jobIdx: 2,
    status: 'offer',
    cover_letter:
      'This is the role I have been aiming at for years. I built Vector Systems 10× serving win, happy to walk through the design.',
    score: {
      overall_score: 95,
      skills_score: 96,
      experience_score: 94,
      summary:
        'Exceptional match. Direct overlap with every listed skill and a demonstrated 10× performance win on a serving pipeline.',
      strengths: [
        'Python + PyTorch + Kubernetes + Ray are all on the profile and in recent production use.',
        'Shipped a 10× throughput improvement on a fine-tuning pipeline — exactly the leverage the role asks for.',
        'M.Sc. with an ML specialization aligns with the research adjacency of the team.',
      ],
      concerns: [
        'Only 1 role listed on profile — worth probing for breadth / team-dynamics experience in the interview.',
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

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
  await new Promise((r) => setTimeout(r, 1000));

  console.log('==> seed employers');
  const employers = [];
  for (const e of EMPLOYERS) {
    employers.push(await createUser(e));
  }

  console.log('==> seed candidates');
  const candidates = [];
  for (const c of CANDIDATES) {
    candidates.push(await createUser(c));
  }

  console.log('==> seed companies');
  const companies = [];
  for (const c of COMPANIES) {
    const { data, error } = await sb
      .from('companies')
      .insert({
        owner_id: employers[c.ownerIdx].id,
        name: c.name,
        description: c.description,
        website: c.website,
        industry: c.industry,
        size: c.size,
      })
      .select()
      .single();
    if (error) throw error;
    companies.push(data);
  }

  console.log('==> seed jobs');
  const jobs = [];
  for (const j of JOBS) {
    const company = companies[j.companyIdx];
    const { data, error } = await sb
      .from('jobs')
      .insert({
        company_id: company.id,
        employer_id: company.owner_id,
        title: j.title,
        description: j.description,
        requirements: j.requirements,
        responsibilities: j.responsibilities,
        skills_required: j.skills_required,
        experience_level: j.experience_level,
        employment_type: j.employment_type,
        remote_type: j.remote_type,
        location: j.location,
        salary_min: j.salary_min,
        salary_max: j.salary_max,
        salary_currency: 'USD',
        salary_period: 'year',
        show_salary: true,
        status: 'active',
        published_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    jobs.push(data);
  }

  console.log('==> seed candidate profiles');
  for (let i = 0; i < CANDIDATES.length; i += 1) {
    const { error } = await sb
      .from('candidate_profiles')
      .update(CANDIDATES[i].profile)
      .eq('id', candidates[i].id);
    if (error) throw error;
  }

  console.log('==> seed applications');
  const applications = [];
  for (const a of APPLICATIONS) {
    const { data, error } = await sb
      .from('applications')
      .insert({
        job_id: jobs[a.jobIdx].id,
        candidate_id: candidates[a.candidateIdx].id,
        cover_letter: a.cover_letter,
        status: a.status,
      })
      .select()
      .single();
    if (error) throw error;
    applications.push({ row: data, meta: a });
  }

  console.log('==> seed match_scores (precomputed for offline demo)');
  for (const { row, meta } of applications) {
    const { error } = await sb.from('match_scores').insert({
      candidate_id: row.candidate_id,
      job_id: row.job_id,
      overall_score: meta.score.overall_score,
      skills_score: meta.score.skills_score,
      experience_score: meta.score.experience_score,
      summary: meta.score.summary,
      strengths: meta.score.strengths,
      concerns: meta.score.concerns,
      model_used: 'seed-precomputed',
    });
    if (error) throw error;
  }

  console.log('==> seed a few saved jobs');
  await sb.from('saved_jobs').insert([
    { candidate_id: candidates[0].id, job_id: jobs[1].id },
    { candidate_id: candidates[1].id, job_id: jobs[0].id },
  ]);

  console.log('\n=============================================');
  console.log('Seed complete. Sign in with:');
  console.log('=============================================');
  console.log('\nEmployers:');
  for (const e of EMPLOYERS) {
    console.log(`  ${e.email.padEnd(32)} / ${e.password}`);
  }
  console.log('\nCandidates:');
  for (const c of CANDIDATES) {
    console.log(`  ${c.email.padEnd(32)} / ${c.password}`);
  }
  console.log(
    `\nSeeded: ${employers.length} employers, ${candidates.length} candidates, ${jobs.length} jobs, ${applications.length} applications (with match_scores).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

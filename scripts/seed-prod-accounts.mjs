// Prod-safe test-account seeder for the hosted Supabase project.
// Unlike demo-reset-and-seed.mjs this NEVER runs `supabase db reset`, never
// deletes anything, and is safe to re-run — every insert is idempotent
// (create-if-missing). Matches the accounts + data documented in README.md.
//
// Usage:
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=<service_role_key> \
//   node scripts/seed-prod-accounts.mjs
//
// Or via .env.local:
//   node --env-file=.env.local scripts/seed-prod-accounts.mjs
//   (note: VITE_SUPABASE_URL is read if SUPABASE_URL is missing.)

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Test accounts — keep in sync with README.md test-accounts table.
// ---------------------------------------------------------------------------

const EMPLOYERS = [
  {
    email: 'employer1@talentforge.dev',
    password: 'Employer1-Demo!',
    fullName: 'Avery Chen',
  },
  {
    email: 'employer2@talentforge.dev',
    password: 'Employer2-Demo!',
    fullName: 'Morgan Patel',
  },
];

const CANDIDATES = [
  {
    email: 'candidate1@talentforge.dev',
    password: 'Candidate1-Demo!',
    fullName: 'Jordan Rivera',
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
    size: '1-10',
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
  {
    companyIdx: 0,
    title: 'Backend Engineer (Go)',
    description:
      'Own the ingestion + query layer of our observability pipeline. High-throughput Go, Postgres + Clickhouse, and a taste for performance work. You will profile before you optimize.',
    requirements: ['3+ years of Go in production', 'Deep Postgres comfort', 'Experience with high-throughput services'],
    responsibilities: ['Own ingest throughput budgets', 'Profile + tune hot paths', 'Design the multi-tenant partitioning strategy'],
    skills_required: ['Go', 'Postgres', 'Clickhouse', 'gRPC'],
    experience_level: 'senior',
    employment_type: 'full-time',
    remote_type: 'remote',
    location: 'Remote · EU',
    salary_min: 130000,
    salary_max: 170000,
  },
  {
    companyIdx: 0,
    title: 'DevOps Engineer',
    description:
      'Make the build, deploy, and observability story boring. You will own our k8s + Terraform setup and work with the product team on SLOs that actually mean something.',
    requirements: ['3+ years of infra/DevOps', 'Kubernetes + Terraform', 'You like good docs'],
    responsibilities: ['Own the CI/CD pipeline', 'Tune k8s workloads and costs', 'Write the runbooks'],
    skills_required: ['Kubernetes', 'Terraform', 'AWS', 'GitHub Actions'],
    experience_level: 'mid',
    employment_type: 'full-time',
    remote_type: 'remote',
    location: 'Remote · EU',
    salary_min: 110000,
    salary_max: 140000,
  },
  {
    companyIdx: 1,
    title: 'Applied ML Researcher',
    description:
      'Push the frontier of what our LLM platform can do. Design evals, run experiments, propose + ship new fine-tuning techniques. Writing (memos + papers) is half the job.',
    requirements: ['M.Sc. or Ph.D. in CS/ML or strong equivalent', 'Published or shipped significant ML work', 'Comfortable reading + reproducing papers'],
    responsibilities: ['Design + run evals', 'Ship experiment results to the platform', 'Mentor engineers on ML fundamentals'],
    skills_required: ['Python', 'PyTorch', 'HuggingFace', 'Weights & Biases'],
    experience_level: 'senior',
    employment_type: 'full-time',
    remote_type: 'remote',
    location: 'Remote · worldwide',
    salary_min: 180000,
    salary_max: 230000,
  },
  {
    companyIdx: 1,
    title: 'Data Engineer',
    description:
      'Own the ETL + warehouse layer that powers our eval dashboards and billing. You will be the main author of our Airbyte + dbt + Snowflake stack.',
    requirements: ['3+ years of data engineering', 'Warehouse + ETL experience', 'SQL fluency'],
    responsibilities: ['Own the dbt models', 'Ship the billing pipeline', 'Monitor data freshness + quality'],
    skills_required: ['SQL', 'dbt', 'Snowflake', 'Python', 'Airbyte'],
    experience_level: 'mid',
    employment_type: 'full-time',
    remote_type: 'remote',
    location: 'Remote · worldwide',
    salary_min: 120000,
    salary_max: 160000,
  },
];

const APPLICATIONS = [
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
  // --- Jordan (candidate 0) on the three new jobs ---
  {
    candidateIdx: 0,
    jobIdx: 1, // Nimbus Full-Stack Product Engineer
    status: 'shortlisted',
    cover_letter:
      'Overqualified on paper but the role is exactly what I want to do day-to-day — ship end-to-end features, own bugs, stay in the code.',
    score: {
      overall_score: 78,
      skills_score: 80,
      experience_score: 76,
      summary:
        'Senior candidate on a mid-level posting. Strong technical match but compensation alignment may be an issue.',
      strengths: [
        'Full-stack TS + React + Node + Postgres experience — every listed skill is in recent production use.',
        'Bias-to-ship reputation from Acme (feature-a-week) matches the role brief exactly.',
      ],
      concerns: [
        'Mid-level salary band ($80-110k) may fall short of a senior candidate\'s expectations.',
        'Worth asking why stepping down a level — growth path? Location move? Burnout?',
      ],
    },
  },
  {
    candidateIdx: 0,
    jobIdx: 3, // Nimbus Backend Engineer (Go)
    status: 'reviewing',
    cover_letter:
      'Mostly TS-side at Acme but I did own a Go ingest service for two years at Beacon — happy to share code samples.',
    score: {
      overall_score: 65,
      skills_score: 58,
      experience_score: 72,
      summary:
        'Adjacent fit. Strong systems thinking and Postgres chops but limited recent Go experience.',
      strengths: [
        'Senior tenure + observability background — a natural fit for an observability backend team.',
        'Postgres depth carries over directly.',
      ],
      concerns: [
        'Go is only listed from a prior role (Beacon, 2017-2020) — skills may be rusty.',
        'No Clickhouse or high-throughput experience listed.',
      ],
    },
  },
  {
    candidateIdx: 0,
    jobIdx: 6, // Helio Data Engineer
    status: 'pending',
    cover_letter:
      'Stretch application — I have written a lot of dbt models for internal dashboards but never owned a data pipeline end-to-end.',
    score: {
      overall_score: 45,
      skills_score: 42,
      experience_score: 48,
      summary:
        'Weak fit. Frontend-leaning engineer without core data-engineering experience.',
      strengths: [
        'Postgres + SQL fluency',
        'Has touched dbt as a consumer of data models.',
      ],
      concerns: [
        'No Snowflake, Airbyte, or warehouse-scale experience listed.',
        'Career trajectory is frontend-platform, not data — significant ramp needed.',
        'Python is absent from the profile.',
      ],
    },
  },
  // --- Sam (candidate 1) — two more applications ---
  {
    candidateIdx: 1,
    jobIdx: 0, // Nimbus Senior TypeScript Engineer
    status: 'rejected',
    cover_letter:
      'I know 2 years is short for a senior role but I learn fast — willing to take on a mid-level equivalent if that is a fit.',
    score: {
      overall_score: 38,
      skills_score: 52,
      experience_score: 24,
      summary:
        'Mismatch. Junior candidate applying to an explicit 5+ year senior role.',
      strengths: [
        'React fundamentals are solid.',
      ],
      concerns: [
        'Only 2 years of total experience — 3 years short of the minimum.',
        'No Postgres or observability experience listed.',
        'No signal of the "ownership instinct" the posting asks for.',
      ],
    },
  },
  {
    candidateIdx: 1,
    jobIdx: 4, // Nimbus DevOps Engineer
    status: 'pending',
    cover_letter:
      'I have been doing some AWS side of things at Quill and want to move fully into infra — this could be the jump.',
    score: {
      overall_score: 32,
      skills_score: 18,
      experience_score: 42,
      summary:
        'Aspirational application. Frontend background without the infra foundation the role requires.',
      strengths: [
        'Stated interest in the infra side — learning curve, not plateau.',
      ],
      concerns: [
        'No Kubernetes, Terraform, or AWS experience listed on profile.',
        'No CI/CD ownership history.',
        'Would need to be hired more as a trainee than a contributor.',
      ],
    },
  },
  // --- Riley (candidate 2) on the three new jobs ---
  {
    candidateIdx: 2,
    jobIdx: 5, // Helio Applied ML Researcher
    status: 'interviewing',
    cover_letter:
      'The research side of the platform is what I most want to get back into — my M.Sc. work was on LLM eval harnesses and it maps to this role exactly.',
    score: {
      overall_score: 88,
      skills_score: 90,
      experience_score: 86,
      summary:
        'Strong match. Platform + research overlap makes this a natural next step for Riley.',
      strengths: [
        'M.Sc. with ML specialization — meets the degree requirement.',
        'PyTorch + HuggingFace experience in production.',
        'Has shipped significant ML work (10× throughput win).',
      ],
      concerns: [
        'No published papers listed — may affect the "published or shipped" requirement.',
      ],
    },
  },
  {
    candidateIdx: 2,
    jobIdx: 3, // Nimbus Backend Engineer (Go)
    status: 'reviewing',
    cover_letter:
      'I know Go from my serving layer work at Vector — not my primary language but enough to be useful on day one.',
    score: {
      overall_score: 55,
      skills_score: 50,
      experience_score: 60,
      summary:
        'Moderate fit. Senior engineer with the right systems instincts but limited production Go.',
      strengths: [
        'Senior-level systems engineering experience',
        'Has written Go in the ML serving layer.',
      ],
      concerns: [
        'Go isn\'t the primary language on the profile — Python is.',
        'No Clickhouse experience.',
        'Career trajectory is ML-platform, not product backend.',
      ],
    },
  },
  {
    candidateIdx: 2,
    jobIdx: 6, // Helio Data Engineer
    status: 'shortlisted',
    cover_letter:
      'Data platforms are adjacent to ML platforms — I have built a lot of Airflow + dbt at Vector and would enjoy owning it full-time.',
    score: {
      overall_score: 80,
      skills_score: 78,
      experience_score: 82,
      summary:
        'Good adjacent fit. ML-platform background covers most of what the data-engineering role needs.',
      strengths: [
        'Python + SQL fluency',
        'Has built ETL + feature-store pipelines (dbt-adjacent work).',
        'Postgres depth carries over directly.',
      ],
      concerns: [
        'Snowflake specifically isn\'t on profile — has used BigQuery instead.',
        'Role is a career-direction change vs. a straight-line move.',
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function findUserByEmail(email) {
  // profiles mirrors auth.users 1:1 via the handle_new_user trigger. Easier
  // than paginating auth.admin.listUsers().
  const { data, error } = await sb.from('profiles').select('id').eq('email', email).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function ensureUser({ email, password, fullName, role }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    console.log(`  ↪ ${email} already exists (id=${existing.slice(0, 8)}…) — skipped create`);
    return existing;
  }
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });
  if (error) {
    // Possible race: another run created it between check and create.
    if (/already|exists|registered/i.test(error.message)) {
      const id = await findUserByEmail(email);
      if (id) return id;
    }
    throw new Error(`createUser ${email}: ${error.message}`);
  }
  console.log(`  ✓ created ${email}`);
  return data.user.id;
}

async function ensureCompany(ownerId, spec) {
  const { data: existing } = await sb
    .from('companies')
    .select('id')
    .eq('owner_id', ownerId)
    .eq('name', spec.name)
    .maybeSingle();
  if (existing) {
    console.log(`  ↪ company ${spec.name} already exists`);
    return existing.id;
  }
  const { data, error } = await sb
    .from('companies')
    .insert({
      owner_id: ownerId,
      name: spec.name,
      description: spec.description,
      website: spec.website,
      industry: spec.industry,
      size: spec.size,
    })
    .select('id')
    .single();
  if (error) throw error;
  console.log(`  ✓ created company ${spec.name}`);
  return data.id;
}

async function ensureJob(companyId, employerId, spec) {
  const { data: existing } = await sb
    .from('jobs')
    .select('id')
    .eq('company_id', companyId)
    .eq('title', spec.title)
    .maybeSingle();
  if (existing) {
    console.log(`  ↪ job "${spec.title}" already exists`);
    return existing.id;
  }
  const { data, error } = await sb
    .from('jobs')
    .insert({
      company_id: companyId,
      employer_id: employerId,
      title: spec.title,
      description: spec.description,
      requirements: spec.requirements,
      responsibilities: spec.responsibilities,
      skills_required: spec.skills_required,
      experience_level: spec.experience_level,
      employment_type: spec.employment_type,
      remote_type: spec.remote_type,
      location: spec.location,
      salary_min: spec.salary_min,
      salary_max: spec.salary_max,
      salary_currency: 'USD',
      salary_period: 'year',
      show_salary: true,
      status: 'active',
      published_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (error) throw error;
  console.log(`  ✓ created job "${spec.title}"`);
  return data.id;
}

async function ensureCandidateProfile(candidateId, profile) {
  // The trigger creates the row on signup. UPSERT lets us also handle the
  // case where the row is missing (older accounts / RLS edge cases).
  const { error } = await sb
    .from('candidate_profiles')
    .upsert({ id: candidateId, ...profile }, { onConflict: 'id' });
  if (error) throw error;
  console.log(`  ✓ candidate profile filled for ${candidateId.slice(0, 8)}…`);
}

async function ensureApplication(jobId, candidateId, spec) {
  const { data: existing } = await sb
    .from('applications')
    .select('id, status')
    .eq('job_id', jobId)
    .eq('candidate_id', candidateId)
    .maybeSingle();
  if (existing) {
    // Sync status if it drifted so reviewers see the intended demo state.
    if (existing.status !== spec.status) {
      await sb.from('applications').update({ status: spec.status }).eq('id', existing.id);
      console.log(`  ~ application ${existing.id.slice(0, 8)}… status → ${spec.status}`);
    } else {
      console.log(`  ↪ application already exists (${spec.status})`);
    }
    return existing.id;
  }
  const { data, error } = await sb
    .from('applications')
    .insert({
      job_id: jobId,
      candidate_id: candidateId,
      cover_letter: spec.cover_letter,
      status: spec.status,
    })
    .select('id')
    .single();
  if (error) throw error;
  console.log(`  ✓ created application (${spec.status})`);
  return data.id;
}

async function ensureMatchScore(candidateId, jobId, score) {
  const { error } = await sb.from('match_scores').upsert(
    {
      candidate_id: candidateId,
      job_id: jobId,
      overall_score: score.overall_score,
      skills_score: score.skills_score,
      experience_score: score.experience_score,
      summary: score.summary,
      strengths: score.strengths,
      concerns: score.concerns,
      model_used: 'seed-precomputed',
    },
    { onConflict: 'candidate_id,job_id' },
  );
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Seeding test data into ${url}\n`);

  console.log('==> employers');
  const employers = [];
  for (const e of EMPLOYERS) {
    employers.push(await ensureUser({ ...e, role: 'employer' }));
  }

  console.log('\n==> candidates');
  const candidates = [];
  for (const c of CANDIDATES) {
    candidates.push(await ensureUser({ email: c.email, password: c.password, fullName: c.fullName, role: 'candidate' }));
  }

  console.log('\n==> companies');
  const companies = [];
  for (const c of COMPANIES) {
    companies.push(await ensureCompany(employers[c.ownerIdx], c));
  }

  console.log('\n==> jobs');
  const jobs = [];
  for (const j of JOBS) {
    jobs.push(await ensureJob(companies[j.companyIdx], employers[COMPANIES[j.companyIdx].ownerIdx], j));
  }

  console.log('\n==> candidate profiles');
  for (let i = 0; i < CANDIDATES.length; i += 1) {
    await ensureCandidateProfile(candidates[i], CANDIDATES[i].profile);
  }

  console.log('\n==> applications');
  for (const a of APPLICATIONS) {
    await ensureApplication(jobs[a.jobIdx], candidates[a.candidateIdx], a);
  }

  console.log('\n==> match_scores');
  for (const a of APPLICATIONS) {
    await ensureMatchScore(candidates[a.candidateIdx], jobs[a.jobIdx], a.score);
  }

  console.log('\n=============================================');
  console.log('Done. Sign in with:');
  console.log('=============================================');
  console.log('\nEmployers:');
  for (const e of EMPLOYERS) console.log(`  ${e.email.padEnd(32)} / ${e.password}`);
  console.log('\nCandidates:');
  for (const c of CANDIDATES) console.log(`  ${c.email.padEnd(32)} / ${c.password}`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message ?? err);
  process.exit(1);
});

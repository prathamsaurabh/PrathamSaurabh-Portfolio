// Wording copied from the resume PDF. Each card links to the project.
const projects = [
  {
    name: 'Aegis',
    sub: 'Hackalytics - Databricks United Nations Track',
    href: 'https://aegis-a5qe.vercel.app/',
    linkLabel: 'Live site',
    points: [
      'Developed a predictive AI platform to identify emerging global humanitarian crises and quantify precise underfunding levels',
      'Architected an automated NLP pipeline to extract financial funding gaps and sectoral metrics from global news (Scikit-learn)',
      'Engineered an interactive 3D geospatial sphere model of the globe allowing users to click countries for real-time crisis data.',
    ],
  },
  {
    name: 'Authenticator.ai',
    sub: 'Georgia Tech CREATE-X',
    href: 'https://github.com/gdawerty/Authenticator.ai',
    linkLabel: 'GitHub',
    points: [
      'Built an AI-powered document intelligence platform to analyze fraud-related workflows across insurance, fintech, and banking',
      'Raised $5K in seed funding through Georgia Tech CREATE-X and advanced development through the accelerator program',
      'Led customer discovery and client outreach across insurance and financial services, translating feedback into product strategy',
    ],
  },
  {
    name: 'GeNN CI/CD Workflow Integration',
    sub: 'INCF/GSOC 2025 - CI/CD Actions',
    href: 'https://github.com/prathamsaurabh/genn/actions',
    linkLabel: 'GitHub Actions',
    points: [
      'Built CI/CD pipelines for GPU simulations, validating model performance metrics and automating statistical testing',
      'Designed experiments to validate ML workflows, analyzing performance metrics and ensuring reliable deployment pipelines',
      'Validated workflows on Ubuntu runners, debugging cross-platform jobs to ensure scalable, secure, and reliable deployments',
    ],
  },
];

export default function ProjectsPage() {
  return (
    <section className="subpage">
      <h2 className="label">Projects</h2>
      <div className="projects">
        {projects.map((p, i) => (
          <a
            className="project card reveal"
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noreferrer"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <span className="idx">{String(i + 1).padStart(2, '0')}</span>
            <h4>{p.name}</h4>
            <p className="project-sub">{p.sub}</p>
            <ul>
              {p.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            <span className="project-link">
              {p.linkLabel} <span aria-hidden="true">↗</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

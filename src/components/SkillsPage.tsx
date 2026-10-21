// Wording copied from the resume PDF (Education + Additional sections).
const groups = [
  {
    title: 'Languages',
    items: ['Python (NumPy, Pandas)', 'Java', 'JavaScript/TypeScript', 'C++', 'Go', 'Rust', 'Kotlin', 'SQL', 'C', 'HTML', 'CSS', 'Angular'],
  },
  {
    title: 'Software',
    items: ['PyTorch', 'JAX', 'PostgreSQL', 'TensorFlow', 'Scikit-learn', 'Docker', 'Git', 'AWS (EC2, S3)', 'Figma', 'Postman', 'Kubernetes'],
  },
  {
    title: 'Relevant Coursework',
    items: [
      'Computer Architecture',
      'Data Structures',
      'Algorithms',
      'Embedded Systems',
      'Systems Reliability',
      'Hardware/Software Integration',
      'Linear Algebra',
      'Statistical Inferences',
      'Machine and Deep Learning',
      'Communication Skills',
    ],
  },
  {
    title: 'Spoken Languages',
    items: ['English (Fluent)', 'Hindi (Proficient in Speaking)', 'Spanish (Intermediate in Speaking)'],
  },
  {
    title: 'Security Clearance',
    items: ['Interim Secret (Debriefed)'],
  },
];

export default function SkillsPage() {
  return (
    <section className="subpage">
      <h2 className="label">Skills</h2>
      <div className="skill-groups">
        {groups.map((g, i) => (
          <div className="skill-group reveal" key={g.title} style={{ transitionDelay: `${i * 60}ms` }}>
            <h3>
              <span>{String(i + 1).padStart(2, '0')}</span> {g.title}
            </h3>
            <ul className="chips">
              {g.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

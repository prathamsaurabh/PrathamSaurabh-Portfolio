import { lazy, Suspense, useEffect, useRef, useState, type MouseEvent } from 'react';
import { scene } from './sceneStore';
import ResumePage from './components/ResumePage';
import Exploring from './components/Exploring';
import SkillsPage from './components/SkillsPage';
import ProjectsPage from './components/ProjectsPage';

const Terrain = lazy(() => import('./components/Terrain'));

const WELCOME_MS = 2600;

const interests = [
  { title: 'Artificial Intelligence', text: 'Applied machine learning, from research code in PyTorch to tools people actually use.' },
  { title: 'Cybersecurity', text: 'Finding the weak spots in software and making systems that hold up under pressure.' },
  { title: 'Embedded Systems', text: 'Low-level code close to the hardware, like FPGA updates for satellites.' },
  { title: 'Infrastructure', text: 'Reliable, fault-tolerant systems that recover on their own.' },
];

const hobbies = [
  { title: 'Hiking', text: 'Getting outside and finding a good trail with a view at the end.' },
  { title: 'Pickleball', text: 'Fast rallies, friendly competition, and always up for a game.' },
  { title: 'Watching Sports', text: 'Following the big games and cheering on my teams.' },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(q.matches);
    q.addEventListener('change', update);
    return () => q.removeEventListener('change', update);
  }, []);
  return reduced;
}

export default function App() {
  const reduced = useReducedMotion();
  const [path, setPath] = useState(() => location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const onResume = path.startsWith('/resume');
  const onExploring = path.startsWith('/exploring');
  const onSkills = path.startsWith('/skills');
  const onProjects = path.startsWith('/projects');
  const onSubpage = onResume || onExploring || onSkills || onProjects;
  // Only play the welcome intro when someone lands on the home page
  const [stage, setStage] = useState<'welcome' | 'main'>(reduced || onSubpage ? 'main' : 'welcome');
  const rootRef = useRef<HTMLDivElement>(null);

  // Client-side page switching, so the wireframe keeps running between pages
  const navigate = (to: string) => (e: MouseEvent) => {
    e.preventDefault();
    const [nextPath, hash] = to.split('#');
    if (nextPath !== location.pathname) history.pushState(null, '', nextPath);
    setPath(nextPath);
    setMenuOpen(false);
    requestAnimationFrame(() => {
      const el = hash ? document.getElementById(hash) : null;
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0 });
    });
  };
  useEffect(() => {
    const onPop = () => setPath(location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Mobile menu: stop the page scrolling behind it, close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.classList.add('locked');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('locked');
    };
  }, [menuOpen]);

  // Welcome screen: hold, then pan. Any scroll / click / key skips ahead.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    if (stage === 'main') {
      scene.panStart ??= performance.now();
      document.body.classList.remove('locked');
      return;
    }
    document.body.classList.add('locked');
    const go = () => setStage('main');
    const timer = window.setTimeout(go, WELCOME_MS);
    const skip = () => go();
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [stage]);

  // Feed scroll position to the 3D scene
  useEffect(() => {
    const onScroll = () => (scene.scroll = window.scrollY / window.innerHeight);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reveal cards as they scroll into view
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.reveal') ?? [];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.1 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);

  return (
    <div ref={rootRef} className={`app stage-${stage}`}>
      <Suspense fallback={null}>
        <Terrain still={reduced} />
      </Suspense>
      <div className="shade" aria-hidden="true" />

      <div className="welcome" aria-hidden={stage !== 'welcome'}>
        <h1 className="welcome-word">
          {'Welcome!'.split('').map((ch, i) => (
            <span key={i} style={{ animationDelay: `${0.15 + i * 0.06}s` }}>
              {ch}
            </span>
          ))}
        </h1>
      </div>

      <header className={`topbar${menuOpen ? ' menu-open' : ''}`}>
        <a href="/" className="mark" onClick={navigate('/')}>PS</a>
        {/* Menu button only shows on smaller screens */}
        <button
          type="button"
          className="menu-btn"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
        <nav id="site-nav">
          <a href="/" className={!onSubpage ? 'active' : ''} onClick={navigate('/')}>Home</a>
          <a href="/#interests" onClick={navigate('/#interests')}>Interests</a>
          <a href="/skills" className={onSkills ? 'active' : ''} onClick={navigate('/skills')}>Skills</a>
          <a href="/projects" className={onProjects ? 'active' : ''} onClick={navigate('/projects')}>Projects</a>
          <a href="/exploring" className={onExploring ? 'active' : ''} onClick={navigate('/exploring')}>Exploring</a>
          <a href="/resume" className={onResume ? 'active' : ''} onClick={navigate('/resume')}>Resume</a>
          <a href="https://github.com/prathamsaurabh" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/pratham-saurabh" target="_blank" rel="noreferrer">LinkedIn</a>
        </nav>
      </header>

      <main>
        {onResume ? (
          <ResumePage />
        ) : onSkills ? (
          <SkillsPage />
        ) : onProjects ? (
          <ProjectsPage />
        ) : onExploring ? (
          <Exploring />
        ) : (
          <>
        <section className="hero" id="top">
          <div className="hero-inner">
            <p className="kicker">
              <span className="dot" /> CS @ Georgia Tech
            </p>
            <h2 className="name">
              Pratham
              <br />
              Saurabh
            </h2>
            <p className="blurb">
              Computer Science student at Georgia Tech focused on AI and cybersecurity. I like working across low-level
              systems, machine learning, and software people use.
            </p>
          </div>
        </section>

        <section className="interests" id="interests">
          <div className="block">
            <h3 className="label">
              <span>01</span> Interests
            </h3>
            <div className="grid">
              {interests.map((item, i) => (
                <article className="card reveal" key={item.title} style={{ transitionDelay: `${i * 80}ms` }}>
                  <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="block">
            <h3 className="label">
              <span>02</span> Hobbies
            </h3>
            <div className="grid">
              {hobbies.map((item, i) => (
                <article className="card reveal" key={item.title} style={{ transitionDelay: `${i * 80}ms` }}>
                  <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
}

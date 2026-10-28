import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import './index.scss';
import ItọñImg from '../../assets/images/Itọñ.webp';
import FamilarPaths from '../../assets/images/familar_paths.webp';
import EyesPhoto from '../../assets/images/eyes_photo.jpeg';
import { subscribeJournalPosts } from '../../lib/journalStore';

const projects = [
  {
    title: 'Familiar Paths',
    category: 'Short film',
    date: 'FILM / SHORT',
    image: FamilarPaths,
    description:
      'A poetic short film about the choices we make and the trails we follow. Are our paths predetermined, shaped by others—like the trails of ants—or are they truly our own? “Familiar Paths” invites you to reflect on authenticity, agency, and the journey toward self-discovery. This was shot, filmed, and edited in a day.',
    link: 'https://www.youtube.com/watch?v=-3LvJ6YL6cw',
    action: 'Watch film',
  },
  {
    title: 'Itọñ — Film Pitch',
    category: 'Script / Pitch',
    date: 'WRITING / SCI-FI',
    image: ItọñImg,
    description:
      'An Afrofuturist experimental sci-fi short where ancestral memory defies digital control. In a world run by the Unified Optimization Authority, Hadassah—a young Ibibio woman—awakens to her heritage, challenging algorithmic conformity and sparking an ancestral awakening.',
    link: 'https://docs.google.com/document/d/10u4ll58XQv5pvIQ_1pmTOXfvxK1jQk_6aj1e9nh59aE/edit?usp=sharing',
    action: 'Read pitch',
  },
];

const slugifyProject = (value) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export { projects as filmProjects };

const portraitOutline = [[0, 7], [4, 0], [96, 0], [100, 7], [100, 90], [96, 100], [0, 100]];
const MAX_GLASS_FRAGMENTS = 24;
const cross = (a, b) => a.x * b.y - a.y * b.x;
const randomBetween = (min, max) => min + Math.random() * (max - min);

const splitPolygonAt = (polygon, point) => {
  const angle = randomBetween(-Math.PI * .85, Math.PI * .85);
  const direction = { x: Math.cos(angle), y: Math.sin(angle) };
  const sides = [[], []];
  const intersections = [];
  const sideOf = (value) => cross(direction, { x: value.x - point.x, y: value.y - point.y });

  polygon.forEach((start, index) => {
    const end = polygon[(index + 1) % polygon.length];
    const startSide = sideOf(start);
    const endSide = sideOf(end);
    if (startSide >= 0) sides[0].push(start);
    if (startSide <= 0) sides[1].push(start);
    if ((startSide < 0 && endSide > 0) || (startSide > 0 && endSide < 0)) {
      const amount = startSide / (startSide - endSide);
      const intersection = {
        x: start.x + (end.x - start.x) * amount,
        y: start.y + (end.y - start.y) * amount,
      };
      sides[0].push(intersection);
      sides[1].push(intersection);
      intersections.push(intersection);
    }
  });

  if (intersections.length < 2 || sides.some((side) => side.length < 3)) return null;
  const toPercent = (side) => side.map(({ x, y }) => ({ x: x / 100, y: y / 100 }));
  return {
    polygons: sides.map(toPercent),
    crack: { d: `M ${intersections[0].x} ${intersections[0].y} L ${intersections[1].x} ${intersections[1].y}` },
  };
};

const pointInPolygon = (point, polygon) => polygon.reduce((inside, current, index) => {
  const previous = polygon[(index + polygon.length - 1) % polygon.length];
  const crosses = ((current.y > point.y) !== (previous.y > point.y)) &&
    (point.x < (previous.x - current.x) * (point.y - current.y) / (previous.y - current.y) + current.x);
  return crosses ? !inside : inside;
}, false);

const createGlassBurst = (event, bounds) => {
  const center = {
    x: Math.min(bounds.width * .92, Math.max(bounds.width * .08, event.clientX - bounds.left)),
    y: Math.min(bounds.height * .92, Math.max(bounds.height * .08, event.clientY - bounds.top)),
  };
  const outline = portraitOutline.map(([x, y]) => ({ x: x * bounds.width / 100, y: y * bounds.height / 100 }));
  const rayCount = 7;
  const rotation = Math.random() * Math.PI * 2;
  const angles = Array.from({ length: rayCount }, (_, index) =>
    (rotation + index * Math.PI * 2 / rayCount + randomBetween(-.12, .12) + Math.PI * 2) % (Math.PI * 2)
  ).sort((a, b) => a - b);
  const points = angles.map((angle) => {
    const direction = { x: Math.cos(angle), y: Math.sin(angle) };
    let nearest = Infinity;

    outline.forEach((start, index) => {
      const end = outline[(index + 1) % outline.length];
      const edge = { x: end.x - start.x, y: end.y - start.y };
      const offset = { x: start.x - center.x, y: start.y - center.y };
      const denominator = cross(direction, edge);
      if (Math.abs(denominator) < 0.0001) return;
      const distance = cross(offset, edge) / denominator;
      const edgePosition = cross(offset, direction) / denominator;
      if (distance >= 0 && edgePosition >= 0 && edgePosition <= 1) nearest = Math.min(nearest, distance);
    });

    const distance = Number.isFinite(nearest) ? nearest : Math.max(bounds.width, bounds.height);
    return {
      x: center.x + direction.x * distance,
      y: center.y + direction.y * distance,
    };
  });

  const cracks = points.map((point) => ({
    d: `M ${(center.x / bounds.width) * 100} ${(center.y / bounds.height) * 100} L ${(point.x / bounds.width) * 100} ${(point.y / bounds.height) * 100}`,
  }));
  const speedLines = Array.from({ length: 10 }, () => {
    const angle = randomBetween(0, Math.PI * 2);
    const startDistance = randomBetween(12, 35);
    const length = randomBetween(48, 120);
    const pointAt = (distance) => ({
      x: ((center.x + Math.cos(angle) * distance) / bounds.width) * 100,
      y: ((center.y + Math.sin(angle) * distance) / bounds.height) * 100,
    });
    return {
      start: pointAt(startDistance),
      end: pointAt(startDistance + length),
      color: ['#F2E8D0', '#C90D17', '#4885E2'][Math.floor(Math.random() * 3)],
      width: randomBetween(1.2, 3.2),
    };
  });

  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, cracks, speedLines };
};

const categories = ['All', 'Short film', 'Film review', 'Character / scene analysis', 'Film pitch', 'Academic essay', 'Media diary'];

const formatDate = (date) => {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const FilmProjects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [journalPosts, setJournalPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [glassCracks, setGlassCracks] = useState([]);
  const [glassFragments, setGlassFragments] = useState([]);
  const [comicBurst, setComicBurst] = useState(null);
  const burstTimerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => () => window.clearTimeout(burstTimerRef.current), []);
  useEffect(() => subscribeJournalPosts(setJournalPosts), []);

  const handleEyesClick = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const burst = createGlassBurst(event, bounds);
    const clickPoint = {
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    };
    const pieces = glassFragments.length > 0
      ? glassFragments
      : [{ id: 'whole', polygon: portraitOutline.map(([x, y]) => ({ x: x / 100, y: y / 100 })) }];
    let targetIndex = pieces.findIndex(({ polygon, offset = { x: 0, y: 0 } }) => pointInPolygon({
      x: clickPoint.x - offset.x,
      y: clickPoint.y - offset.y,
    }, polygon));
    if (targetIndex < 0) targetIndex = pieces.reduce((bestIndex, piece, index) => {
      const center = piece.polygon.reduce((sum, vertex) => ({ x: sum.x + vertex.x / piece.polygon.length, y: sum.y + vertex.y / piece.polygon.length }), { x: 0, y: 0 });
      const best = pieces[bestIndex].polygon.reduce((sum, vertex) => ({ x: sum.x + vertex.x / pieces[bestIndex].polygon.length, y: sum.y + vertex.y / pieces[bestIndex].polygon.length }), { x: 0, y: 0 });
      return Math.hypot(center.x - clickPoint.x, center.y - clickPoint.y) < Math.hypot(best.x - clickPoint.x, best.y - clickPoint.y) ? index : bestIndex;
    }, 0);
    const selected = pieces[targetIndex];
    const split = splitPolygonAt(selected.polygon.map(({ x, y }) => ({ x: x * 100, y: y * 100 })), { x: clickPoint.x * 100, y: clickPoint.y * 100 });
    if (split && pieces.length < MAX_GLASS_FRAGMENTS) {
      const fragmentId = burst.id;
      const next = [...pieces.slice(0, targetIndex), ...split.polygons.map((polygon, index) => {
        const center = polygon.reduce((sum, vertex) => ({
          x: sum.x + vertex.x / polygon.length,
          y: sum.y + vertex.y / polygon.length,
        }), { x: 0, y: 0 });
        const dx = center.x - clickPoint.x;
        const dy = center.y - clickPoint.y;
        const distance = Math.hypot(dx, dy) || 1;
        const separation = 0.009 + Math.random() * 0.009;
        const previousOffset = selected.offset || { x: 0, y: 0 };
        return {
          id: `${fragmentId}-${index}`,
          polygon,
          offset: {
            x: previousOffset.x + dx / distance * separation,
            y: previousOffset.y + dy / distance * separation,
          },
        };
      }), ...pieces.slice(targetIndex + 1)];
      setGlassFragments(next);
      setGlassCracks((current) => [...current, { ...split.crack, id: fragmentId }].slice(-MAX_GLASS_FRAGMENTS));
    }
    setComicBurst(burst);
    window.clearTimeout(burstTimerRef.current);
    burstTimerRef.current = window.setTimeout(() => {
      setComicBurst((current) => current?.id === burst.id ? null : current);
      setGlassCracks((current) => current.filter((crack) => crack.id !== burst.id));
    }, prefersReducedMotion ? 180 : 480);
  };

  useLayoutEffect(() => {
    // React Router keeps the previous scroll position on client-side navigation.
    // Reset both possible scrolling surfaces when entering the archive page.
    if (!location.hash) {
      window.scrollTo(0, 0);
      document.querySelector('.film-projects-bg')?.scrollTo(0, 0);
      return;
    }

    const targetId = location.hash.slice(1);
    if (targetId.startsWith('project-')) {
      window.scrollTo(0, 0);
      return;
    }
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: targetId === 'archive' ? 'start' : 'center',
      });
    });
  }, [location.hash]);

  const filteredArchiveItems = useMemo(() => {
    const archiveItems = [
      ...projects.map((project, index) => ({ ...project, id: `project-${index}`, kind: 'project' })),
      ...journalPosts.map((post) => ({ ...post, kind: 'post' })),
    ];
    const query = searchTerm.trim().toLowerCase();
    return archiveItems.filter((item) => {
      const itemCategory = String(item.category || '').toLowerCase();
      const selectedCategory = activeCategory.toLowerCase();
      const categoryMatches = activeCategory === 'All' || itemCategory === selectedCategory ||
        (activeCategory === 'Short film' && /short[\s-]*film/i.test(itemCategory)) ||
        (activeCategory === 'Film pitch' && /film\s*pitch|script\s*\/?\s*pitch/i.test(itemCategory)) ||
        (activeCategory === 'Academic essay' && /academic\s*essay|essay/i.test(itemCategory));
      const textMatches =
        !query ||
        [item.title, item.category, item.excerpt, item.description]
          .some((value) => String(value || '').toLowerCase().includes(query));
      return categoryMatches && textMatches;
    });
  }, [journalPosts, activeCategory, searchTerm]);

  const handleCardClick = (project) => {
    if (project.link) window.open(project.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="film-projects-bg">
      <button className="film-back-home" onClick={() => navigate('/')} aria-label="Back to home">
        <span className="home-button-symbol" aria-hidden="true">◎︎</span>
        <span className="home-button-label">RETURN TO HOME</span>
        <span className="home-button-arrow" aria-hidden="true">↖</span>
      </button>

      <section className="archive-hero" id="archive-top" aria-labelledby="archive-title">
        <div className="hero-art">
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
          <div className="hero-sigil" aria-hidden="true">✳︎</div>
          <div className="hero-scanline" aria-hidden="true" />
          <div className="hero-portrait-frame">
            <motion.button
              className={`hero-glass-panel${glassFragments.length ? ' hero-glass-panel--split' : ''}`}
              type="button"
              onClick={handleEyesClick}
              aria-label="Split another piece of the eyes artwork"
              whileTap={{ scale: .99 }}
            >
              {!glassFragments.length && <img className="hero-portrait-image" src={EyesPhoto} alt="" fetchPriority="high" />}
            </motion.button>

            {glassFragments.map((fragment) => (
              <div className="hero-glass-shard" key={fragment.id} style={{
                clipPath: `polygon(${fragment.polygon.map(({ x, y }) => `${x * 100}% ${y * 100}%`).join(', ')})`,
                transform: `translate(${(fragment.offset?.x || 0) * 100}%, ${(fragment.offset?.y || 0) * 100}%)`,
              }} aria-hidden="true">
                <img src={EyesPhoto} alt="" />
              </div>
            ))}

            {glassFragments.length > 0 && (
              <svg className="hero-glass-fragment-outlines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {glassFragments.map((fragment) => (
                  <polygon
                    key={`${fragment.id}-outline`}
                    points={fragment.polygon.map(({ x, y }) => `${x * 100},${y * 100}`).join(' ')}
                    transform={`translate(${(fragment.offset?.x || 0) * 100} ${(fragment.offset?.y || 0) * 100})`}
                  />
                ))}
              </svg>
            )}

            {glassCracks.length > 0 && (
              <svg className="hero-glass-cracks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {glassCracks.map((crack) => (
                  <motion.path
                    key={crack.id}
                    d={crack.d}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: prefersReducedMotion ? .08 : .3, ease: 'easeOut' }}
                  />
                ))}
              </svg>
            )}

            {comicBurst && (
              <motion.svg
                className="hero-comic-streaks"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                initial={{ opacity: 0, scale: .94 }}
                animate={{ opacity: [0, 1, 0], scale: [.94, 1.04, 1.08] }}
                transition={{ duration: prefersReducedMotion ? .16 : .46, ease: 'easeOut' }}
                aria-hidden="true"
              >
                {comicBurst.speedLines.map((line, index) => (
                  <line
                    key={`${comicBurst.id}-streak-${index}`}
                    x1={line.start.x}
                    y1={line.start.y}
                    x2={line.end.x}
                    y2={line.end.y}
                    stroke={line.color}
                    strokeWidth={line.width}
                    strokeLinecap="round"
                  />
                ))}
              </motion.svg>
            )}
          </div>
          <div className="hero-planet" aria-hidden="true" />
        </div>
        <div className="archive-hero-copy">
          <p className="archive-eyebrow">FILM / WRITING / LIFE / EXPERIMENTS</p>
          <h1 id="archive-title">nonsense<span>&amp;</span><br />ingredients</h1>
          <p className="archive-hero-description">
            Art is an archive.<span className="archive-description-star" aria-hidden="true"> ✳︎</span><br />Work in progress. Always.
          </p>
          <p className="archive-handwritten">same girl.<br />new stories.</p>
        </div>
        <div className="hero-side-label">N&amp;I — PERSONAL ARCHIVE — VOL. 01</div>
        <a className="archive-scroll-cue" href="#archive">Scroll to the archive <span aria-hidden="true">↓</span></a>
      </section>

      <section className="archive-projects film-journal" id="archive" aria-labelledby="archive-title">
        <div className="archive-section-heading film-journal-heading">
          <div>
            <h2 id="archive-title">The Archive<span className="red-star"> ✳</span></h2>
            <p>Film projects and notes from the archive, collected together.</p>
          </div>
          <span className="journal-volume">PERSONAL FILES<br />N&amp;I — 001—∞</span>
        </div>

        <div className="journal-toolbar" aria-label="Filter the archive">
          <div className="journal-filters" role="group" aria-label="Filter posts by category">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={activeCategory === category ? 'active' : ''}
                onClick={() => setActiveCategory(category)}
              >
                {category}<span aria-hidden="true"> ·</span>
              </button>
            ))}
          </div>
          <label className="journal-search">
            <span className="sr-only">Search posts</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="SEARCH ARCHIVE..."
            />
            <span aria-hidden="true">⌕</span>
          </label>
        </div>

        {filteredArchiveItems.length ? (
          <div className="film-projects-grid film-journal-grid">
            {filteredArchiveItems.map((item, idx) => item.kind === 'project' ? (
              <article id={`project-${slugifyProject(item.title)}`} className={`film-project-card film-project-card-size-${idx % 4}${idx === 0 ? ' film-project-card-featured' : ''}`} key={item.id}>
                <button className="film-project-card-action" type="button" onClick={() => handleCardClick(item)} disabled={!item.link} aria-label={`${item.action || 'More coming soon'}: ${item.title}`}>
                  <span className="film-project-image-wrap">
                    <img src={item.image} alt="" loading="lazy" decoding="async" className={`film-project-img${item.title.startsWith('Itọñ') ? ' iton-img' : ''}`} />
                    <span className="film-image-index">N&amp;I / {String(idx + 1).padStart(2, '0')}</span><span className="film-image-cross" aria-hidden="true">✳︎</span>
                  </span>
                  <span className="film-project-copy">
                    <span className="film-project-meta"><span>{item.category}</span><span>{item.link ? '↗ OPEN PROJECT' : 'IN PROGRESS'}</span></span>
                    <span className="film-project-title">{item.title}<span className="title-star"> ✳︎</span></span>
                    <span className="film-project-desc">{item.description}</span>
                    <span className="film-project-read">{item.action || 'More soon'} <span aria-hidden="true">→</span></span>
                  </span>
                </button>
              </article>
            ) : (
              <Link className={`film-journal-card journal-card-size-${idx % 5}`} to={`/film-projects/${item.slug}`} key={item.id}>
                <div className="film-journal-card-image-wrap">
                  {item.cover ? <img src={item.cover} alt="" loading="lazy" decoding="async" /> : <div className="journal-cover-type" aria-hidden="true"><span>N&amp;I / FILE {String(idx + 1).padStart(2, '0')}</span><strong>{item.title}</strong><i>✳︎</i></div>}
                  <span className="film-journal-card-arrow" aria-hidden="true">↗</span>
                </div>
                <div className="film-journal-card-copy">
                  <div className="film-journal-card-meta"><span>{item.category || 'UNCATEGORIZED'}</span><span>{formatDate(item.date)}</span></div>
                  <h3>{item.title}<span className="title-star"> ✳︎</span></h3>
                  <p>{item.excerpt}</p>
                  <span className="film-journal-read">Read the story <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="film-journal-empty">
            <span className="section-kicker">NO FILES FOUND</span>
            <p>Nothing in this category matches your search.</p>
            {(activeCategory !== 'All' || searchTerm) && (
              <button type="button" onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}>Reset filters ↗</button>
            )}
          </div>
        )}
      </section>

      <footer className="archive-footer">
        <div className="footer-scroll-note"><span>SCROLL</span> / DISCOVER / KEEP READING <i /></div>
        <div className="footer-wave" aria-hidden="true">✳ ▏▎▍▅▃▆▂▅▇▃▅▂▆▃▅▇▂▃▅▆▂▅▃▇▂▆▅▃</div>
        <div className="footer-bottom">
          <p>same girl.<br />new stories.</p>
          <span className="footer-symbol" aria-hidden="true">◎︎</span>
          <p className="footer-credit">FILM / WRITING<br />NONSENSE&amp;INGREDIENTS © 2026</p>
        </div>
      </footer>

    </main>
  );
};

export default FilmProjects;

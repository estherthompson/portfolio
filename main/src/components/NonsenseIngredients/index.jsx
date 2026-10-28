import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { subscribeJournalPosts } from '../../lib/journalStore';
import './index.scss';

function renderInlineText(text = '') {
  const visibleIndentation = text.replace(/(^|\n)([ \t\u00a0]+)/g, (_, lineStart, indentation) => (
    `${lineStart}${indentation.replace(/\t/g, '    ').replace(/ /g, '\u00a0')}`
  ));
  return visibleIndentation.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function youtubeEmbedUrl(value = '') {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, '');
    let videoId = '';
    if (host === 'youtu.be') videoId = url.pathname.slice(1).split('/')[0];
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      videoId = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] || '';
    }
    return /^[\w-]{11}$/.test(videoId) ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
}

function StoryBlock({ block }) {
  if (block.type === 'heading') return <h2>{renderInlineText(block.text)}</h2>;
  if (block.type === 'quote') return <blockquote>{renderInlineText(block.text)}</blockquote>;
  if (block.type === 'list') return <ul>{(block.text || '').split('\n').map((item) => item.trim()).filter(Boolean).map((item, index) => <li key={index}>{renderInlineText(item.replace(/^[-*]\s+/, ''))}</li>)}</ul>;
  if (block.type === 'image') return <figure><img src={block.image} alt={block.alt || ''} /></figure>;
  if (block.type === 'video') return <figure><video controls preload="metadata" src={block.url}>Your browser does not support video playback.</video></figure>;
  if (block.type === 'youtube') return youtubeEmbedUrl(block.url) ? <figure className="ni-video-embed"><iframe src={youtubeEmbedUrl(block.url)} title={block.title || 'YouTube video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></figure> : null;
  if (block.type === 'pdf') return <figure className="ni-pdf-embed"><iframe src={block.url} title={block.title || 'PDF document'} /><a href={block.url} target="_blank" rel="noreferrer">Open PDF in a new tab</a></figure>;
  return <p>{renderInlineText(block.text)}</p>;
}

export default function NonsenseIngredients() {
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [postsReady, setPostsReady] = useState(false);

  useEffect(() => subscribeJournalPosts((nextPosts) => {
    setPosts(nextPosts);
    setPostsReady(true);
  }, () => setPostsReady(true)), []);

  const article = posts.find((post) => post.slug === slug);

  if (!slug) return <Navigate to="/film-projects" replace />;
  if (!postsReady) return <main className="ni-page ni-missing"><section><p className="ni-eyebrow">OPENING THE ARCHIVE</p><h1>One moment…</h1></section></main>;
  if (!article) {
    return <main className="ni-page ni-missing"><Link to="/film-projects" className="ni-wordmark">nonsense<span>&</span>ingredients</Link><section><p className="ni-eyebrow">THAT PAGE ISN’T HERE</p><h1>Story not found.</h1><p>It may have been removed, or this link may be out of date.</p><Link className="ni-back-link" to="/film-projects">← Back to Film Projects</Link></section></main>;
  }

  return (
    <main className="ni-page ni-article-page">
      <header className="ni-masthead"><Link to="/film-projects" className="ni-wordmark">nonsense<span>&</span>ingredients</Link><Link className="ni-back-link" to="/film-projects">← All stories</Link></header>
      <article className="ni-article">
        <div className="ni-article-heading"><span className="ni-eyebrow">{article.category} · {Math.max(1, Math.ceil((article.blocks || []).reduce((total, block) => total + (block.text || '').split(/\s+/).filter(Boolean).length, 0) / 220))} MIN READ</span><h1>{article.title}</h1><p className="ni-article-deck">{article.excerpt}</p><div className="ni-byline">By {article.author} <span>·</span> {new Date(article.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
        <img className="ni-article-cover" src={article.cover} alt={article.coverAlt || ''} />
        <div className="ni-prose">{(article.blocks || []).map((block) => <StoryBlock key={block.id} block={block} />)}</div>
        <Link className="ni-back-link ni-bottom-back" to="/film-projects">← Back to Film Projects</Link>
      </article>
      <footer className="ni-footer"><span>© Nonsense & Ingredients</span><span>A personal publication by Esther Thompson</span></footer>
    </main>
  );
}

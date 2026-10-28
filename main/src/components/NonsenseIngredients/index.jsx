import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { subscribeJournalPosts } from '../../lib/journalStore';
import './index.scss';

function renderInlineText(text = '') {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function StoryBlock({ block }) {
  if (block.type === 'heading') return <h2>{renderInlineText(block.text)}</h2>;
  if (block.type === 'quote') return <blockquote>{renderInlineText(block.text)}</blockquote>;
  if (block.type === 'list') return <ul>{(block.text || '').split('\n').map((item) => item.trim()).filter(Boolean).map((item, index) => <li key={index}>{renderInlineText(item.replace(/^[-*]\s+/, ''))}</li>)}</ul>;
  if (block.type === 'image') return <figure><img src={block.image} alt={block.alt || ''} /></figure>;
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

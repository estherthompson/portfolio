import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getJournalPosts, getLocalJournalPostCount, isJournalAdmin, migrateLocalJournalPosts, removeJournalPost, saveJournalPost, slugify, subscribeJournalPosts } from '../../lib/journalStore';
import './index.scss';

const createId = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

function prepareImage(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type.startsWith('image/')) {
      reject(new Error('Choose an image file.'));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error('Choose an image smaller than 15 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('This image could not be opened.'));
      image.onload = () => {
        const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const initialBlock = () => ({ id: createId(), type: 'paragraph', text: '' });
const suggestedCategories = ['Review', 'Thoughts', 'Essay', 'Field notes', 'Personal', 'Behind the scenes'];

function PreviewText({ text = '' }) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function PreviewBlock({ block }) {
  if (block.type === 'heading') return <h3><PreviewText text={block.text} /></h3>;
  if (block.type === 'quote') return <blockquote><PreviewText text={block.text} /></blockquote>;
  if (block.type === 'list') return <ul>{(block.text || '').split('\n').map((item) => item.trim()).filter(Boolean).map((item, index) => <li key={index}><PreviewText text={item.replace(/^[-*]\s+/, '')} /></li>)}</ul>;
  if (block.type === 'image') return block.image ? <figure><img src={block.image} alt={block.alt || ''} /></figure> : null;
  return <p><PreviewText text={block.text} /></p>;
}

function htmlToStoryText(html) {
  const documentNode = new DOMParser().parseFromString(html, 'text/html');
  const convert = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const tag = node.tagName.toLowerCase();
    const content = [...node.childNodes].map(convert).join('');
    if (tag === 'br') return '\n';
    if (tag === 'strong' || tag === 'b' || (tag === 'span' && /font-weight:\s*(bold|[6-9]00)/i.test(node.getAttribute('style') || ''))) return `**${content}**`;
    if (tag === 'em' || tag === 'i' || (tag === 'span' && /font-style:\s*italic/i.test(node.getAttribute('style') || ''))) return `*${content}*`;
    if (tag === 'li') return `- ${content.trim()}\n`;
    if (tag === 'p' || tag === 'div') return `${content.trim()}\n`;
    return content;
  };
  return [...documentNode.body.childNodes].map(convert).join('').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

const toDateInputValue = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateInputToIso = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12).toISOString();
};

export default function JournalAdmin() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [localPostCount, setLocalPostCount] = useState(() => getLocalJournalPostCount());
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Field notes');
  const [author, setAuthor] = useState('Esther Thompson');
  const [publishDate, setPublishDate] = useState(() => toDateInputValue());
  const [cover, setCover] = useState('');
  const [coverName, setCoverName] = useState('');
  const [blocks, setBlocks] = useState([initialBlock()]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [savingImage, setSavingImage] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const activeStoryTextarea = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);
    setAuthReady(false);
    if (!currentUser) {
      setAuthorized(false);
      setAuthReady(true);
      return;
    }
    try {
      setAuthorized(await isJournalAdmin(currentUser));
    } catch {
      setAuthorized(false);
    } finally {
      setAuthReady(true);
    }
  }), []);

  useEffect(() => subscribeJournalPosts((nextPosts) => {
    setPosts(nextPosts);
    setLocalPostCount(getLocalJournalPostCount());
  }, (loadError) => setError(`Could not load published stories: ${loadError.message}`)), []);

  const handleSignIn = async (event) => {
    event.preventDefault();
    setAuthError('');
    setSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
      setAuthPassword('');
    } catch (signInError) {
      setAuthError(signInError.code === 'auth/invalid-credential' ? 'That email and password did not match.' : signInError.message);
    } finally {
      setSigningIn(false);
    }
  };

  const handleMigration = async () => {
    setError('');
    setNotice('');
    setMigrating(true);
    try {
      const result = await migrateLocalJournalPosts();
      setPosts(await getJournalPosts());
      setLocalPostCount(0);
      setNotice(result.imported
        ? `Imported ${result.imported} ${result.imported === 1 ? 'story' : 'stories'} into your hosted journal.`
        : 'There were no browser-only stories to import.');
    } catch (migrationError) {
      setError(`Stories could not be imported: ${migrationError.message}`);
    } finally {
      setMigrating(false);
    }
  };

  const resetEditor = () => {
    setEditingPostId(null);
    setTitle('');
    setExcerpt('');
    setCategory('Field notes');
    setAuthor('Esther Thompson');
    setPublishDate(toDateInputValue());
    setCover('');
    setCoverName('');
    setBlocks([initialBlock()]);
  };

  const startEditing = (post) => {
    setEditingPostId(post.id);
    setTitle(post.title || '');
    setExcerpt(post.excerpt || '');
    setCategory(post.category || 'Field notes');
    setAuthor(post.author || 'Esther Thompson');
    setPublishDate(toDateInputValue(post.date));
    setCover(post.cover || '');
    setCoverName(post.coverName || '');
    setBlocks(post.blocks?.length ? post.blocks.map((block) => ({ ...block, id: block.id || createId() })) : [initialBlock()]);
    setError('');
    setNotice(`Editing “${post.title}”.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateBlock = (id, changes) => setBlocks((items) => items.map((item) => item.id === id ? { ...item, ...changes } : item));

  const formatSelection = (block, marker) => {
    const textarea = activeStoryTextarea.current;
    const text = block.text || '';
    const start = textarea?.selectionStart ?? text.length;
    const end = textarea?.selectionEnd ?? text.length;
    const selected = text.slice(start, end);
    const replacement = selected ? `${marker}${selected}${marker}` : `${marker}text${marker}`;
    const nextText = `${text.slice(0, start)}${replacement}${text.slice(end)}`;
    updateBlock(block.id, { text: nextText });
    requestAnimationFrame(() => {
      textarea?.focus();
      const cursor = selected ? start + replacement.length : start + marker.length;
      textarea?.setSelectionRange(cursor, selected ? cursor : cursor + 4);
    });
  };

  const handleStoryPaste = (event, block) => {
    const html = event.clipboardData?.getData('text/html');
    if (!html) return;
    const pastedText = htmlToStoryText(html);
    if (!pastedText) return;
    event.preventDefault();
    const textarea = event.currentTarget;
    const currentText = block.text || '';
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    updateBlock(block.id, {
      text: `${currentText.slice(0, start)}${pastedText}${currentText.slice(end)}`,
      ...(block.type === 'paragraph' && /<\s*(ul|ol)\b/i.test(html) ? { type: 'list' } : {}),
    });
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + pastedText.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleStoryShortcut = (event, block) => {
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === 'b' || key === 'i') {
      event.preventDefault();
      formatSelection(block, key === 'b' ? '**' : '*');
    }
  };

  const uploadImage = async (file, onReady) => {
    setError('');
    setSavingImage(true);
    try {
      const image = await prepareImage(file);
      onReady(image);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setSavingImage(false);
    }
  };

  const handlePublish = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!title.trim() || !excerpt.trim() || !cover) {
      setError('Add a title, a short preview, and a cover image before publishing.');
      return;
    }
    if (!publishDate) {
      setError('Choose the date this story was written or published.');
      return;
    }
    if (!blocks.some((block) => block.type === 'image' ? block.image : block.text?.trim())) {
      setError('Add at least one paragraph, heading, quote, or image to the story.');
      return;
    }
    const existingPost = editingPostId ? posts.find((item) => item.id === editingPostId) : null;
    const date = dateInputToIso(publishDate);
    const post = {
      id: existingPost?.id || createId(),
      slug: existingPost?.slug || `${slugify(title)}-${Date.now().toString(36)}`,
      title: title.trim(),
      excerpt: excerpt.trim(),
      category: category.trim() || 'Field notes',
      author: author.trim() || 'Esther Thompson',
      cover,
      coverName,
      blocks: blocks.filter((block) => block.type === 'image' ? block.image : block.text?.trim()),
      date: existingPost?.date || date,
      ...(existingPost ? { updatedAt: date } : {}),
    };
    try {
      setPosts(await saveJournalPost(post));
      resetEditor();
      setNotice(existingPost
        ? 'Changes saved to your hosted journal.'
        : 'Published. Your story is now live in The Archive.');
    } catch {
      setError('The story could not be saved to Firestore. Check your connection, sign-in, and Firestore rules.');
    }
  };

  const deletePost = async (id) => {
    try {
      setPosts(await removeJournalPost(id));
      if (editingPostId === id) resetEditor();
      setNotice('Story removed from your hosted journal.');
      setError('');
    } catch {
      setError('The story could not be removed. Check your connection and Firestore rules.');
    }
  };

  if (!authReady) return <main className="journal-auth"><p>Connecting to the writing desk…</p></main>;

  if (!user || !authorized) return (
    <main className="journal-auth">
      <Link to="/film-projects" className="journal-admin__brand">nonsense<span>&</span>ingredients</Link>
      {!user ? <form className="journal-auth__card" onSubmit={handleSignIn}>
        <p className="journal-admin__eyebrow">PRIVATE WRITING DESK</p>
        <h1>Sign in to your archive.</h1>
        <label className="journal-field"><span>Email</span><input type="email" autoComplete="username" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} required /></label>
        <label className="journal-field"><span>Password</span><input type="password" autoComplete="current-password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} required /></label>
        {authError && <p className="journal-form-message journal-form-message--error" role="alert">{authError}</p>}
        <button className="journal-publish" type="submit" disabled={signingIn}>{signingIn ? 'Signing in…' : 'Sign in'}</button>
        <Link className="journal-admin__return" to="/film-projects">← Back to Film Projects</Link>
      </form> : <section className="journal-auth__card">
        <p className="journal-admin__eyebrow">PRIVATE WRITING DESK</p>
        <h1>This account isn’t an editor.</h1>
        <p>Sign in with the Firebase account whose UID is authorized for this writing desk.</p>
        <button className="journal-publish" type="button" onClick={() => signOut(auth)}>Sign out</button>
      </section>}
    </main>
  );

  return (
    <main className="journal-admin">
      <header className="journal-admin__top">
        <Link to="/film-projects" className="journal-admin__brand">nonsense<span>&</span>ingredients</Link>
        <nav className="journal-admin__top-actions" aria-label="Admin actions">
          <Link to="/film-projects" className="journal-admin__return">← View Film Projects</Link>
          <button className="journal-admin__return journal-admin__sign-out" type="button" onClick={() => signOut(auth)}>Sign out</button>
        </nav>
      </header>
      <div className="journal-admin__layout">
        <section className="journal-admin__intro">
          <p className="journal-admin__eyebrow">THE WRITING DESK</p>
          <h1>Make a little<br /><em>room for a story.</em></h1>
          <p>Write the post, add images and headings, then publish it to the cards on Film Projects.</p>
        </section>

        <form className="journal-editor" onSubmit={handlePublish}>
          <div className="journal-editor__form-head"><div><span className="journal-admin__eyebrow">{editingPostId ? 'EDITING STORY' : 'NEW STORY'}</span><h2>{editingPostId ? 'Update the details' : 'Start with the details'}</h2></div><span className="journal-editor__draft-dot">● Draft</span></div>
          <label className="journal-field"><span>Story title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give it a name" maxLength={100} required /></label>
          <label className="journal-field"><span>Card preview</span><textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="A short invitation to read the story" rows={3} maxLength={240} required /></label>
          <div className="journal-editor__split">
          <label className="journal-field"><span>Tag</span><input list="journal-category-suggestions" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Choose or type a tag" maxLength={40} /><datalist id="journal-category-suggestions">{suggestedCategories.map((suggestion) => <option key={suggestion} value={suggestion} />)}</datalist></label>
            <label className="journal-field"><span>By</span><input value={author} onChange={(event) => setAuthor(event.target.value)} maxLength={60} /></label>
          </div>
          <label className="journal-field"><span>Written or published on</span><input type="date" value={publishDate} onChange={(event) => setPublishDate(event.target.value)} required /></label>
          <div className="journal-field"><span>Cover image</span><label className="journal-upload">{cover ? <img src={cover} alt="Cover preview" /> : <span className="journal-upload__prompt"><b>＋</b><span>Choose a cover image</span><small>JPG, PNG, or WebP · up to 15 MB</small></span>}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setCoverName(file.name); uploadImage(file, setCover); } }} /></label></div>

          <div className="journal-blocks-heading"><div><span className="journal-admin__eyebrow">THE STORY</span><h2>Build your page</h2></div><span>Add blocks in the order you want them read.</span></div>
          <div className="journal-blocks">
            {blocks.map((block, index) => (
              <section className="journal-block" key={block.id}>
                <div className="journal-block__bar"><span>{String(index + 1).padStart(2, '0')} · {block.type === 'paragraph' ? 'Paragraph' : block.type === 'heading' ? 'Heading' : block.type === 'quote' ? 'Pull quote' : block.type === 'list' ? 'Bulleted list' : 'Image'}</span><div><button type="button" aria-label="Move block up" disabled={index === 0} onClick={() => setBlocks((items) => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })}>↑</button><button type="button" aria-label="Move block down" disabled={index === blocks.length - 1} onClick={() => setBlocks((items) => { const next = [...items]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next; })}>↓</button><button type="button" aria-label="Remove block" onClick={() => setBlocks((items) => items.filter((item) => item.id !== block.id))}>×</button></div></div>
                {block.type === 'image' ? <label className="journal-block__image">{block.image ? <img src={block.image} alt={block.alt || ''} /> : <span>Choose an image for this part of the story</span>}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadImage(file, (image) => updateBlock(block.id, { image })); }} /><input className="journal-block__alt" value={block.alt || ''} onChange={(event) => updateBlock(block.id, { alt: event.target.value })} placeholder="Describe the image (optional)" aria-label="Image description" /></label> : <>
                  {block.type !== 'list' && <div className="journal-format-tools" aria-label="Text formatting"><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatSelection(block, '**')} aria-label="Bold"><strong>B</strong></button><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatSelection(block, '*')} aria-label="Italic"><em>I</em></button><span>Select text, then choose a style.</span></div>}
                  <textarea ref={(element) => { if (element && document.activeElement === element) activeStoryTextarea.current = element; }} onFocus={(event) => { activeStoryTextarea.current = event.currentTarget; }} onPaste={(event) => handleStoryPaste(event, block)} onKeyDown={(event) => handleStoryShortcut(event, block)} value={block.text} onChange={(event) => updateBlock(block.id, { text: event.target.value })} placeholder={block.type === 'heading' ? 'Section heading' : block.type === 'quote' ? 'A line worth lingering over' : block.type === 'list' ? 'One list item per line' : 'Write a paragraph…'} rows={block.type === 'heading' ? 2 : 4} />
                </>}
              </section>
            ))}
          </div>
          <div className="journal-add-blocks"><span>Add to story</span>{[['paragraph', 'Paragraph'], ['heading', 'Heading'], ['quote', 'Pull quote'], ['list', 'Bulleted list'], ['image', 'Image']].map(([type, label]) => <button type="button" key={type} onClick={() => setBlocks((items) => [...items, { id: createId(), type, text: '', image: '', alt: '' }])}>＋ {label}</button>)}</div>
          <button className="journal-preview-toggle" type="button" onClick={() => setShowPreview((visible) => !visible)}>{showPreview ? 'Hide preview' : 'Preview post'}</button>
          {showPreview && <article className="journal-live-preview">
            {cover && <img className="journal-live-preview__cover" src={cover} alt="" />}
            <span className="journal-admin__eyebrow">{category || 'UNTAGGED'} · {publishDate || 'NO DATE'}</span>
            <h2>{title || 'Your story title'}</h2>
            {excerpt && <p className="journal-live-preview__excerpt">{excerpt}</p>}
            <p className="journal-live-preview__byline">By {author || 'Esther Thompson'}</p>
            <div className="journal-live-preview__body">{blocks.map((block) => <PreviewBlock key={block.id} block={block} />)}</div>
          </article>}
          {error && <p className="journal-form-message journal-form-message--error" role="alert">{error}</p>}
          {notice && <p className="journal-form-message" role="status">{notice}</p>}
          {editingPostId && <button className="journal-cancel-edit" type="button" onClick={() => { resetEditor(); setError(''); setNotice('Editing cancelled.'); }}>Cancel editing</button>}
          <button className="journal-publish" type="submit" disabled={savingImage}>{savingImage ? 'Preparing image…' : editingPostId ? 'Save changes' : 'Publish story'}</button>
        </form>

        <section className="journal-admin__posts"><div className="journal-blocks-heading"><div><span className="journal-admin__eyebrow">YOUR STORIES</span><h2>Published here</h2></div><span>{posts.length} {posts.length === 1 ? 'story' : 'stories'}</span></div>
          {localPostCount > 0 && <div className="journal-import-note"><p>{localPostCount} {localPostCount === 1 ? 'story is' : 'stories are'} still saved only in this browser.</p><button type="button" onClick={handleMigration} disabled={migrating}>{migrating ? 'Importing…' : 'Import browser stories to Firestore'}</button></div>}
          {posts.length ? <ul>{posts.map((post) => <li key={post.id}><img src={post.cover} alt="" /><div><strong>{post.title}</strong><span>{post.category} · {new Date(post.date).toLocaleDateString()}</span></div><div className="journal-post-actions"><button type="button" onClick={() => startEditing(post)} aria-label={`Edit ${post.title}`}>Edit</button><button type="button" onClick={() => deletePost(post.id)} aria-label={`Delete ${post.title}`}>Remove</button></div></li>)}</ul> : <p>No stories yet. The first one can be yours.</p>}
        </section>
      </div>
    </main>
  );
}

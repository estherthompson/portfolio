import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getJournalPosts, getLocalJournalPostCount, isJournalAdmin, migrateLocalJournalPosts, removeJournalPost, saveJournalPost, slugify, subscribeAdminJournalPosts } from '../../lib/journalStore';
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
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The image could not be prepared.')), 'image/webp', 0.82);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadJournalAsset(file, fileName, resourceType) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || 'mn3mn8zk';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() || 'portfolio_assets';
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured. Check the cloud name and unsigned upload preset.');
  }
  const formData = new FormData();
  formData.append('file', file, fileName);
  formData.append('upload_preset', uploadPreset);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/upload`, {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || 'Cloudinary could not upload this file. Check the cloud name, preset, and allowed formats.');
  }
  return result.secure_url;
}

async function uploadEmbeddedImage(dataUrl, name) {
  const blob = await (await fetch(dataUrl)).blob();
  return uploadJournalAsset(blob, name, 'image');
}

const initialBlock = () => ({ id: createId(), type: 'paragraph', text: '' });
const journalCategories = ['Short film', 'Film review', 'Character / scene analysis', 'Film pitch', 'Academic essay', 'Media diary'];

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

function PreviewText({ text = '' }) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function PreviewBlock({ block }) {
  if (block.type === 'heading') return <h2><PreviewText text={block.text} /></h2>;
  if (block.type === 'quote') return <blockquote><PreviewText text={block.text} /></blockquote>;
  if (block.type === 'list') return <ul>{(block.text || '').split('\n').map((item) => item.trim()).filter(Boolean).map((item, index) => <li key={index}><PreviewText text={item.replace(/^[-*]\s+/, '')} /></li>)}</ul>;
  if (block.type === 'image') return block.image ? <figure><img src={block.image} alt={block.alt || ''} /></figure> : null;
  if (block.type === 'video') return block.url ? <figure><video controls preload="metadata" src={block.url}>Your browser does not support video playback.</video></figure> : null;
  if (block.type === 'youtube') return youtubeEmbedUrl(block.url) ? <figure className="journal-youtube"><iframe src={youtubeEmbedUrl(block.url)} title={block.title || 'YouTube video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></figure> : null;
  if (block.type === 'pdf') return block.url ? <figure className="journal-pdf"><iframe src={block.url} title={block.title || 'PDF document'} /><a href={block.url} target="_blank" rel="noreferrer">Open PDF in a new tab</a></figure> : null;
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
    if (tag === 'p' || tag === 'div') return `${content.replace(/\n+$/, '')}\n`;
    return content;
  };
  return [...documentNode.body.childNodes].map(convert).join('').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
}

function markdownToEditorHtml(text = '', type = 'paragraph') {
  const inline = (value) => value
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  if (type === 'list') {
    const items = text.split('\n').map((item) => item.trim()).filter(Boolean)
      .map((item) => `<li>${inline(item.replace(/^[-*]\s+/, ''))}</li>`).join('');
    return items ? `<ul>${items}</ul>` : '<div><br></div>';
  }
  return text.split('\n').map((line) => `<div>${inline(line) || '<br>'}</div>`).join('') || '<div><br></div>';
}

function RichStoryEditor({ block, editorRef, onChange }) {
  const elementRef = useRef(null);
  const lastSavedText = useRef(null);
  useEffect(() => {
    if (!elementRef.current || lastSavedText.current === block.text) return;
    elementRef.current.innerHTML = markdownToEditorHtml(block.text, block.type);
    lastSavedText.current = block.text;
  }, [block.id, block.text, block.type]);

  const sync = () => {
    const element = elementRef.current;
    if (!element) return;
    const text = htmlToStoryText(element.innerHTML);
    lastSavedText.current = text;
    onChange(text, Boolean(element.querySelector('ul,ol')));
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    document.execCommand('insertText', false, '\u00a0\u00a0\u00a0\u00a0');
    sync();
  };

  return <div
    ref={(element) => { elementRef.current = element; if (element && document.activeElement === element) editorRef.current = element; }}
    className="journal-rich-editor"
    contentEditable
    suppressContentEditableWarning
    role="textbox"
    aria-multiline="true"
    data-placeholder={block.type === 'heading' ? 'Section heading' : block.type === 'quote' ? 'A line worth lingering over' : block.type === 'list' ? 'One list item per line' : 'Write your story…'}
    onFocus={(event) => { editorRef.current = event.currentTarget; }}
    onInput={sync}
    onKeyDown={handleKeyDown}
    onBlur={sync}
  />;
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
  const [category, setCategory] = useState('Film review');
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

  useEffect(() => subscribeAdminJournalPosts((nextPosts) => {
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
    setCategory('Film review');
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
    const editor = activeStoryTextarea.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(marker === '**' ? 'bold' : 'italic');
    const text = htmlToStoryText(editor.innerHTML);
    updateBlock(block.id, { text });
  };

  const uploadImage = async (file, onReady) => {
    setError('');
    setSavingImage(true);
    try {
      const image = await prepareImage(file);
      onReady(await uploadJournalAsset(image, file.name.replace(/\.[^.]+$/, '.webp'), 'image'));
    } catch (uploadError) {
      setError(uploadError.message || 'The image could not be uploaded.');
    } finally {
      setSavingImage(false);
    }
  };

  const uploadJournalFile = async (file, block, type) => {
    const isVideo = type === 'video';
    const maxBytes = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Choose a ${isVideo ? 'video' : 'PDF'} smaller than ${isVideo ? '100' : '25'} MB.`);
      return;
    }
    if (isVideo && !['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
      setError('Choose an MP4, WebM, or QuickTime video.');
      return;
    }
    if (!isVideo && file.type !== 'application/pdf') {
      setError('Choose a PDF file.');
      return;
    }
    setError('');
    setSavingImage(true);
    try {
      const url = await uploadJournalAsset(file, file.name, isVideo ? 'video' : 'raw');
      updateBlock(block.id, { url, fileName: file.name });
    } catch (uploadError) {
      setError(uploadError.message || `The ${isVideo ? 'video' : 'PDF'} could not be uploaded.`);
    } finally {
      setSavingImage(false);
    }
  };

  const handleSave = async (status, event) => {
    event?.preventDefault();
    setError('');
    setNotice('');
    if (status === 'published') {
      if (!title.trim() || !excerpt.trim() || !cover) {
        setError('Add a title, a short preview, and a cover image before publishing.');
        return;
      }
      if (!publishDate) {
        setError('Choose the date this story was written or published.');
        return;
      }
      if (!blocks.some((block) => ['image', 'video', 'pdf'].includes(block.type) ? block.type === 'image' ? block.image : block.url : block.type === 'youtube' ? youtubeEmbedUrl(block.url) : block.text?.trim())) {
        setError('Add at least one text block, image, video, PDF, or YouTube embed to the story.');
        return;
      }
    }
    const existingPost = editingPostId ? posts.find((item) => item.id === editingPostId) : null;
    const date = dateInputToIso(publishDate);
    setSavingImage(true);
    try {
      const savedCover = cover.startsWith('data:image/')
        ? await uploadEmbeddedImage(cover, coverName || 'cover.webp')
        : cover;
      const savedBlocks = await Promise.all(blocks.map(async (block) => (
        block.type === 'image' && block.image?.startsWith('data:image/')
          ? { ...block, image: await uploadEmbeddedImage(block.image, block.fileName || 'story-image.webp') }
          : block
      )));
      setCover(savedCover);
      setBlocks(savedBlocks);
      const post = {
        id: existingPost?.id || createId(),
        slug: existingPost?.status === 'draft' && status === 'published'
          ? `${slugify(title) || 'untitled'}-${Date.now().toString(36)}`
          : existingPost?.slug || `${slugify(title) || 'draft'}-${Date.now().toString(36)}`,
        title: title.trim() || 'Untitled draft',
        excerpt: excerpt.trim(),
        category: category.trim() || 'Field notes',
        author: author.trim() || 'Esther Thompson',
        cover: savedCover,
        coverName,
        blocks: status === 'draft' ? savedBlocks : savedBlocks.filter((block) => ['image', 'video', 'pdf'].includes(block.type) ? block.type === 'image' ? block.image : block.url : block.type === 'youtube' ? youtubeEmbedUrl(block.url) : block.text?.trim()),
        date: existingPost?.date || (publishDate ? date : new Date().toISOString()),
        status,
        updatedAt: new Date().toISOString(),
      };
      setPosts(await saveJournalPost(post));
      resetEditor();
      setNotice(status === 'draft'
        ? 'Draft saved. It will stay private until you publish it.'
        : existingPost ? 'Changes saved to your hosted journal.' : 'Published. Your story is now live in The Archive.');
    } catch (saveError) {
      const code = String(saveError?.code || '').replace(/^firestore\//, '');
      if (saveError?.message?.startsWith('Cloudinary')) {
        setError(saveError.message);
      } else if (code === 'permission-denied') {
        setError('Firestore rejected this save. Check that the published Firestore rules allow your signed-in admin UID to write to journalPosts.');
      } else if (code === 'unavailable' || code === 'network-request-failed') {
        setError('Firestore could not be reached. Check your connection and try publishing again.');
      } else {
        setError(saveError?.message || 'The story could not be saved. Please try again.');
      }
    } finally {
      setSavingImage(false);
    }
  };

  const handlePublish = (event) => handleSave('published', event);

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
        <aside className="journal-admin__sidebar">
          <section className="journal-admin__intro">
            <p className="journal-admin__eyebrow">THE WRITING DESK</p>
            <h1>Make a little<br /><em>room for a story.</em></h1>
            <p>Write your story, choose a tag, and publish it directly to the shared journal.</p>
          </section>
          <section className="journal-admin__posts"><div className="journal-blocks-heading"><div><span className="journal-admin__eyebrow">YOUR STORIES</span><h2>Saved here</h2></div><span>{posts.length} {posts.length === 1 ? 'story' : 'stories'}</span></div>
            {localPostCount > 0 && <div className="journal-import-note"><p>{localPostCount} older {localPostCount === 1 ? 'story is' : 'stories are'} saved only in this browser. New posts publish straight to the shared journal.</p><button type="button" onClick={handleMigration} disabled={migrating}>{migrating ? 'Importing…' : 'Import older browser stories once'}</button></div>}
            {posts.length ? <ul>{posts.map((post) => <li key={post.id}><img src={post.cover || ''} alt="" /><div><strong>{post.title || 'Untitled draft'}</strong><span>{post.status === 'draft' ? 'Draft' : 'Published'} · {post.category || 'Untagged'} · {new Date(post.updatedAt || post.date).toLocaleDateString()}</span></div><div className="journal-post-actions"><button type="button" onClick={() => startEditing(post)} aria-label={`Edit ${post.title || 'draft'}`}>Edit</button><button type="button" onClick={() => deletePost(post.id)} aria-label={`Delete ${post.title || 'draft'}`}>Remove</button></div></li>)}</ul> : <p>No stories yet. The first one can be yours.</p>}
          </section>
        </aside>

        <form className="journal-editor" onSubmit={handlePublish}>
          <div className="journal-editor__form-head"><div><span className="journal-admin__eyebrow">{editingPostId ? 'EDITING STORY' : 'NEW STORY'}</span><h2>{editingPostId ? 'Update the details' : 'Start with the details'}</h2></div><span className="journal-editor__draft-dot">● Draft</span></div>
          <label className="journal-field"><span>Story title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give it a name" maxLength={100} required /></label>
          <label className="journal-field"><span>Card preview</span><textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="A short invitation to read the story" rows={3} maxLength={240} required /></label>
          <div className="journal-editor__split">
          <label className="journal-field"><span>Tag</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{!journalCategories.includes(category) && <option value={category}>{category}</option>}{journalCategories.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select></label>
            <label className="journal-field"><span>By</span><input value={author} onChange={(event) => setAuthor(event.target.value)} maxLength={60} /></label>
          </div>
          <label className="journal-field"><span>Written or published on</span><input type="date" value={publishDate} onChange={(event) => setPublishDate(event.target.value)} required /></label>
          <div className="journal-field"><span>Cover image</span><label className="journal-upload">{cover ? <img src={cover} alt="Cover preview" /> : <span className="journal-upload__prompt"><b>＋</b><span>Choose a cover image</span><small>JPG, PNG, or WebP · up to 15 MB</small></span>}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setCoverName(file.name); uploadImage(file, setCover); } }} /></label></div>

          <div className="journal-blocks-heading"><div><span className="journal-admin__eyebrow">THE STORY</span><h2>Build your page</h2></div><span>Add blocks in the order you want them read.</span></div>
          <div className="journal-blocks">
            {blocks.map((block, index) => (
              <section className="journal-block" key={block.id}>
                <div className="journal-block__bar"><span>{String(index + 1).padStart(2, '0')} · {{ paragraph: 'Paragraph', heading: 'Heading', quote: 'Pull quote', list: 'Bulleted list', image: 'Image', video: 'Video upload', youtube: 'YouTube video', pdf: 'PDF document' }[block.type] || 'Paragraph'}</span><div><button type="button" aria-label="Move block up" disabled={index === 0} onClick={() => setBlocks((items) => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })}>↑</button><button type="button" aria-label="Move block down" disabled={index === blocks.length - 1} onClick={() => setBlocks((items) => { const next = [...items]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next; })}>↓</button><button type="button" aria-label="Remove block" onClick={() => setBlocks((items) => items.filter((item) => item.id !== block.id))}>×</button></div></div>
                {block.type === 'image' ? <label className="journal-block__image">{block.image ? <img src={block.image} alt={block.alt || ''} /> : <span>Choose an image for this part of the story</span>}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadImage(file, (image) => updateBlock(block.id, { image })); }} /><input className="journal-block__alt" value={block.alt || ''} onChange={(event) => updateBlock(block.id, { alt: event.target.value })} placeholder="Describe the image (optional)" aria-label="Image description" /></label>
                  : block.type === 'video' || block.type === 'pdf' ? <div className="journal-media-upload">
                    <label className="journal-media-upload__pick">{block.url ? `Replace ${block.type === 'video' ? 'video' : 'PDF'}${block.fileName ? ` · ${block.fileName}` : ''}` : `Choose ${block.type === 'video' ? 'a video' : 'a PDF'}`}<input type="file" accept={block.type === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'application/pdf'} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadJournalFile(file, block, block.type); }} /></label>
                    <span>{block.type === 'video' ? 'MP4, WebM, or QuickTime · up to 100 MB' : 'PDF · up to 25 MB'}</span>
                    {block.url && (block.type === 'video' ? <video controls preload="metadata" src={block.url} /> : <a href={block.url} target="_blank" rel="noreferrer">Open uploaded PDF</a>)}
                  </div>
                  : block.type === 'youtube' ? <div className="journal-media-upload"><label className="journal-field"><span>YouTube URL</span><input type="url" value={block.url || ''} onChange={(event) => updateBlock(block.id, { url: event.target.value })} placeholder="https://www.youtube.com/watch?v=…" /></label>{youtubeEmbedUrl(block.url) && <div className="journal-youtube"><iframe src={youtubeEmbedUrl(block.url)} title="YouTube preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>}</div>
                  : <>
                  <div className="journal-format-tools" aria-label="Text formatting"><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatSelection(block, '**')} aria-label="Bold"><strong>B</strong></button><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatSelection(block, '*')} aria-label="Italic"><em>I</em></button><span>Select text and use Cmd/Ctrl+B or Cmd/Ctrl+I. Tab indents.</span></div>
                  <RichStoryEditor block={block} editorRef={activeStoryTextarea} onChange={(text, hasList) => updateBlock(block.id, { text, ...(hasList && block.type === 'paragraph' ? { type: 'list' } : {}) })} />
                </>}
              </section>
            ))}
          </div>
          <div className="journal-add-blocks"><span>Add to story</span>{[['paragraph', 'Paragraph'], ['heading', 'Heading'], ['quote', 'Pull quote'], ['list', 'Bulleted list'], ['image', 'Image'], ['video', 'Video'], ['youtube', 'YouTube'], ['pdf', 'PDF']].map(([type, label]) => <button type="button" key={type} onClick={() => setBlocks((items) => [...items, { id: createId(), type, text: '', image: '', alt: '', url: '', fileName: '' }])}>＋ {label}</button>)}</div>
          <button className="journal-preview-toggle" type="button" onClick={() => setShowPreview((visible) => !visible)}>{showPreview ? 'Hide preview' : 'Preview post'}</button>
          {showPreview && <div className="journal-live-preview"><article className="ni-article">
            <div className="ni-article-heading">
              <span className="ni-eyebrow">{category || 'UNTAGGED'} · {publishDate || 'NO DATE'}</span>
              <h1>{title || 'Your story title'}</h1>
              <p className="ni-article-deck">{excerpt}</p>
              <div className="ni-byline">By {author || 'Esther Thompson'} <span>·</span> {publishDate || 'No date'}</div>
            </div>
            {cover && <img className="ni-article-cover" src={cover} alt="" />}
            <div className="ni-prose">{blocks.map((block) => <PreviewBlock key={block.id} block={block} />)}</div>
          </article></div>}
          {error && <p className="journal-form-message journal-form-message--error" role="alert">{error}</p>}
          {notice && <p className="journal-form-message" role="status">{notice}</p>}
          {editingPostId && <button className="journal-cancel-edit" type="button" onClick={() => { resetEditor(); setError(''); setNotice('Editing cancelled.'); }}>Cancel editing</button>}
          <div className="journal-editor__save-actions"><button className="journal-save-draft" type="button" disabled={savingImage} onClick={() => handleSave('draft')}>{savingImage ? 'Saving…' : 'Save draft'}</button><button className="journal-publish" type="submit" disabled={savingImage}>{savingImage ? 'Preparing image…' : editingPostId ? 'Save & publish' : 'Publish story'}</button></div>
        </form>

      </div>
    </main>
  );
}

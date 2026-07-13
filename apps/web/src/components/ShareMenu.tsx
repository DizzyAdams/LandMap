'use client';

import { useState, useCallback } from 'react';
import { Mail } from './lovable/icons';

interface ShareMenuProps {
  url?: string;
  title?: string;
  text?: string;
  className?: string;
}

export function ShareMenu({ url, title, text, className = '' }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  // Guard `document` — this client component is still server-rendered (SSR),
  // where `document` is undefined.
  const shareTitle = title || (typeof document !== 'undefined' ? document.title : '');
  const shareText = text || shareTitle;

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        setOpen(false);
        return;
      } catch {
        // user cancelled or error — fall through to menu
      }
    }
    setOpen((prev) => !prev);
  }, [shareUrl, shareTitle, shareText]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  }, [shareUrl]);

  const shareVia = useCallback((platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    let href = '';

    switch (platform) {
      case 'whatsapp':
        href = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'twitter':
        href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'email':
        href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodedText}%0A${encodedUrl}`;
        break;
    }

    if (href) {
      window.open(href, '_blank', 'noopener');
    }
    setOpen(false);
  }, [shareUrl, shareTitle, shareText]);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={handleNativeShare}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--foreground)] transition hover:border-[var(--primary)]/60 hover:text-[var(--primary)]"
        aria-label="Share"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-xl">
            <button
              onClick={() => shareVia('whatsapp')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-[var(--foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--primary)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <button
              onClick={() => shareVia('twitter')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-[var(--foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--primary)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Twitter / X
            </button>
            <button
              onClick={() => shareVia('email')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-[var(--foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--primary)]"
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </button>
            <div className="my-1 border-t border-[var(--border)]" />
            <button
              onClick={copyLink}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-[var(--foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--primary)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

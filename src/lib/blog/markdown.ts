// ---------------------------------------------------------------------------
// Tiny markdown → HTML converter (used ONCE to migrate the original static
// blog posts, whose `content` is markdown-ish, into the new HTML body format)
// + an allowlist HTML sanitiser used whenever admin-authored HTML is rendered.
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Inline spans: **bold**, _italic_ / *italic*, `code`. Operates on escaped text. */
function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_(.+?)_(?=[\s).,!?]|$)/g, '$1<em>$2</em>')
    .replace(/(^|[\s(])\*(.+?)\*(?=[\s).,!?]|$)/g, '$1<em>$2</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

/** Convert the legacy markdown-ish blog `content` into semantic HTML. */
export function markdownToHtml(md: string): string {
  const blocks = md.split(/\n\n+/);
  const out: string[] = [];

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    if (block.startsWith('### ')) {
      out.push(`<h3>${inline(escapeHtml(block.slice(4)))}</h3>`);
      continue;
    }
    if (block.startsWith('## ')) {
      out.push(`<h2>${inline(escapeHtml(block.slice(3)))}</h2>`);
      continue;
    }

    const lines = block.split('\n').filter(Boolean);
    const isOrdered = /^\d+\.\s/.test(lines[0] ?? '');
    const isBulleted = /^[-*]\s/.test(lines[0] ?? '');
    if (isOrdered || isBulleted) {
      const tag = isOrdered ? 'ol' : 'ul';
      const items = lines
        .map((l) => l.replace(/^(\d+\.\s|[-*]\s)/, ''))
        .map((l) => `<li>${inline(escapeHtml(l))}</li>`)
        .join('');
      out.push(`<${tag}>${items}</${tag}>`);
      continue;
    }

    out.push(`<p>${inline(escapeHtml(block.replace(/\n/g, ' ')))}</p>`);
  }

  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Sanitiser — allowlist of tags/attributes. Admin content is authored locally,
// but it lives in localStorage (user-editable) and is injected via
// dangerouslySetInnerHTML, so we always sanitise before rendering.
// ---------------------------------------------------------------------------

const ALLOWED_TAGS = new Set([
  'P', 'BR', 'H2', 'H3', 'H4', 'STRONG', 'B', 'EM', 'I', 'U', 'S',
  'UL', 'OL', 'LI', 'A', 'BLOCKQUOTE', 'CODE', 'PRE', 'HR', 'SPAN',
  'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'IMG', 'FIGURE', 'FIGCAPTION',
]);
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  A: new Set(['href', 'title', 'target', 'rel']),
  IMG: new Set(['src', 'alt', 'title']),
  TD: new Set(['colspan', 'rowspan']),
  TH: new Set(['colspan', 'rowspan']),
};

function safeUrl(url: string): boolean {
  const v = url.trim().toLowerCase();
  // Block javascript:, data:text/html etc. Allow http(s), mailto, relative, and image data URLs.
  if (v.startsWith('javascript:') || v.startsWith('vbscript:')) return false;
  if (v.startsWith('data:') && !v.startsWith('data:image/')) return false;
  return true;
}

/** Client-side DOM sanitiser (DOMParser). */
function sanitizeWithDom(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const walk = (node: Element) => {
    // Iterate over a static copy — we mutate as we go.
    [...node.children].forEach((el) => {
      const tag = el.tagName;
      if (!ALLOWED_TAGS.has(tag)) {
        // Unwrap disallowed element: keep its (sanitised) children, drop the tag.
        if (tag === 'SCRIPT' || tag === 'STYLE') {
          el.remove();
          return;
        }
        walk(el);
        el.replaceWith(...[...el.childNodes]);
        return;
      }
      // Strip every attribute not on the allowlist; validate URLs.
      const allowed = ALLOWED_ATTRS[tag] ?? new Set<string>();
      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on') || !allowed.has(name)) {
          el.removeAttribute(attr.name);
        } else if ((name === 'href' || name === 'src') && !safeUrl(attr.value)) {
          el.removeAttribute(attr.name);
        }
      });
      if (tag === 'A' && el.getAttribute('target') === '_blank') {
        el.setAttribute('rel', 'noopener noreferrer');
      }
      walk(el);
    });
  };

  walk(doc.body);
  return doc.body.innerHTML;
}

/** Conservative regex fallback for the server (no DOMParser). */
function sanitizeWithRegex(html: string): string {
  return html
    .replace(/<\s*(script|style)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1=$2#$2');
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      return sanitizeWithDom(html);
    } catch {
      return sanitizeWithRegex(html);
    }
  }
  return sanitizeWithRegex(html);
}

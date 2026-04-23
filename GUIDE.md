# NeuraFeed API — Integration Guide

Base URL: `https://neurafeed.vercel.app`

NeuraFeed is an AI-powered news intelligence service. It aggregates RSS signals, detects or validates a trending topic, and generates a structured, factual news article using LLM + Google Search grounding. Articles are stored in Firestore and exposed via a simple REST API.

---

## Endpoints

### `GET /api/latest-news`

Returns the most recently generated article.

- **Authentication:** None required
- **Method:** GET

**Request**

```
GET https://neurafeed.vercel.app/api/latest-news
```

**Response — 200 OK**

```json
{
  "article": {
    "id": "firestoreDocumentId",
    "title": "Article headline",
    "summary": "2-3 sentence executive summary.",
    "article": "<h2>Subtopic</h2><p>Content with inline citation.<sup>[1]</sup></p>...",
    "whyItMatters": "2-3 sentences explaining significance.",
    "sources": [
      "[1] TechCrunch: https://techcrunch.com/...",
      "[2] The Verge: https://www.theverge.com/..."
    ],
    "topic": "Detected trending topic name",
    "createdAt": "2025-04-23T03:00:00.000Z"
  }
}
```

**Response — 404** (no articles generated yet)

```json
{ "article": null }
```

**Field reference**

| Field | Type | Description |
|---|---|---|
| `id` | string | Firestore document ID |
| `title` | string | News article headline — plain text, no HTML |
| `summary` | string | Short executive summary — plain text, no HTML |
| `article` | **HTML string** | Full article body — **must be rendered as HTML**, see below |
| `whyItMatters` | string | Significance paragraph — plain text, no HTML |
| `sources` | string[] | Numbered source list — format `"[N] Name: URL"`, see below |
| `topic` | string | The topic that drove generation |
| `createdAt` | string | ISO 8601 timestamp |

---

### `POST /api/generate`

Triggers a full article generation run.

- **Authentication:** `Authorization: Bearer <API_KEY>` header required
- **Method:** POST
- **Duration:** 30–60 seconds

**Request**

```
POST https://neurafeed.vercel.app/api/generate
Authorization: Bearer <your_api_key>
Content-Type: application/json
```

Body is optional. When omitted, the server auto-detects the best topic using Firestore settings.

```json
{
  "generationId": "optional-uuid-v4",
  "customTopic": "Anthropic",
  "settings": {
    "timeWindowHours": 24,
    "maxPerSource": 5,
    "model": "gemini-2.5-flash",
    "stage2Temperature": 0.4,
    "stage2MaxTokens": 4096,
    "stage1ThinkingBudget": 0,
    "enabledSources": null,
    "similarityThreshold": 0.82
  }
}
```

**Body fields (all optional)**

| Field | Type | Default | Description |
|---|---|---|---|
| `generationId` | string | null | UUID for tracking progress in Firestore `logs/{id}` |
| `customTopic` | string | `""` | Request a specific topic. Leave blank for auto-detection. |
| `settings.timeWindowHours` | number | 24 | Only consider RSS articles from the last N hours |
| `settings.maxPerSource` | number | 5 | Max articles per RSS source |
| `settings.model` | string | `"gemini-2.5-flash"` | Gemini model |
| `settings.stage2Temperature` | number | 0.4 | Article generation temperature |
| `settings.stage2MaxTokens` | number | 4096 | Max tokens for article generation |
| `settings.similarityThreshold` | number | 0.82 | Dedup threshold for auto-detect mode |

**Response — 201 Created**

```json
{ "success": true, "id": "firestoreDocumentId", "topic": "Topic name" }
```

**Response — 200 OK — no news found** (customTopic had no matching RSS signals)

```json
{
  "success": false,
  "noNews": true,
  "topic": "Anthropic AI",
  "message": "No recent RSS news found for \"Anthropic AI\".",
  "duration_ms": 4200
}
```

> Check `data.noNews === true` explicitly — this is HTTP 200, not an error status.

**Response — 401 / 503**

```json
{ "success": false, "error": "Unauthorized" }
```

---

## Article Format — IMPORTANT

> [!IMPORTANT]
> The `article` field is an **HTML string**, not plain text. It **must** be injected into the DOM as HTML, not rendered as a string. Treating it as plain text will show raw HTML tags to the user.

### HTML structure produced

Every article body follows this structure:

```html
<h2>Subtopic Heading</h2>
<p>
  Opening paragraph with a specific fact.<sup>[1]</sup>
  A follow-up sentence from another source.<sup>[2]</sup>
</p>
<p>Second paragraph for this subtopic.<sup>[1]</sup></p>

<h2>Second Subtopic Heading</h2>
<p>Content here.<sup>[3]</sup></p>

<h2>Third Subtopic</h2>
<p>
  Companies like <strong>Anthropic</strong> and <strong>OpenAI</strong> are...
  This is <em>particularly</em> significant because...<sup>[2]</sup>
</p>
```

**Tags used:**

| Tag | Purpose |
|---|---|
| `<h2>` | Main subtopic heading (3–5 per article) |
| `<h3>` | Sub-section heading (optional, used sparingly) |
| `<p>` | Paragraph — 2–3 per `<h2>` section |
| `<strong>` | Key terms, company names, model names, statistics (first mention) |
| `<em>` | Genuine emphasis only |
| `<sup>[N]</sup>` | Inline citation number matching the `sources` array |

**Guaranteed never present:**
- Em-dashes (`—`)
- Emoji or emoticons
- `<div>`, `<ul>`, `<li>`, `<br>`, `<a>`, or any other tag

---

## Sources Format

The `sources` array uses numbered entries that match the inline `<sup>[N]</sup>` citations:

```json
[
  "[1] TechCrunch: https://techcrunch.com/2025/04/23/some-article",
  "[2] The Verge: https://www.theverge.com/2025/04/23/some-article",
  "[3] Wired: https://www.wired.com/story/some-article"
]
```

Each entry format: `[N] Source Name: https://url`

Parse pattern (regex): `/^\[(\d+)\]\s+(.+?):\s*(https?:\/\/\S+)/`

---

## Rendering Guide

### React / Next.js (TSX)

```tsx
// Helper to parse a source string
function parseSource(raw: string) {
  const match = raw.match(/^\[(\d+)\]\s+(.+?):\s*(https?:\/\/\S+)/);
  if (match) return { num: match[1], name: match[2], url: match[3] };
  // Fallback for old format without [N] prefix
  const old = raw.match(/^(.+?):\s*(https?:\/\/\S+)/);
  if (old) return { num: null, name: old[1], url: old[2] };
  return { num: null, name: raw, url: null };
}

export function ArticleRenderer({ article }: { article: NeuraFeedArticle }) {
  return (
    <article>
      <h1>{article.title}</h1>
      <p className="summary">{article.summary}</p>

      {/* Render HTML body — content is AI-generated, not user input */}
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.article }}
      />

      {article.whyItMatters && (
        <aside className="why-matters">
          <strong>Why it matters</strong>
          <p>{article.whyItMatters}</p>
        </aside>
      )}

      {article.sources?.length > 0 && (
        <section className="sources">
          <h3>Sources</h3>
          <ol>
            {article.sources.map((raw, i) => {
              const { num, name, url } = parseSource(raw);
              return (
                <li key={i} id={num ? `ref-${num}` : undefined}>
                  {num && <span className="ref-num">[{num}]</span>}{' '}
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {name}
                    </a>
                  ) : name}
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </article>
  );
}
```

### Vanilla JavaScript

```js
async function renderLatestArticle(containerEl) {
  const res = await fetch('https://neurafeed.vercel.app/api/latest-news');
  if (!res.ok) return;
  const { article } = await res.json();
  if (!article) return;

  // Title and summary — plain text, use textContent
  containerEl.querySelector('.title').textContent = article.title;
  containerEl.querySelector('.summary').textContent = article.summary;

  // Article body — HTML, use innerHTML
  containerEl.querySelector('.article-body').innerHTML = article.article;

  // Why it matters — plain text
  if (article.whyItMatters) {
    containerEl.querySelector('.why-matters').textContent = article.whyItMatters;
  }

  // Sources — parse [N] Name: URL format
  const sourceRegex = /^\[(\d+)\]\s+(.+?):\s*(https?:\/\/\S+)/;
  const ol = containerEl.querySelector('.sources ol');
  article.sources.forEach((raw) => {
    const m = raw.match(sourceRegex);
    const li = document.createElement('li');
    if (m) {
      li.id = `ref-${m[1]}`;
      li.innerHTML = `<span class="ref-num">[${m[1]}]</span> <a href="${m[3]}" target="_blank" rel="noopener noreferrer">${m[2]}</a>`;
    } else {
      li.textContent = raw;
    }
    ol.appendChild(li);
  });
}
```

### TypeScript type definition

```ts
interface NeuraFeedArticle {
  id:           string;
  title:        string;          // plain text
  summary:      string;          // plain text
  article:      string;          // HTML string — render with innerHTML / dangerouslySetInnerHTML
  whyItMatters: string;          // plain text
  sources:      string[];        // "[N] Name: URL" format
  topic:        string;          // plain text
  createdAt:    string;          // ISO 8601
}

interface NeuraFeedResponse {
  article: NeuraFeedArticle | null;
}
```

---

## Recommended CSS

Style the injected article HTML with scoped selectors. Adjust to match your design system:

```css
.article-body {
  font-size: 15px;
  line-height: 1.8;
  color: #1a1a1a;
}

.article-body h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 1.75rem 0 0.6rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #e5e7eb;
  letter-spacing: -0.02em;
}
.article-body h2:first-child { margin-top: 0; }

.article-body h3 {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
  margin: 1.2rem 0 0.4rem;
}

.article-body p {
  margin: 0 0 0.9rem;
}
.article-body p:last-child { margin-bottom: 0; }

.article-body strong {
  font-weight: 600;
}

.article-body em {
  font-style: italic;
  color: #374151;
}

/* Inline citation superscript */
.article-body sup {
  font-size: 0.65em;
  color: #3b82f6;
  opacity: 0.8;
  vertical-align: super;
  line-height: 0;
  margin-left: 1px;
  font-weight: 500;
}

/* Source list */
.sources ol {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sources li {
  display: flex;
  gap: 6px;
  padding: 5px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.8rem;
  line-height: 1.5;
}
.sources li:last-child { border-bottom: none; }
.ref-num {
  color: #3b82f6;
  font-family: monospace;
  font-size: 0.75em;
  flex-shrink: 0;
}
.sources a {
  color: #3b82f6;
  text-decoration: none;
  word-break: break-all;
  font-family: monospace;
  font-size: 0.78rem;
}
.sources a:hover { text-decoration: underline; }
```

---

## Content Update Frequency

Articles are regenerated once daily at **00:00 UTC** via a GitHub Actions scheduled workflow. The workflow can also be triggered manually.

---

## Error Handling

- Always check `data.article !== null` before rendering
- Cache the response — content changes at most once per day
- For `customTopic` calls: check `data.noNews === true` (HTTP 200, not an error)
- The `sources` array may occasionally contain entries without a URL if Gemini could not retrieve a real link — handle gracefully

---

## Notes

- `title`, `summary`, and `whyItMatters` are **always plain text** — use `textContent` / JSX text nodes, never `innerHTML`
- `article` is **always HTML** — always use `innerHTML` / `dangerouslySetInnerHTML`
- Do not call `/api/generate` from client-side code — it requires a secret API key and takes up to 60 seconds
- `/api/latest-news` has no CORS restrictions and responds in under 500ms — safe to call from any client

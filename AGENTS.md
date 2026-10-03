# Personal website maintenance

This is Mason Dong / 董润霖's public GitHub Pages website. It uses static HTML, CSS and JavaScript, with no backend, package installation or build step.

## Read before editing

- `content.md`: current public identity, evidence and content boundaries.
- `cv-content.md`: bilingual copy reference for the active `CV.html` page.
- `index.html` redirects to `CV.html`. `gallery.html` is the photography page.
- No content generator exists. Update rendered HTML and copy references together.

## Content

- State the owner's work through concrete responsibilities and projects. Distinguish personal contribution from team achievements.
- The company, ShanghaiTech MakeSense competition team and MakeSense community are separate entities.
- Use precise award categories and years; gold medals do not imply an overall championship.
- Year 0 / pre-master's status is not an awarded master's degree. The undergraduate degree is in progress with an expected graduation date.
- Separate research goals and prototypes from clinically validated or approved products.
- Preserve both English and Chinese copy. Keep the Chinese name 董润霖 distinct from the WeChat public account 董寜寜.
- Do not invent metrics, customer relationships, credentials or technical outcomes. Record public source links and the date of owner-confirmed identity changes.
- Do not add internal company progress, experimental data, patent details, partnerships, orders, fundraising milestones, private personal material or local vault paths to the public repository without specific authorization.

## Implementation and validation

Preserve the existing color themes, language preference, page reveal, awards accordion, WeChat copy interaction and gallery unless a redesign is requested. No API key, GitHub token, environment variable or `.env` file is required to serve this site.

Preview from the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Run after editing:

```sh
python3 scripts/check_site.py
git diff --check
```

For changes to HTML, CSS or JavaScript, check English and Chinese at desktop and mobile widths, language persistence, awards expansion, gallery navigation and the no-JavaScript fallback. Existing unrelated pages need no rebuild.

Summarize which facts changed, the evidence used, checks performed and whether changes are only on a branch or live on GitHub Pages.

# Mason Dong — personal website

Public GitHub Pages site: https://masontung.github.io/CV.html

Static HTML/CSS/JavaScript. No backend, build step, npm dependencies, environment variables or secrets are needed.

## Files

- `CV.html` / `CV.css`: active bilingual profile.
- `index.html`: redirect to the profile.
- `gallery.html`: photography.
- `content.md` / `cv-content.md`: public content references; edit alongside HTML.
- `AGENTS.md`: instructions for Codex and other coding agents.

## Preview and check

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/CV.html in a browser. Stop the server with Ctrl-C.

```sh
python3 scripts/check_site.py
git diff --check
```

The check uses only Python's standard library. It checks the active profile and redirect for missing local assets, broken local anchors, duplicate IDs and mismatched bilingual span counts. It does not validate external links or replace a visual/interaction check.

## Codex Cloud setup

Select `MasonTung/masontung.github.io` as the repository and keep the environment private to the owner. Let Codex inspect the repository and verify the commands above. There is no installation command needed for this site; Python 3 is sufficient for preview and checks.

Leave environment variables and Secrets / Network secrets empty. GitHub repository access should use the connected GitHub account. An OpenAI API key is not needed for this website. Credentials cannot be kept secret in browser-delivered HTML or JavaScript.

For content verification, allow access to the exact public source domains needed for the task. Routine local edits and checks can run without internet. Extra network access and package installation are only needed if a future task adds tools that require them.

In the current cloud setup UI, use Settings → Codex Cloud → Environments → Edit to update the reusable setup, test it and Republish. Publishing that environment saves development setup; publishing the website is a separate GitHub Pages operation. Older integration environments have separate setup-script settings. Confirm which UI is in use before changing account settings.

Official documentation: https://learn.chatgpt.com/docs/environments/cloud-environments

Changes on a working branch do not update the live website. Review the diff, merge through the repository's normal workflow, and verify the GitHub Pages deployment and public URL.

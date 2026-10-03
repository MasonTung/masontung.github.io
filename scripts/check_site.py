#!/usr/bin/env python3
"""Validate local references and bilingual structure without third-party packages."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PAGES = ("CV.html", "index.html")


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.links = []
        self.languages = Counter()
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if attrs.get("data-lang"):
            self.languages[attrs["data-lang"]] += 1
        for name in ("href", "src"):
            if attrs.get(name):
                self.links.append(attrs[name])


errors = []
for name in PAGES:
    path = ROOT / name
    page = Page(path.read_text(encoding="utf-8"))
    for item, count in Counter(page.ids).items():
        if count > 1:
            errors.append(f"{name}: duplicate ID {item}")
    if name == "CV.html" and (not page.languages["en"] or page.languages["en"] != page.languages["zh"]):
        errors.append(f"{name}: mismatched bilingual blocks {dict(page.languages)}")
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        target = ROOT / unquote(url.path.lstrip("/")) if url.path.startswith("/") else path.parent / unquote(url.path)
        if not url.path:
            target = path
        if not target.exists():
            errors.append(f"{name}: missing local reference {link}")
        elif url.fragment and target.suffix == ".html":
            ids = Page(target.read_text(encoding="utf-8")).ids
            if unquote(url.fragment) not in ids:
                errors.append(f"{name}: missing anchor {link}")
if errors:
    raise SystemExit("\n".join(errors))
print("PASS: active profile and redirect — local assets, anchors, IDs and bilingual block counts")

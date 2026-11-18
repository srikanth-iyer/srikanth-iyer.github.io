"""
Checks on the files you edit, before the site is built.

Run with:  python tests/run_tests.py quick   (or: python -m pytest tests/test_source.py)

Each test below is one rule. When one fails, its message says which file
and what to fix.
"""

import re                 # patterns, for finding things like phone numbers
import shutil             # finds programs such as node on your computer
import subprocess         # runs other programs (git, node)
from pathlib import Path  # file paths that work on Windows, Mac and Linux

import pytest             # the test runner
import yaml               # reads YAML files

from helpers import ROOT, phone_problems, unpublished_problems   # shared helpers in tests/helpers.py

DATA = ROOT / "_data"                       # the folder with your lists (YAML files)
INCLUDES = ROOT / "_includes"               # reusable pieces of pages
LAYOUTS = ROOT / "_layouts"                 # page templates

# Every page you write: .html or .md files with a front matter block, outside the special folders
SKIP_DIRS = {"_site", "_layouts", "_includes", "_data", "node_modules", "vendor", "tools", "tests",
             ".git", ".github", ".githooks", ".jekyll-cache", "test-results", "playwright-report"}


def page_files():
    """List every page source file (an .html or .md file that starts with ---)."""
    found = []
    for path in ROOT.rglob("*"):                                    # every file in the repo
        if path.suffix not in (".html", ".md") or not path.is_file():
            continue                                                # only pages
        if set(path.relative_to(ROOT).parts) & SKIP_DIRS:
            continue                                                # skip special folders
        if path.name in ("README.md", "EDITING.md", "WEBSITE-RULES.md"):
            continue                                                # notes, not pages
        if path.read_text(encoding="utf-8").startswith("---"):
            found.append(path)                                      # it has front matter: a page
    return sorted(found)


def front_matter(path):
    """Return the front matter of a page as a Python dictionary."""
    text = path.read_text(encoding="utf-8")
    parts = text.split("\n---", 1)                                  # front matter ends at the next ---
    return yaml.safe_load(parts[0][3:]) or {}                      # [3:] skips the opening ---


def load(name):
    """Read one file from _data/ as Python lists and dictionaries."""
    return yaml.safe_load((DATA / name).read_text(encoding="utf-8"))


def page_exists(url):
    """True if a site address like /projects/dct/ has a page or file behind it."""
    rel = url.strip("/")
    candidates = [ROOT / rel / "index.html", ROOT / rel / "index.md", ROOT / rel,
                  ROOT / (rel + ".html"), ROOT / (rel + ".md")]
    return url == "/" or any(c.is_file() for c in candidates)


# ---------------------------------------------------------------- YAML files

YAML_FILES = sorted(DATA.glob("*.yml")) + [ROOT / "_config.yml"]


@pytest.mark.parametrize("path", YAML_FILES, ids=lambda p: p.name)
def test_yaml_is_tidy(path):
    """Each YAML file reads cleanly: right indentation, no tabs, no repeated keys."""
    from yamllint import linter                                      # the YAML checker
    from yamllint.config import YamlLintConfig
    config = YamlLintConfig("""
extends: default
rules:
  line-length: disable          # long sentences are fine
  document-start: disable       # no need for --- at the top
  comments: {min-spaces-from-content: 1}
  comments-indentation: disable
  truthy: {check-keys: false}
""")
    problems = [p for p in linter.run(path.read_text(encoding="utf-8"), config) if p.level == "error"]
    assert not problems, f"{path.name}:\n" + "\n".join(f"  line {p.line}: {p.desc}" for p in problems)


# ---------------------------------------------------------------- data files: required fields

def need(item, keys, where):
    """Fail with a clear message if any of `keys` is missing or empty in `item`."""
    missing = [k for k in keys if not item.get(k)]
    assert not missing, f"{where} is missing: {', '.join(missing)}"


def test_navigation():
    items = load("navigation.yml")
    for i, item in enumerate(items, 1):
        need(item, ["id", "label", "url"], f"navigation.yml item {i}")
        assert page_exists(item["url"]), f"navigation.yml: no page at {item['url']}"


def test_contact():
    c = load("contact.yml")
    need(c, ["emails", "elsewhere", "footer_blurb", "where", "form_endpoint"], "contact.yml")
    for e in c["emails"]:
        need(e, ["address", "short", "long"], f"contact.yml email {e.get('address')}")
        assert re.fullmatch(r"[^@\s]+@[^@\s]+\.[a-z]+", e["address"]), f"contact.yml: '{e['address']}' doesn't look like an email address"
    for link in c["elsewhere"]:
        need(link, ["label", "url"], "contact.yml elsewhere link")
        assert link["url"].startswith("https://"), f"contact.yml: {link['url']} should start with https://"
    assert c["form_endpoint"].startswith("https://script.google.com/") and c["form_endpoint"].endswith("/exec"), \
        "contact.yml: form_endpoint should be the Google script's address ending in /exec"


def test_home():
    h = load("home.yml")
    need(h.get("hero", {}), ["pill", "heading", "lede"], "home.yml hero")
    need(h.get("about", {}), ["eyebrow", "heading", "lede"], "home.yml about")
    need(h.get("projects", {}), ["eyebrow", "heading", "button"], "home.yml projects")
    need(h.get("news", {}), ["eyebrow", "heading"], "home.yml news")


def test_timeline():
    steps = load("timeline.yml")
    ids, years = [], []
    for i, s in enumerate(steps, 1):
        need(s, ["id", "year", "when", "title", "text"], f"timeline.yml step {i}")
        assert re.fullmatch(r"j-\d{4}", s["id"]), f"timeline.yml step {i}: id should look like j-2026"
        ids.append(s["id"]); years.append(int(s["year"]))
        if s.get("link"):
            need(s["link"], ["text", "url"], f"timeline.yml step {i} link")
    assert len(ids) == len(set(ids)), "timeline.yml: two steps have the same id"
    assert years == sorted(years), "timeline.yml: steps should go from oldest to newest"


def test_news():
    for i, n in enumerate(load("news.yml"), 1):
        need(n, ["when", "what", "note"], f"news.yml item {i}")
        assert re.fullmatch(r"[A-Z][a-z]{2} \d{4}", n["when"]), f"news.yml item {i}: 'when' should look like Oct 2026"


def test_projects():
    p = load("projects.yml")
    assert p.get("tiles"), "projects.yml needs a 'tiles' list"
    for i, t in enumerate(p["tiles"], 1):
        need(t, ["url", "tag", "title", "blurb", "picture"], f"projects.yml tile {i}")
        assert page_exists(t["url"]), f"projects.yml tile {i}: no page at {t['url']}"
        pic = t["picture"]
        assert pic in ("ring", "schelling") or (ROOT / pic.lstrip("/")).is_file(), \
            f"projects.yml tile {i}: picture '{pic}' is not 'ring', 'schelling' or an image that exists"
    assert any(t.get("featured") for t in p["tiles"]), "projects.yml: no tile has featured: true, so the home page has none"
    for i, c in enumerate(p.get("more", []), 1):
        need(c, ["tag", "title", "text", "meta"], f"projects.yml more card {i}")


# ---------------------------------------------------------------- pages

PAGES = page_files()


def test_pages_were_found():
    assert len(PAGES) >= 7, f"only {len(PAGES)} pages found; expected at least 7"


@pytest.mark.parametrize("path", PAGES, ids=lambda p: str(p.relative_to(ROOT)))
def test_page_front_matter(path):
    """Each page's front matter reads cleanly and points to things that exist."""
    fm = front_matter(path)
    where = path.relative_to(ROOT)
    assert fm.get("title") or fm.get("full_title"), f"{where}: add a title"
    assert fm.get("description"), f"{where}: add a description (shown by search engines)"
    assert 20 <= len(fm["description"]) <= 240, f"{where}: the description should be 20 to 240 characters"
    layout = fm.get("layout", "default")
    assert (LAYOUTS / f"{layout}.html").is_file(), f"{where}: there is no layout called '{layout}'"
    nav_ids = {n["id"] for n in load("navigation.yml")} | {"home"}
    if fm.get("nav"):
        assert fm["nav"] in nav_ids, f"{where}: nav '{fm['nav']}' should be one of {sorted(nav_ids)}"
    for key in ("scripts", "styles"):
        for f in fm.get(key) or []:
            assert (ROOT / f.lstrip("/")).is_file(), f"{where}: {key} lists {f}, which doesn't exist"
    for effect in fm.get("effects") or []:
        assert (INCLUDES / "effects" / f"{effect}.html").is_file(), f"{where}: no effect called '{effect}' in _includes/effects/"
    for b in fm.get("buttons") or []:
        need(b, ["text", "url"], f"{where} button")
    for box in fm.get("details") or []:
        assert box.get("heading") and (box.get("text") or box.get("items")), f"{where}: each Details box needs a heading and a text or items"


def test_project_pages_have_tiles():
    """Every project page has a tile in projects.yml, so Previous/Next links work."""
    tile_urls = {t["url"] for t in load("projects.yml")["tiles"]}
    for path in PAGES:
        if front_matter(path).get("layout") == "project":
            url = "/" + str(path.parent.relative_to(ROOT)).replace("\\", "/") + "/"
            assert url in tile_urls, f"{path.relative_to(ROOT)} has no tile in projects.yml (url {url})"


def test_cv_page_keeps_its_raw_block():
    """The CV page's text is wrapped in {% raw %} so Jekyll leaves it exactly as written."""
    text = (ROOT / "cv" / "index.html").read_text(encoding="utf-8")
    assert "{% raw %}" in text and "{% endraw %}" in text, "cv/index.html lost its {% raw %} ... {% endraw %} lines"


# ---------------------------------------------------------------- privacy (WEBSITE-RULES.md, rule 1)

def text_files():
    """Every text file that becomes part of the site (scripts are checked after the build)."""
    for path in ROOT.rglob("*"):
        if path.is_file() and path.suffix in (".html", ".md", ".yml", ".yaml", ".txt", ".json", ".xml") \
                and not set(path.relative_to(ROOT).parts) & (SKIP_DIRS - {"_data", "_layouts", "_includes"}):
            yield path


def test_no_phone_number_in_source():
    found = []
    for path in text_files():
        found += [f"{path.relative_to(ROOT)}: {p}" for p in phone_problems(path.read_text(encoding="utf-8", errors="ignore"))]
    assert not found, "Rule 1: no phone number on the website. Found:\n" + "\n".join(found)


def test_no_phone_field_in_data():
    for path in DATA.glob("*.yml"):
        assert not re.search(r"^\s*-?\s*(phone|mobile|tel)\s*:", path.read_text(encoding="utf-8"), re.M | re.I), \
            f"{path.name} has a phone field. Rule 1: never put the phone number on the website."


def test_cv_yaml_is_not_in_this_repo():
    """cv.yaml holds the phone number, so it must never be copied into this public repo."""
    copies = [p for p in ROOT.rglob("cv.y*ml") if "node_modules" not in p.parts]
    assert not copies, f"cv.yaml must stay in the CV repo, not here: {copies}"


def git_tracked():
    """Files git is keeping track of (empty if git isn't available)."""
    git = shutil.which("git")
    if not git:
        return []
    out = subprocess.run([git, "ls-files"], cwd=ROOT, capture_output=True, text=True)
    return out.stdout.splitlines()


def test_rules_file_is_not_committed():
    """You asked to keep WEBSITE-RULES.md out of git for now."""
    assert "WEBSITE-RULES.md" not in git_tracked(), "WEBSITE-RULES.md is committed; you asked to keep it out for now"


# ---------------------------------------------------------------- scripts and styles

JS_FILES = sorted((ROOT / "assets" / "js").rglob("*.js"))


@pytest.mark.parametrize("path", JS_FILES, ids=lambda p: str(p.relative_to(ROOT)))
def test_javascript_has_no_syntax_errors(path):
    node = shutil.which("node")
    if not node:
        pytest.skip("Node.js isn't installed, so scripts can't be checked")
    out = subprocess.run([node, "--check", str(path)], capture_output=True, text=True)
    assert out.returncode == 0, f"{path.relative_to(ROOT)} has a mistake:\n{out.stderr}"


@pytest.mark.parametrize("path", sorted((ROOT / "assets" / "css").rglob("*.css")), ids=lambda p: p.name)
def test_css_has_no_syntax_errors(path):
    tinycss2 = pytest.importorskip("tinycss2")                       # the CSS reader
    rules = tinycss2.parse_stylesheet(path.read_text(encoding="utf-8"), skip_comments=True, skip_whitespace=True)
    errors = [r for r in rules if r.type == "error"]
    for r in rules:                                                  # also look inside each rule's { ... }
        if r.type == "qualified-rule":
            errors += [d for d in tinycss2.parse_declaration_list(r.content, skip_comments=True, skip_whitespace=True)
                       if d.type == "error"]
    assert not errors, f"{path.name}: " + "; ".join(f"line {e.source_line}: {e.message}" for e in errors)


# ---------------------------------------------------------------- nothing private (WEBSITE-RULES.md, rule 2)

# File names that suggest private or unfinished work. Drafts live in your private places
# (the CV repo, your notes), never in this public repo, not even in Jekyll's _drafts folder.
PRIVATE_NAMES = re.compile(r"(^|/)(_drafts/|.*(draft|keeper|private|secret|personal-notes|todo).*|.*\bnotes?\.(md|txt)$|cv\.ya?ml$|\.env.*)", re.I)


def committed_files():
    """Files that are in git, or staged to be committed next (what the public will be able to see)."""
    return [f for f in git_tracked() if (ROOT / f).is_file()]


def test_no_private_files_are_committed():
    bad = [f for f in committed_files() if PRIVATE_NAMES.search(f) and not f.startswith("tests/")]
    assert not bad, ("Rule 2: nothing private on the public repo. These look like drafts or private files:\n  "
                     + "\n  ".join(bad) + "\nTake them out with:  git restore --staged <file>")


def test_no_unpublished_pages():
    """A page marked draft or unpublished is hidden from the site, but its words would still be public on GitHub."""
    bad = [str(p.relative_to(ROOT)) for p in PAGES
           if front_matter(p).get("draft") or front_matter(p).get("published") is False]
    assert not bad, "Rule 2: keep drafts in a private place, not in this repo: " + ", ".join(bad)


def test_only_public_emails():
    """The only email addresses in the repo are the public ones listed in _data/contact.yml."""
    public = {e["address"].lower() for e in load("contact.yml")["emails"]}
    found = set()
    for f in committed_files():
        path = ROOT / f
        if path.suffix in (".html", ".md", ".yml", ".yaml", ".js", ".css", ".gs", ".py", ".txt", ".json", ".xml"):
            for email in re.findall(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}", path.read_text(encoding="utf-8", errors="ignore"), re.I):
                if email.lower() not in public and not email.lower().endswith(("@example.com", "@anthropic.com")):
                    found.add(f"{email} in {f}")
    assert not found, "Rule 2: these email addresses aren't in your public list (_data/contact.yml):\n  " + "\n  ".join(sorted(found))


def test_no_unpublished_papers_in_source():
    """Papers in preparation stay in the private CV repo, never on this public site.

    README.md is skipped: it's the editing guide, it never goes on the site, and it has to
    talk about the CV repo's statuses to explain them.
    """
    found = []
    for path in text_files():
        if path.name == "README.md":
            continue
        for p in unpublished_problems(path.read_text(encoding="utf-8", errors="ignore")):
            found.append(f"{path.relative_to(ROOT)}: {p}")
    assert not found, ("Papers in preparation stay in your private CV repo. Found:\n  " + "\n  ".join(found))


def test_cv_page_has_no_manuscripts_section():
    text = (ROOT / "cv" / "index.html").read_text(encoding="utf-8")
    assert 'id="manuscripts"' not in text, "cv/index.html has a Manuscripts section; papers in preparation stay private"


def test_no_downloadable_cv():
    """You chose to keep the CV on the web page only, in one version: no PDF, no Print or Download link."""
    pdfs = [f for f in committed_files() if f.lower().endswith(".pdf")]
    assert not pdfs, "The CV stays on the web page only. Take these PDFs out: " + ", ".join(pdfs)
    page = (ROOT / "tools" / "cv_template.html").read_text(encoding="utf-8") + (ROOT / "_includes" / "footer.html").read_text(encoding="utf-8")
    assert ".pdf" not in page and "print()" not in page, "The CV page or footer links to a PDF or a Print button again"

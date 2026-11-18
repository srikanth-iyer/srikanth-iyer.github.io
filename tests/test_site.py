"""
Checks on the built website (the _site folder that Jekyll makes).

Run with:  python tests/run_tests.py quick   (builds the site first)
The checks marked "slow" run only with:  python tests/run_tests.py full
"""

import re                 # text patterns
import shutil             # finds programs such as java
import subprocess         # runs the HTML checker
from pathlib import Path

import pytest
from bs4 import BeautifulSoup   # reads HTML pages

from helpers import SITE, phone_problems, unpublished_problems

if not (SITE / "index.html").is_file():
    pytest.skip("The site isn't built yet: run  python tests/run_tests.py quick", allow_module_level=True)

PAGES = sorted(SITE.rglob("*.html"))                       # every built page


def soup_of(path):
    """Read a built page so the tests can look inside it."""
    return BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")


def name(path):
    return str(path.relative_to(SITE)).replace("\\", "/")


def target_of(page, href):
    """Turn a link on `page` into (file it points to, #part or None). None for links to other sites."""
    if re.match(r"^[a-z]+:", href) or href.startswith("//"):
        return None, None                                   # https:, mailto: and so on
    path, _, frag = href.partition("#")
    if not path:
        return page, frag or None                           # a link to a part of the same page
    base = SITE if path.startswith("/") else page.parent
    target = (base / path.lstrip("/")).resolve()
    if target.is_dir() or path.endswith("/"):
        target = target / "index.html"
    return target, frag or None


@pytest.mark.parametrize("page", PAGES, ids=name)
def test_page_basics(page):
    """Each page has a title, a description, a language, one main heading and one main part."""
    s = soup_of(page)
    assert s.html.get("lang") == "en", f"{name(page)}: <html lang> is missing"
    assert s.title and s.title.get_text(strip=True), f"{name(page)}: no <title>"
    desc = s.find("meta", attrs={"name": "description"})
    assert desc and len(desc.get("content", "")) >= 20, f"{name(page)}: description missing or too short"
    assert s.find("meta", attrs={"name": "viewport"}), f"{name(page)}: no viewport tag, so phones would zoom out"
    assert len(s.find_all("h1")) == 1, f"{name(page)}: should have exactly one main heading (h1)"
    assert len(s.find_all("main")) == 1, f"{name(page)}: should have exactly one <main>"
    ids = [el["id"] for el in s.find_all(id=True)]
    dupes = {i for i in ids if ids.count(i) > 1}
    assert not dupes, f"{name(page)}: these ids are used twice: {dupes}"


@pytest.mark.parametrize("page", PAGES, ids=name)
def test_links_and_pictures_work(page):
    """Every link and picture inside the site points to something that exists, including #parts of pages."""
    s = soup_of(page)
    broken = []
    for tag, attr in (("a", "href"), ("img", "src"), ("script", "src"), ("link", "href")):
        for el in s.find_all(tag):
            href = el.get(attr)
            if href is None:
                continue
            if not href.strip():
                broken.append(f"empty {attr} on a <{tag}>")
                continue
            target, frag = target_of(page, href)
            if target is None:
                if href.startswith("http:"):
                    broken.append(f"{href} should use https://")
                continue
            if not target.is_file():
                broken.append(f"{href} (no such file)")
            elif frag and target.suffix == ".html" and not soup_of(target).find(id=frag):
                broken.append(f"{href} (no part called #{frag} on that page)")
    assert not broken, f"{name(page)}:\n  " + "\n  ".join(broken)


@pytest.mark.parametrize("page", PAGES, ids=name)
def test_pictures_have_descriptions(page):
    """Every <img> has an alt text (empty is fine for decoration), width and height (stops the page jumping)."""
    problems = []
    for img in soup_of(page).find_all("img"):
        if img.get("alt") is None:
            problems.append(f"{img.get('src')}: no alt text")
        if not (img.get("width") and img.get("height")):
            problems.append(f"{img.get('src')}: add width and height")
    assert not problems, f"{name(page)}:\n  " + "\n  ".join(problems)


@pytest.mark.parametrize("page", PAGES, ids=name)
def test_markdown_and_templates_came_out_clean(page):
    """No leftover Markdown or template code shows as text, and no empty headings, paragraphs or links."""
    s = soup_of(page)
    for bad in s(["script", "style", "code", "pre"]):
        bad.decompose()                                      # code samples may contain these on purpose
    text = s.get_text(" ")
    leftovers = {
        "**": "bold that didn't turn bold", "__": "underscores that didn't turn bold",
        "](": "a Markdown link that didn't become a link", "{:": "a {: .class} line kramdown didn't use",
        "{{": "template code", "{%": "template code", "```": "a code fence", "&lt;": "an HTML tag shown as text",
        "markdown=\"1\"": "a markdown=\"1\" that wasn't used",
    }
    found = [f"{why} ('{mark}')" for mark, why in leftovers.items() if mark in text]
    found += [f"a line starting with '#' (a heading that didn't turn into one)"
              for line in text.splitlines() if re.match(r"^\s*#{1,6} ", line)]
    for tag in s.find_all(["p", "h1", "h2", "h3", "h4", "li", "a"]):
        if not tag.get_text(strip=True) and not tag.find(["img", "svg", "canvas", "i"]) \
                and not tag.get("aria-label") and not tag.get("id") and "status" not in tag.get("class", []):
            found.append(f"an empty <{tag.name}> {tag.get('class') or ''}")
    assert not found, f"{name(page)}:\n  " + "\n  ".join(found)


def test_header_highlights_the_right_page():
    """The header marks the page you're on (Projects on project pages, CV on the CV, and so on)."""
    expect = {"projects/index.html": "Projects", "projects/dct/index.html": "Projects",
              "projects/thinky/index.html": "Projects", "cv/index.html": "CV", "contact/index.html": "Contact"}
    for page, label in expect.items():
        current = soup_of(SITE / page).select("header.top [aria-current=page]")
        assert [a.get_text(strip=True) for a in current] == [label], f"{page}: header should highlight {label}"


def test_project_pages_link_to_each_other():
    """Previous and Next at the bottom of each project page lead to real project pages."""
    for page in sorted((SITE / "projects").glob("*/index.html")):
        nav = soup_of(page).find("nav", class_="next")
        assert nav and len(nav.find_all("a")) == 2, f"{name(page)}: the Previous/Next links are missing"


# ---------------------------------------------------------------- privacy (rule 1)

def test_no_phone_number_in_built_site():
    found = []
    for path in SITE.rglob("*"):
        if path.suffix in (".html", ".xml", ".txt", ".json", ".js", ".css", ".svg"):
            text = path.read_text(encoding="utf-8", errors="ignore")
            words = path.suffix not in (".js", ".css", ".svg")   # in code and drawings, rows of numbers are normal
            found += [f"{name(path)}: {p}" for p in phone_problems(text, shapes=words)]
    assert not found, "Rule 1: no phone number on the website. Found:\n" + "\n".join(found)


@pytest.mark.parametrize("pdf", sorted(SITE.rglob("*.pdf")), ids=name)
def test_no_phone_number_in_pdfs(pdf):
    pypdf = pytest.importorskip("pypdf")                     # reads the text inside PDFs
    text = "\n".join(p.extract_text() or "" for p in pypdf.PdfReader(str(pdf)).pages)
    assert not phone_problems(text), f"Rule 1: {name(pdf)} seems to contain a phone number"


# ---------------------------------------------------------------- unpublished papers stay private

def test_no_unpublished_papers_in_built_site():
    found = []
    for path in SITE.rglob("*"):
        if path.suffix in (".html", ".xml", ".txt", ".json"):
            found += [f"{name(path)}: {p}" for p in unpublished_problems(path.read_text(encoding="utf-8", errors="ignore"))]
    assert not found, "Papers in preparation stay in your private CV repo. Found:\n  " + "\n  ".join(found)


@pytest.mark.parametrize("pdf", sorted(SITE.rglob("*.pdf")), ids=name)
def test_no_unpublished_papers_in_pdfs(pdf):
    pypdf = pytest.importorskip("pypdf")                     # reads the text inside PDFs
    text = "\n".join(p.extract_text() or "" for p in pypdf.PdfReader(str(pdf)).pages)
    found = unpublished_problems(text)
    assert not found, f"{name(pdf)} lists papers in preparation: {found}"


# ---------------------------------------------------------------- full HTML check (slow)

@pytest.mark.slow
def test_html_is_valid():
    """Every page passes the W3C's HTML checker (the Nu validator). Needs Java and  npm install."""
    java = shutil.which("java")
    if not java:
        pytest.skip("Java isn't installed, so the HTML checker can't run")
    jar = SITE.parent / "node_modules" / "vnu-jar" / "build" / "dist" / "vnu.jar"
    if not jar.is_file():
        pytest.skip("The HTML checker isn't installed yet: run  npm install")
    pages = [str(p) for p in PAGES]
    out = subprocess.run([java, "-jar", str(jar), "--errors-only", "--format", "text", *pages],
                         capture_output=True, text=True, encoding="utf-8", errors="replace")
    report = "\n".join(l for l in (out.stdout + out.stderr).splitlines() if not l.startswith("Picked up JAVA"))
    assert out.returncode == 0, "The HTML checker found problems:\n" + report[-4000:]

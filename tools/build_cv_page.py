"""
build_cv_page.py - turn the CV data file into the website's scrollable CV page.

The CV lives in one YAML file in the CV repository (data/cv.yaml). This script
reads that file and writes cv/index.html for the website, so the page and the
PDFs always come from the same facts. The page it writes is a Jekyll page: a
short front matter block on top, then the CV itself; the site's layout adds the
header, footer and styles when GitHub Pages (or `bundle exec jekyll build`) builds it.

Run it from the website folder:

    python tools/build_cv_page.py ../cv/data/cv.yaml

What it leaves out, on purpose:
  * The phone number. It never reads person.phone, and it stops with an error
    if the number shows up in the page anyway (rule 1 in WEBSITE-RULES.md).
  * Entries with `in: []` (private records that print nowhere).
  * Entries with status `submitted` or `tentative` (they never go public).
  * The whole `manuscripts` list (papers in preparation stay in the private CV
    repo; the checks stop the build if one shows up on the site).

Nothing here copies cv.yaml into the website repository: the website is public,
and cv.yaml holds the phone number.
"""

import datetime     # turns "2025-01" into "Jan 2025"
import html         # escapes <, > and & so text can't break the page
import re           # finds *italics* and [links](...) in the text
import sys          # reads the command-line argument and exits on errors
from pathlib import Path   # handles file paths on any operating system

import yaml         # reads the YAML file (pip install pyyaml)

# Where this script lives, and where the finished page goes.
SITE = Path(__file__).resolve().parent.parent
OUT = SITE / "cv" / "index.html"
TEMPLATE = SITE / "tools" / "cv_template.html"

HIDDEN_STATUSES = {"submitted", "tentative"}   # these never appear in public
STATUS_LABELS = {"upcoming": "forthcoming", "accepted": "abstract accepted"}


# ----------------------------------------------------------------------------
# Small helpers
# ----------------------------------------------------------------------------

def public(item):
    """True if an entry may appear on the website."""
    if not isinstance(item, dict):
        return True
    if item.get("status") in HIDDEN_STATUSES:
        return False
    if "in" in item and not item["in"]:          # `in: []` means "print nowhere"
        return False
    return True


def keep(items):
    """Return only the public entries of a list (an empty list if there is none)."""
    return [x for x in (items or []) if public(x)]


def md(text):
    """Escape text for HTML, then turn *word* into italics and [label](url) into a link."""
    if text is None:
        return ""
    s = html.escape(str(text).strip())
    # [label](https://...) becomes a link that opens normally
    s = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", r'<a href="\2" rel="noopener">\1</a>', s)
    # *word* becomes <em>word</em>
    s = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", s)
    return s


def month(value):
    """'2025-01' -> 'Jan 2025'; 2018 -> '2018'; 'present' -> 'present'."""
    if value is None:
        return ""
    if isinstance(value, (datetime.date, datetime.datetime)):
        return value.strftime("%b %Y")
    v = str(value)
    if re.fullmatch(r"\d{4}-\d{2}(-\d{2})?", v):
        return datetime.date(int(v[:4]), int(v[5:7]), 1).strftime("%b %Y")
    return v


def when(e):
    """The date text for an entry: date_display if given, otherwise start to end."""
    if e.get("date_display"):
        return html.escape(str(e["date_display"]))
    start, end = month(e.get("start")), month(e.get("end"))
    if e.get("end_note") and end:
        end += f" ({e['end_note']})"
    if start and end and start != end:
        return f"{start} – {end}"
    return html.escape(start or end or month(e.get("date")))


def authors(names):
    """Join author names, with Srikanth's name in bold."""
    out = []
    for n in names or []:
        out.append(f"<b>{html.escape(n)}</b>" if n == "Srikanth Iyer" else html.escape(n))
    return ", ".join(out)


def bullets(highlights):
    """A <ul> of the public highlight texts (the long wording)."""
    items = [f"<li>{md(h.get('text') if isinstance(h, dict) else h)}</li>" for h in keep(highlights)]
    return f"<ul>{''.join(items)}</ul>" if items else ""


def entry(title, date="", sub="", body="", extra_class=""):
    """One CV entry: title and date on the first line, details underneath."""
    parts = [f'<div class="entry {extra_class}">', f'<div class="t">{title}</div>', f'<div class="d">{date}</div>']
    if sub:
        parts.append(f'<div class="s">{sub}</div>')
    parts.append(body)
    parts.append("</div>")
    return "".join(parts)


def join(*bits):
    """Join the non-empty pieces with ' · '."""
    return " · ".join(b for b in bits if b)


# ----------------------------------------------------------------------------
# One function per CV section. Each returns (id, heading, html) or None.
# ----------------------------------------------------------------------------

def sec_summary(cv):
    s = cv.get("summary", {})
    text = s.get("long") or s.get("academic")
    return ("summary", "Summary", f'<p class="summary">{md(text)}</p>') if text else None


def sec_education(cv):
    rows = []
    for e in keep(cv.get("education")):
        details = join(md(e.get("focus")), f"Advisor: {md(e['advisor'])}" if e.get("advisor") else "",
                       f"GPA {md(e['gpa'])}" if e.get("gpa") else "")
        rows.append(entry(md(e["degree"]), when(e), join(md(e["institution"]), md(e.get("location"))),
                          f'<div class="note">{details}</div>' if details else ""))
    return ("education", "Education", "".join(rows)) if rows else None


def sec_positions(cv):
    rows = []
    for p in keep(cv.get("positions")):
        sub = join(md(p.get("organisation")), md(p.get("institution")), md(p.get("location")))
        notes = join(f"Supervisor: {md(p['supervisor'])}" if p.get("supervisor") else "",
                     f"Funded by {md(p['funder'])}" if p.get("funder") else "")
        links = " ".join(f'<a href="{html.escape(l["url"])}" rel="noopener">{html.escape(l["label"])}</a>'
                         for l in p.get("links", []))
        body = bullets(p.get("highlights"))
        if notes:
            body += f'<div class="note">{notes}</div>'
        if p.get("tech"):
            body += '<div class="tags">' + "".join(f"<span>{html.escape(t.strip())}</span>" for t in p["tech"].split(",")) + "</div>"
        if links:
            body += f'<div class="note">{links}</div>'
        rows.append(entry(md(p["title"]), when(p), sub, body))
    return ("positions", "Research positions", "".join(rows)) if rows else None


def sec_awards(cv):
    rows = [entry(md(a["name"]), when(a), md(a.get("issuer")),
                  f'<div class="note">{md(a["detail"])}</div>' if a.get("detail") else "", "compact")
            for a in keep(cv.get("awards"))]
    return ("awards", "Awards", "".join(rows)) if rows else None


def sec_talks(cv):
    rows = []
    for t in keep(cv.get("presentations")):
        kind = {"talk": "Talk", "poster": "Poster", "recorded-talk": "Recorded talk"}.get(t.get("kind"), "")
        status = STATUS_LABELS.get(t.get("status"), "")
        sub = join(md(t.get("venue")), md(t.get("location")))
        notes = join(kind, status, md(t.get("venue_note")),
                     f"presented by {md(t['presented_by'])}" if t.get("presented_by") else "")
        body = f'<div class="note">{authors(t.get("authors"))}</div>'
        if notes:
            body += f'<div class="s">{notes}</div>'
        rows.append(entry(md(t["title"]), when(t), sub, body))
    return ("talks", "Talks and posters", "".join(rows)) if rows else None


def sec_publications(cv):
    rows = [entry(md(p.get("title")), when(p), md(p.get("venue")), f'<div class="note">{authors(p.get("authors"))}</div>')
            for p in keep(cv.get("publications"))]
    return ("publications", "Publications", "".join(rows)) if rows else None


def sec_projects(cv):
    rows = []
    for p in keep(cv.get("projects")):
        body = bullets(p.get("highlights"))
        if p.get("collaborators"):
            body += f'<div class="note">With {md(p["collaborators"])}</div>'
        if p.get("tech"):
            body += '<div class="tags">' + "".join(f"<span>{html.escape(t.strip())}</span>" for t in p["tech"].split(",")) + "</div>"
        rows.append(entry(md(p["title"]), when(p), "", body))
    return ("projects", "Research projects", "".join(rows)) if rows else None


def sec_software(cv):
    rows = []
    for s in keep(cv.get("software")):
        name = md(s.get("full_name") or s.get("name"))
        if s.get("url"):
            name = f'<a href="{html.escape(s["url"])}" rel="noopener">{name}</a>'
        rows.append(entry(name, when(s), join(md(s.get("role")), md(s.get("language"))), bullets(s.get("highlights"))))
    return ("software", "Software", "".join(rows)) if rows else None


def sec_teaching(cv):
    rows = [entry(md(t["course"]), when(t), join(md(t.get("role")), md(t.get("institution"))),
                  f'<div class="note">{md(t["detail"])}</div>' if t.get("detail") else "")
            for t in keep(cv.get("teaching"))]
    return ("teaching", "Teaching", "".join(rows)) if rows else None


def sec_service(cv):
    rows = []
    for s in keep(cv.get("service")) + keep(cv.get("workshops")):
        rows.append(entry(md(s.get("role")), when(s), md(s.get("organisation")),
                          f'<div class="note">{md(s["detail"])}</div>' if s.get("detail") else "", "compact"))
    return ("service", "Service and workshops", "".join(rows)) if rows else None


def sec_memberships(cv):
    rows = [entry(md(m["name"]), when(m), extra_class="compact") for m in keep(cv.get("memberships"))]
    return ("memberships", "Memberships", "".join(rows)) if rows else None


def sec_industry(cv):
    rows = []
    for j in keep(cv.get("industry")):
        rows.append(entry(md(j["title"]), when(j), join(md(j.get("organisation")), md(j.get("location"))),
                          bullets(j.get("highlights"))))
    return ("film", "Film, advertising and writing", "".join(rows)) if rows else None


def sec_skills(cv):
    rows = "".join(f"<dt>{md(s['category'])}</dt><dd>{md(s['items'])}</dd>" for s in keep(cv.get("skills")))
    return ("skills", "Skills", f'<dl class="kv">{rows}</dl>') if rows else None


def sec_coursework(cv):
    c = cv.get("coursework") or {}
    if not public(c) or not c.get("items"):
        return None
    items = "".join(f"<li>{md(x)}</li>" for x in c["items"])
    return ("coursework", "Graduate coursework", f'<ul class="inline-list">{items}</ul>')


def sec_languages(cv):
    l = cv.get("languages") or {}
    if not public(l) or not l.get("items"):
        return None
    rows = "".join(f"<dt>{md(x['name'])}</dt><dd>{md(x['level'])}</dd>" for x in l["items"])
    return ("languages", "Languages", f'<dl class="kv">{rows}</dl>')


SECTIONS = [sec_summary, sec_education, sec_positions, sec_awards, sec_publications, sec_talks,
            sec_projects, sec_software, sec_teaching, sec_service, sec_memberships,
            sec_industry, sec_skills, sec_coursework, sec_languages]

# Short names for the side menu, so it stays narrow
TOC_NAMES = {"positions": "Research", "talks": "Talks", "projects": "Projects", "service": "Service",
             "film": "Film and ads", "coursework": "Coursework"}


# ----------------------------------------------------------------------------
# Put it together
# ----------------------------------------------------------------------------

def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else SITE.parent / "cv" / "data" / "cv.yaml"
    if not src.exists():
        sys.exit(f"ERROR: cannot find {src}. Pass the path to cv.yaml, e.g. python tools/build_cv_page.py ../cv/data/cv.yaml")
    cv = yaml.safe_load(src.read_text(encoding="utf-8"))
    person = cv["person"]

    sections = [s for s in (f(cv) for f in SECTIONS) if s]
    body = "\n".join(f'<section id="{sid}" aria-labelledby="h-{sid}"><h2 id="h-{sid}">{title}</h2>{content}</section>'
                     for sid, title, content in sections)
    toc = "\n".join(f'<li><a href="#{sid}">{TOC_NAMES.get(sid, title)}</a></li>' for sid, title, _ in sections)

    # Contact line: every email and link, never the phone
    emails = " · ".join(f'<a href="mailto:{html.escape(e["address"])}">{html.escape(e["address"])}</a>'
                        for e in person.get("emails", []))
    links = " · ".join(f'<a href="{html.escape(l["url"])}" rel="noopener">{html.escape(l["label"])}</a>'
                       for l in keep(person.get("links")))

    page = TEMPLATE.read_text(encoding="utf-8")
    page = (page.replace("{{NAME}}", html.escape(person["name"]))
                .replace("{{LOCATION}}", html.escape(person.get("location", "")))
                .replace("{{EMAILS}}", emails)
                .replace("{{LINKS}}", links)
                .replace("{{UPDATED}}", month(cv.get("meta", {}).get("last_updated")) or "")
                .replace("{{TOC}}", toc)
                .replace("{{SECTIONS}}", body))

    # Links: use https:// everywhere, so the site's tests (and browsers) don't flag insecure links
    page = page.replace('href="http://', 'href="https://')

    # Safety check: the phone number must never reach the public page
    phone = str(person.get("phone") or "")
    digits = re.sub(r"\D", "", phone)
    if phone and (phone in page or (len(digits) >= 7 and digits[-7:] in re.sub(r"\D", "", page))):
        sys.exit("ERROR: the phone number ended up in the CV page. Nothing was written.")

    OUT.write_text(page, encoding="utf-8")
    print(f"wrote {OUT.relative_to(SITE)} ({len(sections)} sections)")


if __name__ == "__main__":
    main()

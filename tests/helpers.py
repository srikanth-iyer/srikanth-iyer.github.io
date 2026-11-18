"""Small helpers shared by the tests."""

import os                 # reads settings from the environment (like PHONE_TO_BLOCK)
import re                 # text patterns
from pathlib import Path  # file paths on any operating system

ROOT = Path(__file__).resolve().parent.parent   # the website folder (one up from tests/)
SITE = ROOT / "_site"                           # where Jekyll puts the built website

# Something shaped like a phone number: digits with optional spaces, dots, dashes, brackets or a +
PHONE_SHAPE = re.compile(r"\+?\(?\d[\d  ().\-]{7,}\d")


def private_phone_digits():
    """Your own number, if you've told the tests about it, so they can look for it exactly.

    Either set the environment variable PHONE_TO_BLOCK, or put the number in
    tests/private-phone.txt (that file is ignored by git, so it never goes public).
    Only the last 7 digits are used.
    """
    number = os.environ.get("PHONE_TO_BLOCK", "")
    private_file = Path(__file__).with_name("private-phone.txt")
    if not number and private_file.is_file():
        number = private_file.read_text(encoding="utf-8")
    digits = re.sub(r"\D", "", number)               # keep only the digits
    return digits[-7:] if len(digits) >= 7 else ""


def phone_problems(text, shapes=True):
    """List anything in `text` that looks like a phone number (rule 1 in WEBSITE-RULES.md).

    shapes=False only looks for your own number (for code and drawings, where rows of
    numbers are normal).
    """
    mine = private_phone_digits()
    found = []
    for match in PHONE_SHAPE.finditer(text):
        chunk = match.group(0)
        digits = re.sub(r"\D", "", chunk)
        if mine and mine in digits:
            found.append("your phone number")                  # never print the number itself
        elif shapes and 10 <= len(digits) <= 15 and re.search(r"[ ().+\-]", chunk.strip()):
            found.append(f"something that looks like a phone number: '{chunk.strip()}'")
    return found


# Words that mark an unpublished paper. Your papers in preparation stay in the private CV repo
# (you asked for this on 18 Nov 2026), so none of these may show up on the site or in its PDF.
UNPUBLISHED_WORDS = re.compile(
    r"\bmanuscripts?\b|\bin[ -]prep(aration)?\b|\bpre-?prints?\b|\bunder review\b|\bworking papers?\b|\bsubmitted to\b",
    re.I)


def private_titles():
    """Exact titles you never want on the site, one per line in tests/private-titles.txt.

    That file is ignored by git (like private-phone.txt), so the titles themselves never go public.
    Lines starting with # are notes and are skipped.
    """
    path = Path(__file__).with_name("private-titles.txt")
    if not path.is_file():
        return []
    lines = path.read_text(encoding="utf-8").splitlines()
    return [l.strip() for l in lines if l.strip() and not l.strip().startswith("#")]


def unpublished_problems(text):
    """List signs of an unpublished paper in `text`: the words above, or a title from private-titles.txt."""
    found = sorted({m.group(0).lower() for m in UNPUBLISHED_WORDS.finditer(text)})
    flat = " ".join(text.lower().split())                        # ignore line breaks and double spaces
    found += ["a title from private-titles.txt" for t in private_titles() if " ".join(t.lower().split()) in flat]
    return found

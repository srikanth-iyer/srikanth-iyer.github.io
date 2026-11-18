"""
One command for every check on the website. Works on Windows, Mac and Linux.

    python tests/run_tests.py setup   install the tools once and switch on the automatic checks
    python tests/run_tests.py quick   fast checks (a few seconds): runs by itself before each commit
    python tests/run_tests.py full    everything, including the browser tests: runs before each push
    python tests/run_tests.py links   also try every link to other websites (needs internet; slow)

If a tool isn't installed, its checks are skipped with a note saying what to install,
except in CI (on GitHub), where a missing tool counts as a failure.
"""

import os            # environment settings
import shutil        # finds installed programs (ruby, node, java)
import subprocess    # runs those programs
import sys           # exit codes and the Python that's running this
import time          # times each step
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # the website folder
CI = os.environ.get("CI") == "true"                     # True when running on GitHub
os.environ.setdefault("LANG", "C.UTF-8")                # Jekyll reads files as UTF-8 even on Windows
os.environ.setdefault("LC_ALL", "C.UTF-8")
os.environ.setdefault("RUBYOPT", "-Eutf-8")

failures, skipped = [], []


def say(text):
    print(f"\n=== {text}", flush=True)


def tool(name):
    """The full path of an installed program, or None (finds .bat/.cmd versions on Windows too)."""
    return shutil.which(name)


def run(title, cmd, needs=None, install_hint=""):
    """Run one step, print how it went, and remember failures."""
    say(title)
    if needs and not tool(needs):
        note = f"{title}: skipped, {needs} isn't installed. {install_hint}"
        (failures if CI else skipped).append(note)
        print("   " + note)
        return False
    start = time.time()
    result = subprocess.run(cmd, cwd=ROOT)
    ok = result.returncode == 0
    print(f"   {'passed' if ok else 'FAILED'} in {time.time() - start:.1f}s")
    if not ok:
        failures.append(title)
    return ok


def pytest(*args):
    return [sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", *args]


def build():
    """Build _site with Jekyll. Any warning counts as a failure, so small mistakes don't slip through."""
    say("Build the site with Jekyll")
    if not tool("bundle"):
        note = "Build: skipped, Ruby/Jekyll isn't installed. Install Ruby, then run: python tests/run_tests.py setup"
        (failures if CI else skipped).append(note)
        print("   " + note)
        return False
    start = time.time()
    result = subprocess.run([tool("bundle"), "exec", "jekyll", "build", "--strict_front_matter"], cwd=ROOT,
                            capture_output=True, text=True, encoding="utf-8", errors="replace")
    output = result.stdout + result.stderr
    warnings = [l for l in output.splitlines() if ("warning" in l.lower() or "error" in l.lower()) and "faraday" not in l.lower()]
    ok = result.returncode == 0 and not warnings
    if not ok:
        print(output)                                    # show Jekyll's own message
        failures.append("Build the site with Jekyll" + (" (warnings above)" if warnings else ""))
    print(f"   {'passed' if ok else 'FAILED'} in {time.time() - start:.1f}s")
    return ok


def quick():
    run("Check the files you edit (YAML, pages, privacy, scripts)", pytest("tests/test_source.py"))
    if build():
        run("Check the built pages (links, headings, Markdown, phone number)", pytest("tests/test_site.py", "-m", "not slow"))


def full():
    quick()
    if failures:
        return                                           # no point testing pages that didn't build
    run("Check the HTML with the W3C checker", pytest("tests/test_site.py", "-m", "slow", "-rs"))
    run("Check links and pictures (html-proofer)",
        [tool("bundle") or "bundle", "exec", "htmlproofer", "_site", "--disable-external",
         "--checks", "Links,Images,Scripts,Favicon,OpenGraph"], needs="bundle")
    run("Browser tests: phone and laptop, light and dark, accessibility",
        [tool("npx") or "npx", "playwright", "test"], needs="npx",
        install_hint="Install Node.js, then run: python tests/run_tests.py setup")
    print("   Screenshots of every page are in test-results/screens/")


def links():
    """Links to other websites change without warning, so this is a report, not a block."""
    if build():
        say("Check links to other websites (report only)")
        subprocess.run([tool("bundle") or "bundle", "exec", "htmlproofer", "_site", "--checks", "Links",
                        "--ignore-status-codes", "999,429,403"], cwd=ROOT)


def setup():
    """Install everything once, and switch on the automatic checks."""
    run("Switch on the automatic checks (git hooks in .githooks/)", ["git", "config", "core.hooksPath", ".githooks"], needs="git")
    run("Install the Python test tools", [sys.executable, "-m", "pip", "install", "-r", "requirements-test.txt"])
    run("Install Jekyll and html-proofer (Ruby)", [tool("bundle") or "bundle", "install"], needs="bundle",
        install_hint="Install Ruby+Devkit from https://rubyinstaller.org, then run this again.")
    if run("Install the browser test tools (Node.js)", [tool("npm") or "npm", "install"], needs="npm",
           install_hint="Install Node.js LTS from https://nodejs.org, then run this again."):
        run("Download the test browser", [tool("npx") or "npx", "playwright", "install", "chromium"], needs="npx")
    if not tool("java"):
        skipped.append("Java isn't installed, so the W3C HTML checker will be skipped (optional: https://adoptium.net)")


STEPS = {"quick": quick, "full": full, "links": links, "setup": setup}

if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "quick"
    if what not in STEPS:
        sys.exit(f"Use one of: {', '.join(STEPS)}")
    STEPS[what]()
    print()
    for note in skipped:
        print("note: " + note)
    if failures:
        print("Didn't pass: " + "; ".join(failures))
        print("Fix the problems above, then try again. To skip the checks once: git commit --no-verify (or git push --no-verify)")
        sys.exit(1)
    print("All checks passed.")

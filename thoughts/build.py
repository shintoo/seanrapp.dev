#!/usr/bin/env python3
"""
Build the thoughts blog from markdown.

    uv run thoughts/build.py           build everything once
    uv run thoughts/build.py --watch   rebuild whenever a post or the template changes

thoughts/posts/<slug>.md   published -> thoughts/<slug>.html, and gets a planet on the index
thoughts/drafts/<slug>.md  private (git-ignored) -> thoughts/drafts/<slug>.html, no planet

Each post starts with a small header block:

    ---
    title: My post
    date: 2026-10-01
    color: #82a7a2        (optional) planet color
    size: 12              (optional) planet size in px
    css: /thoughts/x.css  (optional) extra stylesheets, comma separated
    ---
"""

import argparse
import datetime
import html
import json
import re
import sys
import time
import zlib
from pathlib import Path
from xml.etree import ElementTree as etree

import markdown
from markdown.extensions import Extension
from markdown.treeprocessors import Treeprocessor

HERE = Path(__file__).resolve().parent
POSTS = HERE / "posts"
DRAFTS = HERE / "drafts"
TEMPLATE = HERE / "template.html"
INDEX = HERE / "index.html"

PLANET_COLORS = ["#82a7a2", "#efcabe", "#8aaf9c", "#c9b6e4", "#e8d49a", "#a9c4e8", "#d9a3a3"]
DEFAULT_PLANET_SIZE = 12

INDEX_START = "// posts:start"
INDEX_END = "// posts:end"


class FigureTreeprocessor(Treeprocessor):
    """Turn image-only paragraphs into <figure>s and open outside links in a new tab."""

    def run(self, root):
        for p in root.iter("p"):
            imgs = list(p)
            if not imgs or any(el.tag != "img" or (el.tail or "").strip() for el in imgs):
                continue
            if (p.text or "").strip():
                continue
            p.tag = "figure"
            if len(imgs) > 1:
                p.set("class", "row")
            caption = imgs[0].attrib.pop("title", None) if len(imgs) == 1 else None
            if caption:
                figcaption = etree.SubElement(p, "figcaption")
                figcaption.text = caption

        for img in root.iter("img"):
            img.set("loading", "lazy")

        for a in root.iter("a"):
            if a.get("href", "").startswith(("http://", "https://")):
                a.set("target", "_blank")
                a.set("rel", "noopener")


class FigureExtension(Extension):
    def extendMarkdown(self, md):
        md.treeprocessors.register(FigureTreeprocessor(md), "figures", 5)


def parse_post(path):
    text = path.read_text(encoding="utf-8")
    meta = {}
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if match:
        for line in match.group(1).splitlines():
            if ":" in line:
                key, value = line.split(":", 1)
                meta[key.strip().lower()] = value.strip()
        text = text[match.end():]

    if "title" not in meta or "date" not in meta:
        raise ValueError(f"{path.name}: needs a 'title' and a 'date' (YYYY-MM-DD) at the top")
    date = datetime.date.fromisoformat(meta["date"])

    body = markdown.markdown(
        text,
        extensions=["extra", "smarty", FigureExtension()],
        extension_configs={"footnotes": {"BACKLINK_TEXT": "&#8617;"}},
    )
    return {
        "slug": path.stem,
        "source": path,
        "title": meta["title"],
        "date": date,
        "color": meta.get("color"),
        "size": int(meta["size"]) if "size" in meta else None,
        "css": [s.strip() for s in meta.get("css", "").split(",") if s.strip()],
        "body": body,
    }


def render_post(post, template):
    head = "\n".join(f'  <link rel="stylesheet" href="{html.escape(href)}">' for href in post["css"])
    values = {
        "source": post["source"].relative_to(HERE.parent).as_posix(),
        "title": html.escape(post["title"]),
        "iso_date": post["date"].isoformat(),
        "date": f'{post["date"]:%B} {post["date"].day}, {post["date"].year}',
        "head": head,
        "content": post["body"],
    }
    return re.sub(r"\{\{(\w+)\}\}", lambda m: values[m.group(1)], template)


def planets(posts):
    """Oldest post orbits closest to the star; spacing tightens as more posts are added."""
    posts = sorted(posts, key=lambda p: p["date"])
    step = min(0.12, 0.32 / max(len(posts) - 1, 1))
    result = []
    for i, post in enumerate(posts):
        a = 0.17 + i * step
        result.append({
            "title": post["title"],
            "href": f'/thoughts/{post["slug"]}.html',
            "color": post["color"] or PLANET_COLORS[zlib.crc32(post["slug"].encode()) % len(PLANET_COLORS)],
            "size": post["size"] or DEFAULT_PLANET_SIZE,
            "semiMajorAxis": round(a, 3),
            "semiMinorAxis": round(a * 0.4, 3),
            # Kepler-ish: outer planets drift slower
            "speed": round(0.3 * (0.17 / a) ** 1.5, 3),
        })
    return result


def update_index(posts):
    source = INDEX.read_text(encoding="utf-8")
    start, end = source.find(INDEX_START), source.find(INDEX_END)
    if start == -1 or end == -1:
        raise ValueError(f"index.html is missing the '{INDEX_START}' / '{INDEX_END}' markers")
    line_start = source.rfind("\n", 0, start) + 1
    indent = source[line_start:start]
    data = json.dumps(planets(posts), indent=2).replace("\n", "\n" + indent)
    block = (f"{INDEX_START} (generated by thoughts/build.py, don't edit by hand)\n"
             f"{indent}const articles = {data};\n{indent}")
    INDEX.write_text(source[:start] + block + source[end:], encoding="utf-8")


def build():
    template = TEMPLATE.read_text(encoding="utf-8")
    published = []
    for folder, out_dir, is_draft in ((POSTS, HERE, False), (DRAFTS, DRAFTS, True)):
        for path in sorted(folder.glob("*.md")):
            post = parse_post(path)
            out = out_dir / f"{post['slug']}.html"
            out.write_text(render_post(post, template), encoding="utf-8")
            print(f"  {'draft' if is_draft else 'post '}  {out.relative_to(HERE.parent)}")
            if not is_draft:
                published.append(post)
    update_index(published)
    print(f"  index  {len(published)} planet(s)")


def watched_files():
    return [TEMPLATE, *POSTS.glob("*.md"), *DRAFTS.glob("*.md")]


def main():
    parser = argparse.ArgumentParser(description="Build the thoughts blog from markdown.")
    parser.add_argument("--watch", action="store_true", help="rebuild when files change")
    args = parser.parse_args()

    DRAFTS.mkdir(exist_ok=True)
    build()
    if not args.watch:
        return

    print("watching for changes (ctrl+c to stop)")
    last = {p: p.stat().st_mtime for p in watched_files()}
    while True:
        time.sleep(0.5)
        now = {p: p.stat().st_mtime for p in watched_files()}
        if now != last:
            last = now
            print(time.strftime("[%H:%M:%S] rebuilding"))
            try:
                build()
            except Exception as e:
                print(f"  error: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()

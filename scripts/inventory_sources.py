#!/usr/bin/env python3
"""Inventory the unchanged Claude export using only the Python standard library."""

import hashlib
import json
import re
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "проект в Клоде"
PROJECT = SOURCE / "project"
OUTPUT = ROOT / "docs" / "inventory"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class SourceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.screens = []
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if "data-screen-label" in attributes:
            label = attributes["data-screen-label"]
            ancestors = [a.get("id") for _, a in self.stack if a.get("id")]
            label_id = re.match(r"^([a-z][a-z0-9]*)\s", label)
            self.screens.append({
                "source_id": attributes.get("id") or (ancestors[-1] if ancestors else None),
                "label_id": label_id.group(1) if label_id else None,
                "label": label,
            })
        for key in ("src", "href"):
            if attributes.get(key):
                self.references.append({"tag": tag, "attribute": key, "url": attributes[key]})
        if tag not in VOID:
            self.stack.append((tag, attributes))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)


def main():
    files, html_files = [], []
    missing = defaultdict(set)
    for path in sorted(SOURCE.rglob("*")):
        if not path.is_file() or path.name == ".DS_Store":
            continue
        data = path.read_bytes()
        relative = path.relative_to(SOURCE).as_posix()
        files.append({"path": relative, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
        if path.suffix != ".html":
            continue
        parser = SourceParser()
        parser.feed(data.decode("utf-8"))
        external = set()
        for ref in parser.references:
            url = ref["url"]
            if any(marker in url for marker in ("{", "}")):
                continue
            parsed = urlsplit(url)
            if parsed.scheme or parsed.netloc:
                if parsed.scheme in ("http", "https"):
                    external.add(url)
                continue
            if not parsed.path:
                continue
            target = (path.parent / unquote(parsed.path)).resolve()
            if not target.exists():
                key = target.relative_to(SOURCE).as_posix() if target.is_relative_to(SOURCE) else str(target)
                missing[key].add(relative)
        html_files.append({"file": relative, "screen_count": len(parser.screens), "screens": parser.screens, "external_html_references": sorted(external)})

    report = {
        "source": "проект в Клоде",
        "method": "Static inventory of files, data-screen-label attributes, and literal HTML src/href paths. Excludes .DS_Store. Does not verify runtime behavior, JS/CSS URLs, network availability, or licenses.",
        "file_count": len(files),
        "total_bytes": sum(f["bytes"] for f in files),
        "extensions": dict(sorted(Counter(Path(f["path"]).suffix or "[no extension]" for f in files).items())),
        "files": files,
        "html": html_files,
        "missing_local_html_references": [{"target": key, "referenced_by": sorted(refs)} for key, refs in sorted(missing.items())],
    }
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / "sources.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    lines = ["# Каталог экранов исходного проекта", "", "Автоматическая выгрузка из HTML. Макет может описывать экран, шторку, вариант или состояние. Наличие макета не означает готовность логики.", ""]
    for filename in ("Ключи - Все экраны.dc.html", "Ключи - Десктоп.dc.html"):
        entry = next(item for item in html_files if item["file"] == "project/" + filename)
        lines += [f"## {filename}", "", f"Макетов с атрибутом `data-screen-label`: {entry['screen_count']}.", "", "| ID контейнера | ID из подписи | Экран или состояние |", "|---|---|---|"]
        for screen in entry["screens"]:
            cells = [screen["source_id"] or "—", screen["label_id"] or "—", screen["label"]]
            lines.append("| " + " | ".join(str(c).replace("|", "\\|") for c in cells) + " |")
        lines.append("")
    (OUTPUT / "screens.md").write_text("\n".join(lines) + "\n")
    print(json.dumps({"files": report["file_count"], "bytes": report["total_bytes"], "html": len(html_files), "missing_local_html_references": len(missing), "output": str(OUTPUT)}, ensure_ascii=False))


if __name__ == "__main__":
    main()

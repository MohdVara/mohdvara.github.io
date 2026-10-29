"""Audit-only: python with fonttools[woff]; no application dependency.

Usage: python scripts/typography-font-audit.py
Inspect the binary cmap, not just a declared CSS unicode-range.
"""
import hashlib
import json
import unicodedata
from pathlib import Path

from fontTools.ttLib import TTFont

folder = Path("public/fonts/editorial")
manifest = json.loads((folder / "manifest.json").read_text())
asset = folder / manifest["asset"]
assert hashlib.sha256(asset.read_bytes()).hexdigest() == manifest["sha256"]
font = TTFont(asset)
cmap = font.getBestCmap()
assert sorted(cmap) == manifest["coverage"]["codepoints"]
required = set()
for locale in manifest["locales"]:
    catalog = json.loads(Path(f"src/i18n/locales/{locale}.json").read_text())
    for value in catalog.values():
        if isinstance(value, str):
            required.update(c for c in value if "LATIN" in unicodedata.name(c, "") or unicodedata.category(c).startswith("M") or 0x21 <= ord(c) <= 0x7E)
missing = sorted(c for c in required if ord(c) not in cmap)
assert not missing, repr(missing)
print(json.dumps({"asset": str(asset), "version": manifest["version"], "cmapCodepoints": len(cmap), "requiredLatinCharacters": len(required), "missing": missing, "sha256": manifest["sha256"]}, indent=2))

#!/usr/bin/env python3
"""Generate a sitemap.xml from data/seeds/properties.json."""

from __future__ import annotations

import json
import os
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Any

PROPERTIES_FILE = os.path.join("data", "seeds", "properties.json")
OUTPUT_DIR = os.path.join("apps", "web", "public")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "sitemap.xml")

BASE_URL = "https://landmapprod.vercel.app"


def load_properties() -> list[dict[str, Any]]:
    if not os.path.exists(PROPERTIES_FILE):
        print(f"⚠️  Properties file not found: {PROPERTIES_FILE}")
        return []
    with open(PROPERTIES_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data if isinstance(data, list) else []


def generate_sitemap(properties: list[dict[str, Any]]) -> str:
    """Generate a sitemap XML string with up to 50 property URLs + static pages."""
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Static pages
    static_pages = [
        {"loc": f"{BASE_URL}/", "priority": "1.0", "changefreq": "daily"},
        {"loc": f"{BASE_URL}/search", "priority": "0.9", "changefreq": "daily"},
        {"loc": f"{BASE_URL}/map", "priority": "0.8", "changefreq": "daily"},
        {"loc": f"{BASE_URL}/favorites", "priority": "0.4", "changefreq": "weekly"},
        {"loc": f"{BASE_URL}/compare", "priority": "0.3", "changefreq": "weekly"},
    ]

    for page in static_pages:
        url = ET.SubElement(urlset, "url")
        loc = ET.SubElement(url, "loc")
        loc.text = page["loc"]
        priority = ET.SubElement(url, "priority")
        priority.text = page["priority"]
        changefreq = ET.SubElement(url, "changefreq")
        changefreq.text = page["changefreq"]
        lastmod = ET.SubElement(url, "lastmod")
        lastmod.text = today

    # Property detail pages (up to 50)
    for prop in properties[:50]:
        prop_id = prop.get("id", "")
        if not prop_id:
            continue

        updated = prop.get("updatedAt", today)
        if isinstance(updated, str):
            updated = updated[:10]  # YYYY-MM-DD

        url = ET.SubElement(urlset, "url")
        loc = ET.SubElement(url, "loc")
        loc.text = f"{BASE_URL}/property/{prop_id}"
        lastmod = ET.SubElement(url, "lastmod")
        lastmod.text = updated
        priority = ET.SubElement(url, "priority")
        priority.text = "0.7"
        changefreq = ET.SubElement(url, "changefreq")
        changefreq.text = "weekly"

    # Pretty-print using the stdlib indenter (valid XML, no manual string
    # surgery). The previous hand-rolled indentation split on "><" and
    # re-added brackets, which corrupted the output into invalid XML
    # (`<<urlset>` / `<//url>`), breaking search-engine parsing entirely.
    ET.indent(urlset, space="  ")
    body = ET.tostring(urlset, encoding="unicode")
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + body


def main() -> int:
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    properties = load_properties()
    sitemap = generate_sitemap(properties)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(sitemap)
        f.write("\n")

    prop_count = len(properties)
    url_count = 3 + min(prop_count, 50)  # home + search + map + properties
    print(f"✅ Generated sitemap with {url_count} URLs → {OUTPUT_FILE}")
    print(f"   Static pages: 3 (home, search, map)")
    print(f"   Property URLs: {min(prop_count, 50)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

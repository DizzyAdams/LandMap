#!/usr/bin/env python3
"""Extract all Lovable routes: HTML + JS chunks + content extraction."""

import urllib.request, urllib.error
import re, json, os, sys, html
from urllib.parse import urljoin
from collections import OrderedDict

BASE = "https://landmap-insight.lovable.app"
OUT = os.path.dirname(os.path.abspath(__file__))
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
TIMEOUT = 20

ROUTES = ["/regions", "/favorites", "/compare", "/dashboard", "/admin", "/plans", "/auth", "/map", "/search"]

def fetch(url, label=""):
    """Fetch a URL and return body bytes, or None on error."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        resp = urllib.request.urlopen(req, timeout=TIMEOUT)
        body = resp.read()
        print(f"  OK  [{resp.status}] {label or url} ({len(body)} bytes)")
        return body
    except Exception as e:
        print(f"  FAIL [{label or url}]: {e}")
        return None

def extract_js_chunks(html_text):
    """From HTML text, find all .js script src links that look like chunks."""
    # Pattern for <script ... src="...file.js?...">
    chunk_urls = []
    # Match script tags with src
    for m in re.finditer(r'<script[^>]*src\s*=\s*["\']([^"\']*\.js[^"\']*)["\']', html_text, re.IGNORECASE):
        src = m.group(1).strip()
        if src:
            chunk_urls.append(urljoin(BASE, src))
    # Also find import() calls, dynamic imports, etc.
    for m in re.finditer(r'import\s*\(\s*["\']([^"\']*\.js[^"\']*)["\']', html_text):
        src = m.group(1).strip()
        if src:
            chunk_urls.append(urljoin(BASE, src))
    # Deduplicate
    seen = set()
    unique = []
    for u in chunk_urls:
        if u not in seen:
            seen.add(u)
            unique.append(u)
    return unique

def extract_components(html_text):
    """Extract likely React component names from HTML."""
    # data-component, data-page, class names that look like components
    components = set()
    for m in re.finditer(r'data-(?:component|page|testid)\s*=\s*["\']([^"\']+)["\']', html_text, re.IGNORECASE):
        components.add(m.group(1))
    for m in re.finditer(r'class\s*=\s*["\'][^"\']*?([A-Z][a-zA-Z]+(?:View|Page|Card|List|Form|Modal|Panel|Section|Grid|Row|Item|Button|Input|Select|Table|Chart|Map|Sidebar|Header|Footer|Layout|Shell|Screen|Step|Stage))["\']', html_text):
        components.add(m.group(1))
    return sorted(components)

def extract_api_endpoints(html_text):
    """Extract likely API endpoints from HTML."""
    endpoints = set()
    # fetch calls
    for m in re.finditer(r'["\'](https?://[^"\']*?/api/[^"\']*)["\']', html_text):
        endpoints.add(m.group(1))
    # axios/api paths
    for m in re.finditer(r'["\'](/api/[^"\']+)["\']', html_text):
        endpoints.add(m.group(1))
    return sorted(endpoints)

def extract_data_structures(html_text):
    """Extract JSON objects and data structures from JS inline."""
    datas = []
    # JSON.parse calls
    for m in re.finditer(r'JSON\.parse\s*\(\s*["\']([^"\']+)["\']', html_text):
        try:
            datas.append(json.loads(m.group(1)))
        except:
            pass
    # window.__INITIAL_STATE__ or __NEXT_DATA__ or __NUXT__
    for m in re.finditer(r'window\.__INITIAL_STATE__\s*=\s*(\{.+?\});', html_text, re.DOTALL):
        try:
            datas.append({"__INITIAL_STATE__": json.loads(m.group(1))})
        except:
            datas.append({"__INITIAL_STATE__": m.group(1)[:200]})
    for m in re.finditer(r'__NEXT_DATA__\s*=\s*(\{.+?\});', html_text, re.DOTALL):
        try:
            datas.append({"__NEXT_DATA__": json.loads(m.group(1))})
        except:
            datas.append({"__NEXT_DATA__": m.group(1)[:200]})
    return datas

def extract_all_from_html(html_text, route, html_file):
    """Extract and save all metadata from HTML."""
    components = extract_components(html_text)
    endpoints = extract_api_endpoints(html_text)
    datas = extract_data_structures(html_text)
    
    meta = {
        "route": route,
        "url": urljoin(BASE, route),
        "html_file": html_file,
        "html_size_bytes": len(html_text.encode()),
        "components_found": components,
        "api_endpoints_found": endpoints,
        "datas_found": datas,
    }
    return meta

def extract_from_chunk(js_text, chunk_url, chunk_file):
    """Extract metadata from JS chunk: strings, imports, classes, etc."""
    results = OrderedDict()
    
    # Imports / requires
    imports = set()
    for m in re.finditer(r'(?:import\s+(?:[\w*{}, ]+\s+from\s+)?["\']([^"\']+)["\']|require\s*\(\s*["\']([^"\']+)["\'])', js_text):
        imp = m.group(1) or m.group(2)
        if imp and not imp.startswith('.') and not imp.startswith('/'):
            imports.add(imp)
    
    # Exported functions/components
    exports = set()
    for m in re.finditer(r'exports?\s+(?:default\s+)?(?:function|const|let|var|class)\s+(\w+)', js_text):
        exports.add(m.group(1))
    for m in re.finditer(r'export\s+\{([^}]+)\}', js_text):
        for name in m.group(1).split(','):
            n = name.strip().split(' as ')[0].strip()
            if n:
                exports.add(n)
    
    # API endpoint strings
    apis = set()
    for m in re.finditer(r'["\'](/api/[^"\']+)["\']', js_text):
        apis.add(m.group(1))
    for m in re.finditer(r'["\']https?://[^"\']*/api/[^"\']*["\']', js_text):
        apis.add(m.group(1))
    
    # Key strings (potential UI text)
    strings = set()
    for m in re.finditer(r'["\']([A-Z][a-zA-Z\s,:;!?]{4,60})["\']', js_text):
        s = m.group(1).strip()
        if len(s) > 5 and not s.startswith('http') and '\\' not in s:
            strings.add(s)
    
    results['url'] = chunk_url
    results['file'] = chunk_file
    results['size_bytes'] = len(js_text.encode())
    results['imports'] = sorted(imports)
    results['exports'] = sorted(exports)
    results['api_endpoints'] = sorted(apis)
    results['ui_strings'] = sorted(list(strings))[:100]  # cap at 100
    
    return results

def main():
    all_routes_meta = {}
    all_chunks = {}
    
    for route in ROUTES:
        url = urljoin(BASE, route)
        print(f"\n{'='*60}")
        print(f"ROUTE: {route}")
        print(f"{'='*60}")
        
        # 1) Fetch HTML
        body = fetch(url, label=f"route {route}")
        if body is None:
            print(f"  SKIP {route}: no HTML fetched")
            continue
        
        html_text = body.decode('utf-8', errors='replace')
        route_slug = route.strip('/').replace('/', '_') or 'root'
        html_file = f"lovable_{route_slug}.html"
        html_path = os.path.join(OUT, html_file)
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_text)
        print(f"  SAVED: {html_file}")
        
        # 2) Extract metadata from HTML
        meta = extract_all_from_html(html_text, route, html_file)
        
        # 3) Extract JS chunk links
        chunks = extract_js_chunks(html_text)
        print(f"  JS CHUNKS: {len(chunks)} found")
        for c in chunks:
            print(f"    - {c}")
        meta['js_chunks'] = chunks
        
        # 4) Download each chunk
        chunk_results = []
        for i, chunk_url in enumerate(chunks):
            chunk_name = chunk_url.split('/')[-1].split('?')[0]
            if not chunk_name.endswith('.js'):
                chunk_name += f"_{i}.js"
            chunk_file = f"lovable_chunk_{route_slug}_{i}_{chunk_name}"
            # sanitize filename
            chunk_file = re.sub(r'[<>:"/\\|?*]', '_', chunk_file)
            chunk_path = os.path.join(OUT, chunk_file)
            
            chunk_body = fetch(chunk_url, label=f"chunk {i} for {route}")
            if chunk_body is None:
                continue
            
            chunk_text = chunk_body.decode('utf-8', errors='replace')
            with open(chunk_path, 'w', encoding='utf-8') as f:
                f.write(chunk_text)
            
            # Extract from chunk
            chunk_meta = extract_from_chunk(chunk_text, chunk_url, chunk_file)
            chunk_results.append(chunk_meta)
            
            # Also save as .js.txt for easy reading
            txt_path = chunk_path + '.txt'
            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(f"SOURCE: {chunk_url}\n")
                f.write(f"ROUTE: {route}\n")
                f.write(f"SIZE: {len(chunk_text)} chars\n")
                f.write(f"{'='*60}\n\n")
                f.write(chunk_text)
        
        meta['chunk_details'] = chunk_results
        all_routes_meta[route] = meta
        all_chunks[route] = chunk_results
    
    # 5) Save full metadata report
    print(f"\n{'='*60}")
    print(f"GENERATING SUMMARY REPORT")
    print(f"{'='*60}")
    
    report_path = os.path.join(OUT, "lovable_routes_report.json")
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(all_routes_meta, f, indent=2, ensure_ascii=False, default=str)
    print(f"REPORT: {report_path}")
    
    # Also generate a concise text summary
    summary_lines = []
    summary_lines.append("=" * 70)
    summary_lines.append("LOVABLE ROUTES EXTRACTION SUMMARY")
    summary_lines.append(f"Base URL: {BASE}")
    summary_lines.append(f"Date: {__import__('datetime').datetime.now().isoformat()}")
    summary_lines.append("=" * 70)
    
    for route, meta in all_routes_meta.items():
        summary_lines.append(f"\n--- {route} ---")
        summary_lines.append(f"  HTML: {meta['html_file']} ({meta['html_size_bytes']} bytes)")
        summary_lines.append(f"  Components: {', '.join(meta['components_found'][:20]) or 'none found'}")
        summary_lines.append(f"  API endpoints: {', '.join(meta['api_endpoints_found'][:10]) or 'none found'}")
        summary_lines.append(f"  JS chunks: {len(meta['js_chunks'])}")
        for cd in meta['chunk_details']:
            summary_lines.append(f"    Chunk {cd['file']}: {cd['size_bytes']} bytes, {len(cd['imports'])} imports, {len(cd['exports'])} exports")
    
    summary_path = os.path.join(OUT, "lovable_routes_summary.txt")
    with open(summary_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(summary_lines))
    print(f"SUMMARY: {summary_path}")
    
    # Final print
    print('\n'.join(summary_lines))

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Download ALL Lovable JS chunks from landmap-insight.lovable.app
Each chunk saved as lovable_chunk_<name>.js in the repo root.
Also downloads logo PNG and favicon.
"""
import urllib.request
import urllib.error
import os
import re
import sys
import json
import html

BASE = "https://landmap-insight.lovable.app"
OUT = os.path.dirname(os.path.abspath(__file__))
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
TIMEOUT = 30

# All chunks to download (from Vite dependency map + extra discovered)
CHUNKS = [
    # Main bundles
    ("index-DxhHPzjf.js",     "index"),
    ("jsx-runtime-Blx5QhbK.js","jsx-runtime"),
    ("link-DEwX4sNB.js",      "link"),
    ("useNavigate-B9NytbkM.js","useNavigate"),
    ("dist-uVrDPB1T.js",      "dist-uVrDPB1T"),

    # Route-specific chunks
    ("onboarding-DHaK9QkG.js",  "onboarding"),
    ("plans-DaZ4cK95.js",       "plans"),
    ("auth-DwcFmrMz.js",        "auth"),
    ("regions-BegDTHyi.js",     "regions"),
    ("favorites-CNwkVppf.js",   "favorites"),
    ("compare-DcIoo8kQ.js",     "compare"),
    ("dashboard-B-oBOM4f.js",   "dashboard"),
    ("admin-9xHJJGoM.js",       "admin"),

    # UI component chunks
    ("button-Cctgrcjc.js",     "button"),
    ("input-ChyqBZ8B.js",      "input"),
    ("select-CgSBCNYU.js",     "select"),
    ("tabs-BUtzxd64.js",       "tabs"),
    ("table-QFlarETH.js",      "table"),
    ("search-BwbsOwpz.js",     "search"),
    ("star-D452QTFE.js",       "star"),
    ("check-DpgHz7qx.js",      "check"),
    ("sparkles-BYg7_t1S.js",   "sparkles"),
    ("x-C3MH7wO3.js",          "x"),
    ("building-2-Cd11ZteK.js", "building-2"),
    ("map-pin-DKg9QPkq.js",   "map-pin"),
    ("trending-up-DcxbiPo_.js","trending-up"),

    # Data / hooks chunks
    ("dist-CIOVZQx4.js",      "dist-CIOVZQx4"),
    ("dist-KRgR23I7.js",      "dist-KRgR23I7"),
    ("dist-C-MOfDlW.js",      "dist-C-MOfDlW"),
    ("dist-47UNNw-8.js",      "dist-47UNNw-8"),
    ("Combination-DOjKx6Rm.js","Combination"),
    ("route-KCuQkdZH.js",     "route"),
    ("useMutation-c6b5nXHy.js","useMutation"),
    ("use-auth-BRLLoENq.js",  "use-auth"),
    ("landmap-format-9a--Y2ye.js","landmap-format"),
    ("logo-C7rxAA8V.js",      "logo"),
]

# Binary/non-JS assets
ASSETS = [
    ("landmap-logo-transparent.png", "__l5e/assets-v1/c79a98a5-a90a-4d60-8f04-04d1f6a9454c/landmap-logo-transparent.png"),
    ("favicon.ico",               "favicon.ico"),
]

def fetch(url, label=""):
    """Fetch a URL and return body bytes, or None on error."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        resp = urllib.request.urlopen(req, timeout=TIMEOUT)
        body = resp.read()
        print(f"  OK  [{resp.status}] {label or url} ({len(body)} bytes)")
        return body
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code} [{label or url}]: {e.reason}")
        return None
    except Exception as e:
        print(f"  FAIL [{label or url}]: {e}")
        return None


def extract_from_js(js_text, chunk_name):
    """Extract structured info from JS chunk text."""
    info = {
        "chunk": chunk_name,
        "components": set(),
        "ptbr_texts": set(),
        "classnames": set(),
        "hooks": set(),
        "api_calls": set(),
        "data_structures": set(),
        "imports": set(),
        "svg_icons": set(),
    }

    # React component names (function/const definitions)
    for m in re.finditer(r'(?:function|const|let|var)\s+([A-Z][a-zA-Z0-9_]+)\s*(?:[=:(]|\s*=>)', js_text):
        name = m.group(1)
        if any(x in name for x in ['View','Page','Card','Form','Modal','Panel','Button','Input',
                                     'Select','Table','Chart','Map','Sidebar','Header','Footer',
                                     'Layout','Shell','Screen','Step','Grid','Row','Item','List',
                                     'Badge','Avatar','Icon','Menu','Nav','Tab','Alert','Dialog',
                                     'Drawer','Popover','Tooltip','Dropdown','Section','Banner',
                                     'Carousel','Collapse','Divider','Empty','Skeleton','Spinner',
                                     'Progress','Slider','Switch','Tag','Upload','Wizard',
                                     'Provider','Context','Factory','Controller','Container',
                                     'Checkbox','Radio','Toggle','Accordion','Breadcrumb',
                                     'Pagination','Timeline','Tree','Stack','Group','Box','Flex',
                                     'Center','Grid','Label','Link','Text','Title','Heading',
                                     'Paragraph','Span','Image','IconButton','ActionIcon',
                                     'ThemeProvider','CssBaseline','Notification']):
            info["components"].add(name)

    # PT-BR text strings
    for m in re.finditer(r'["\']((?:[A-Za-zà-ÿÀ-ß][a-zà-ÿ]{2,}(?:\s+(?:[a-zà-ÿA-ZÀ-ß][a-zà-ÿ]{2,})){0,5}))["\']', js_text):
        text = m.group(1)
        # Filter for PT-BR like patterns
        pt_patterns = [
            r'[àáâãäéèêëíìîïóòôõöúùûüç]',  # accented chars
            r'\b(rão|ção|são|tão|mão|pão)\b',
            r'\b(para|como|com|dos|das|mais|mas|que|por|uma|seu|sua|isso|esse|esta|aquele|entre|sobre|depois|antes|durante|através|atrás|dentro|fora|acima|abaixo|nunca|sempre|também|ainda|assim|bem|muito|pouco|grande|pequeno|melhor|pior|primeiro|último|novo|velho|bom|mau|todo|cada|algum|nenhum|qualquer|mesmo|próprio|outro|vários|quanto|tanto|menos|maior|menor)',
            r'[íó]',
            r'[ãõ]',
        ]
        is_pt = False
        for p in pt_patterns:
            if re.search(p, text, re.IGNORECASE):
                is_pt = True
                break
        if is_pt and len(text) > 3:
            info["ptbr_texts"].add(text)

    # Tailwind classNames
    for m in re.finditer(r'className:\s*["\']([^"\']+)["\']', js_text):
        for cls in m.group(1).split():
            info["classnames"].add(cls)
    for m in re.finditer(r'className\s*=\s*["\']([^"\']+)["\']', js_text):
        for cls in m.group(1).split():
            info["classnames"].add(cls)

    # React hooks
    for m in re.finditer(r'(use[A-Z][a-zA-Z0-9]+)\s*\(', js_text):
        hook = m.group(1)
        if hook not in ('use','useId','useCallback','useContext','useDebugValue','useDeferredValue',
                        'useEffect','useImperativeHandle','useInsertionEffect','useLayoutEffect',
                        'useMemo','useOptimistic','useReducer','useRef','useState','useSyncExternalStore',
                        'useTransition','useActionState','useFormStatus','useFormState',
                        'useSearchParams','useParams','usePathname','useRouter','useNavigate',
                        'useLocation','useRoute','useLoaderData','useActionData',
                        'useQuery','useMutation','useInfiniteQuery','useLazyQuery',
                        'useSubscription','useApolloClient',
                        'useSelector','useDispatch','useStore',
                        'useTranslation','useAuth','useUser','useSession',
                        'useToast','useDisclosure','useClipboard','useMediaQuery',
                        'useBreakpointValue','useColorMode','useTheme',
                        'useForm','useFieldArray','useController','useWatch',
                        'useInView','useIntersectionObserver',
                        'useOnClickOutside','useEventListener','useKey',
                        'useAsync','useFetch','useDataSource',
                        'useSupabase','useDatabase','useRealtime'):
            info["hooks"].add(hook)

    # API calls / fetch / supabase
    for m in re.finditer(r'(?:fetch|axios)\s*\(\s*["\']([^"\']+)["\']', js_text, re.IGNORECASE):
        info["api_calls"].add(m.group(1))
    for m in re.finditer(r'(?:from|supabase)\s*\.\s*(?:from|rpc|storage)\s*\(\s*["\']([^"\']+)["\']', js_text):
        info["api_calls"].add(m.group(1))
    for m in re.finditer(r'["\'](/api/[^"\']+)["\']', js_text):
        info["api_calls"].add(m.group(1))

    # Import statements
    for m in re.finditer(r'import\s*(?:\{[^}]*\}|[^;{]+)\s*from\s*["\']([^"\']+)["\']', js_text):
        info["imports"].add(m.group(1))

    # SVG icon references
    for m in re.finditer(r'(["\'`])[^"\'`]*?(?:icon|Icon|svg|SVG)[^"\'`]*?\1', js_text, re.IGNORECASE):
        icon_val = m.group(0)
        if len(icon_val) < 100:
            info["svg_icons"].add(icon_val)

    # Data structures (object literals that look like config/type definitions)
    for m in re.finditer(r'(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(\{(?:[^{}]|\{[^{}]*\}){1,10}\})', js_text):
        try:
            g2 = m.group(2)
            if "{" in g2:
                try:
                    parsed = json.loads(g2.replace("'", "\""))
                    val = json.dumps(parsed)
                except:
                    val = g2[:200]
            else:
                val = g2[:200]
            info["data_structures"].add(f"{m.group(1)} = {val}")
        except:
            pass

    return info


def print_extraction(info):
    """Print extracted info in a readable format."""
    print(f"\n{'='*60}")
    print(f"📦 CHUNK: {info['chunk']}")
    print(f"{'='*60}")

    if info["components"]:
        print(f"\n🧩 COMPONENTES ({len(info['components'])}):")
        for c in sorted(info["components"]):
            print(f"  • {c}")

    if info["ptbr_texts"]:
        print(f"\n🔤 TEXTOS PT-BR ({len(info['ptbr_texts'])}):")
        for t in sorted(info["ptbr_texts"]):
            print(f"  • {t}")

    if info["classnames"]:
        print(f"\n🎨 CLASSNAMES TAILWIND ({len(info['classnames'])}):")
        # Show unique classes, group by category
        all_classes = sorted(info["classnames"])
        # Just show the most distinctive ones
        for c in all_classes[:30]:
            print(f"  • {c}")
        if len(all_classes) > 30:
            print(f"  ... e mais {len(all_classes) - 30}")

    if info["hooks"]:
        print(f"\n🪝 HOOKS ({len(info['hooks'])}):")
        for h in sorted(info["hooks"]):
            print(f"  • {h}()")

    if info["api_calls"]:
        print(f"\n📡 CHAMADAS API ({len(info['api_calls'])}):")
        for a in sorted(info["api_calls"]):
            print(f"  • {a}")

    if info["imports"]:
        print(f"\n📦 IMPORTS ({len(info['imports'])}):")
        for i_ in sorted(info["imports"]):
            print(f"  • {i_}")

    if info["svg_icons"]:
        print(f"\n🎯 ÍCONES SVG ({len(info['svg_icons'])}):")
        for s in sorted(info["svg_icons"])[:15]:
            print(f"  • {s}")

    if info["data_structures"]:
        print(f"\n📊 ESTRUTURAS DE DADOS ({len(info['data_structures'])}):")
        for d in sorted(info["data_structures"])[:10]:
            print(f"  • {d[:150]}")


def save_with_extraction(body, filename, chunk_name):
    """Save chunk and extract info."""
    filepath = os.path.join(OUT, filename)
    with open(filepath, 'wb') as f:
        f.write(body)
    print(f"\n✅ Saved: {filename} ({len(body)} bytes)")

    # Extract info from JS
    if filename.endswith('.js'):
        try:
            js_text = body.decode('utf-8', errors='replace')
            info = extract_from_js(js_text, chunk_name)
            print_extraction(info)

            # Save extraction metadata
            meta_file = os.path.join(OUT, f"{filename}.meta.json")
            info_serializable = {
                "chunk": chunk_name,
                "file": filename,
                "size_bytes": len(body),
                "components": sorted(info["components"]),
                "ptbr_texts": sorted(list(info["ptbr_texts"])),
                "classnames": sorted(list(info["classnames"]))[:100],  # top 100
                "hooks": sorted(list(info["hooks"])),
                "api_calls": sorted(list(info["api_calls"])),
                "imports": sorted(list(info["imports"])),
                "svg_icons": sorted(list(info["svg_icons"]))[:50],
                "data_structures_preview": [d[:200] for d in sorted(info["data_structures"])[:20]],
            }
            with open(meta_file, 'w', encoding='utf-8') as mf:
                json.dump(info_serializable, mf, indent=2, ensure_ascii=False)
            print(f"  📋 Meta saved: {filename}.meta.json")
        except Exception as e:
            print(f"  ⚠️ Error extracting: {e}")


def main():
    print("=" * 70)
    print("🔽 LOVABLE CHUNK DOWNLOADER")
    print(f"   Base: {BASE}")
    print(f"   Out:  {OUT}")
    print("=" * 70)

    # Download all JS chunks
    print("\n" + "=" * 70)
    print("📜 JS CHUNKS")
    print("=" * 70)
    for chunk_file, chunk_name in CHUNKS:
        url = f"{BASE}/assets/{chunk_file}"
        filename = f"lovable_chunk_{chunk_name}.js"
        print(f"\n--- {chunk_name} ({chunk_file}) ---")
        body = fetch(url, chunk_file)
        if body:
            save_with_extraction(body, filename, chunk_name)

    # Download binary assets
    print("\n" + "=" * 70)
    print("🖼️  ASSETS (logo, favicon)")
    print("=" * 70)
    for out_name, asset_path in ASSETS:
        url = f"{BASE}/{asset_path}"
        filename = f"lovable_{out_name}"
        print(f"\n--- {out_name} ---")
        body = fetch(url, out_name)
        if body:
            filepath = os.path.join(OUT, filename)
            with open(filepath, 'wb') as f:
                f.write(body)
            print(f"✅ Saved: {filename} ({len(body)} bytes)")

    print("\n" + "=" * 70)
    print("🏁 COMPLETO!")
    print("=" * 70)


if __name__ == "__main__":
    main()

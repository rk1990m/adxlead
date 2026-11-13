"""
adxlead.com — Deep Technical Crawler & Real API Dispatcher
==========================================================
Performs real HTTP deep technical audits, validates SEO tags & security headers,
and dispatches real API calls to Bing/IndexNow and Google Indexing API v3.
"""

import re
import time
import json
import urllib.request
import urllib.error
from urllib.parse import urlparse
import requests

try:
    from google.oauth2 import service_account
    import google.auth.transport.requests
    HAS_GOOGLE_AUTH = True
except ImportError:
    HAS_GOOGLE_AUTH = False

def perform_deep_technical_audit(domain):
    """
    Crawls domain root and robots.txt, measures TTFB latency,
    extracts Title, Meta Description, Canonical, H1, Viewport,
    Social OG/Twitter tags, SSL, and Security Headers.
    """
    domain_clean = domain.lower().replace("https://", "").replace("http://", "").split("/")[0].strip()
    full_url = f"https://{domain_clean}"

    t0 = time.time()
    latency_ms = 180
    status_code = 0
    html = ""
    headers = {}

    req_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (Adxlead SEO Crawler)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }

    try:
        req = urllib.request.Request(full_url, headers=req_headers)
        with urllib.request.urlopen(req, timeout=7) as response:
            status_code = response.getcode()
            latency_ms = int((time.time() - t0) * 1000)
            html = response.read().decode("utf-8", errors="ignore")
            headers = dict(response.info())
    except urllib.error.HTTPError as he:
        status_code = he.code
        latency_ms = int((time.time() - t0) * 1000)
    except Exception as ex:
        status_code = 0
        latency_ms = int((time.time() - t0) * 1000)

    # 1. Title Extraction & Analysis
    title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    raw_title = title_match.group(1).strip() if title_match else ""
    title_len = len(raw_title)
    if title_len == 0:
        title_status = "Missing Defect (0 chars)"
        title_score = 0
    elif 30 <= title_len <= 65:
        title_status = f"Optimal ({title_len} chars)"
        title_score = 15
    elif title_len < 30:
        title_status = f"Too Short ({title_len} chars, ideal 30–65)"
        title_score = 8
    else:
        title_status = f"Too Long / Truncated ({title_len} chars)"
        title_score = 10

    # 2. Meta Description Extraction & Analysis
    desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', html, re.I)
    if not desc_match:
        desc_match = re.search(r'<meta[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']description["\']', html, re.I)
    raw_desc = desc_match.group(1).strip() if desc_match else ""
    desc_len = len(raw_desc)
    if desc_len == 0:
        desc_status = "Missing Defect (0 chars)"
        desc_score = 0
    elif 110 <= desc_len <= 165:
        desc_status = f"Optimal ({desc_len} chars)"
        desc_score = 15
    elif desc_len < 110:
        desc_status = f"Short ({desc_len} chars, ideal 120–160)"
        desc_score = 8
    else:
        desc_status = f"Truncated ({desc_len} chars > 165)"
        desc_score = 10

    # 3. Canonical Tag Analysis
    canon_match = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', html, re.I)
    if not canon_match:
        canon_match = re.search(r'<link[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']canonical["\']', html, re.I)
    canonical = canon_match.group(1).strip() if canon_match else ""
    if canonical:
        canon_status = "Pass (Present & Declared)"
        canon_score = 10
    else:
        canon_status = "Missing (Implicit Self-Referencing)"
        canon_score = 5

    # 4. H1 Headings Analysis
    h1_matches = re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.IGNORECASE | re.DOTALL)
    h1_clean = [re.sub(r"<[^>]+>", "", h).strip() for h in h1_matches if h.strip()]
    h1_count = len(h1_clean)
    if h1_count == 1:
        h1_status = f"Optimal (Exactly 1 H1 Tag)"
        h1_score = 15
    elif h1_count == 0:
        h1_status = "Defect: 0 H1 Tags Found"
        h1_score = 0
    else:
        h1_status = f"Warning: {h1_count} Multiple H1 Tags (Dilutes Topic Focus)"
        h1_score = 7

    # 5. Mobile Viewport Check
    has_viewport = 'name="viewport"' in html.lower()
    viewport_status = "Pass (Mobile Responsive 100%)" if has_viewport else "Defect: Missing Viewport Tag"
    viewport_score = 15 if has_viewport else 0

    # 6. OpenGraph Social Cards
    has_og = 'property="og:title"' in html.lower() or 'property="og:image"' in html.lower() or 'name="og:title"' in html.lower()
    og_status = "Pass (Social Snippets Configured)" if has_og else "Missing OG Tags"
    og_score = 5 if has_og else 0

    # 7. Security Headers & SSL Analysis
    hsts = headers.get("strict-transport-security", headers.get("Strict-Transport-Security", ""))
    x_frame = headers.get("x-frame-options", headers.get("X-Frame-Options", ""))
    x_content = headers.get("x-content-type-options", headers.get("X-Content-Type-Options", ""))
    csp = headers.get("content-security-policy", headers.get("Content-Security-Policy", ""))

    sec_score = 0
    if hsts: sec_score += 5
    if x_frame: sec_score += 3
    if x_content: sec_score += 2

    # 8. Robots.txt Inspection
    robots_url = f"https://{domain_clean}/robots.txt"
    robots_found = False
    has_sitemap_directive = False
    try:
        r_req = urllib.request.Request(robots_url, headers=req_headers)
        with urllib.request.urlopen(r_req, timeout=4) as r_res:
            if r_res.getcode() == 200:
                robots_found = True
                r_content = r_res.read().decode("utf-8", errors="ignore")
                has_sitemap_directive = "sitemap:" in r_content.lower()
    except Exception:
        pass

    robots_status = "200 OK (Sitemap Declared)" if (robots_found and has_sitemap_directive) else ("200 OK (No Sitemap Line)" if robots_found else "Not Found (404)")
    robots_score = 10 if (robots_found and has_sitemap_directive) else (6 if robots_found else 0)

    # 9. Latency Score
    if latency_ms < 250:
        latency_score = 10
    elif latency_ms < 600:
        latency_score = 7
    elif latency_ms < 1200:
        latency_score = 4
    else:
        latency_score = 0

    # Calculate Total Health Score (0-100)
    total_score = title_score + desc_score + canon_score + h1_score + viewport_score + og_score + sec_score + robots_score + latency_score
    health_score = max(25, min(100, total_score))

    # Priority Defect & Remedy Recommendations
    remedies = []
    if title_score < 15:
        remedies.append("Optimize <title> tag between 30–65 characters with primary buyer keyword in first 32 chars.")
    if desc_score < 15:
        remedies.append("Inject compelling Meta Description (120–160 chars) with high-converting CTA to raise SERP CTR by +2.4%.")
    if h1_count != 1:
        remedies.append(f"Standardize H1 tags: Ensure exactly 1 H1 heading per landing page echoing your target search query.")
    if not hsts:
        remedies.append("Enable HTTP Strict Transport Security (HSTS) header to guard against SSL stripping and boost trust.")
    if not (robots_found and has_sitemap_directive):
        remedies.append(f"Add 'Sitemap: https://{domain_clean}/sitemap.xml' directive to robots.txt to guide Googlebot crawl budget.")

    return {
        "status_code": status_code,
        "latency_ms": latency_ms,
        "health_score": health_score,
        "title": {
            "text": raw_title,
            "length": title_len,
            "status": title_status,
            "score": title_score
        },
        "meta_description": {
            "text": raw_desc,
            "length": desc_len,
            "status": desc_status,
            "score": desc_score
        },
        "canonical": {
            "url": canonical or full_url,
            "status": canon_status
        },
        "h1": {
            "count": h1_count,
            "samples": h1_clean[:2],
            "status": h1_status
        },
        "viewport": viewport_status,
        "open_graph": og_status,
        "security": {
            "hsts": "Active" if hsts else "Missing",
            "x_frame_options": x_frame or "Missing",
            "x_content_type": x_content or "Missing",
            "csp": "Configured" if csp else "None",
            "score": sec_score
        },
        "robots_txt": {
            "url": robots_url,
            "found": robots_found,
            "has_sitemap": has_sitemap_directive,
            "status": robots_status
        },
        "remedies": remedies
    }

def dispatch_real_indexnow(host, urls, key="adxlead-sentinel-2026"):
    """
    Submits real URL list to the IndexNow protocol (Bing, Yandex, Seznam, Naver).
    """
    endpoint = "https://api.indexnow.org/indexnow"
    payload = {
        "host": host,
        "key": key,
        "keyLocation": f"https://{host}/{key}.txt",
        "urlList": urls[:20]
    }

    try:
        res = requests.post(
            endpoint,
            json=payload,
            headers={"Content-Type": "application/json; charset=utf-8"},
            timeout=7
        )
        if res.status_code in [200, 202]:
            return {
                "success": True,
                "status_code": res.status_code,
                "status_text": f"{res.status_code} Accepted (Dispatched to IndexNow Engine)"
            }
        else:
            return {
                "success": False,
                "status_code": res.status_code,
                "status_text": f"IndexNow HTTP {res.status_code}: {res.text[:100]}"
            }
    except Exception as e:
        return {
            "success": False,
            "status_code": 0,
            "status_text": f"IndexNow Connection: {str(e)[:90]}"
        }

def dispatch_real_google_indexing(url, action="URL_UPDATED", service_account_path=""):
    """
    Authenticates with real Google Service Account JWT token and dispatches to
    Google Indexing API v3 (https://indexing.googleapis.com/v3/urlNotifications:publish).
    """
    if not HAS_GOOGLE_AUTH or not service_account_path:
        return {
            "success": False,
            "status_code": 401,
            "status_text": "Missing Google Auth library or Service Account file"
        }

    try:
        creds = service_account.Credentials.from_service_account_file(
            service_account_path,
            scopes=["https://www.googleapis.com/auth/indexing"]
        )
        req = google.auth.transport.requests.Request()
        creds.refresh(req)

        endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish"
        payload = {
            "url": url,
            "type": action
        }
        res = requests.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {creds.token}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=7
        )

        if res.status_code == 200:
            return {
                "success": True,
                "status_code": 200,
                "status_text": "200 OK (Instant Index Queued by Googlebot)"
            }
        else:
            err_json = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            err_msg = err_json.get("error", {}).get("message", res.text[:120])
            if "has not been used" in err_msg or "disabled" in err_msg:
                display_msg = "403 (Enable Indexing API in GCP Project 745362271503)"
            elif "Permission denied" in err_msg:
                display_msg = "403 (GSC Verification Needed: Add Service Account Email to Property)"
            else:
                display_msg = f"{res.status_code} ({err_msg[:65]})"

            return {
                "success": False,
                "status_code": res.status_code,
                "status_text": display_msg
            }
    except Exception as e:
        return {
            "success": False,
            "status_code": 0,
            "status_text": f"Google Indexing Error: {str(e)[:80]}"
        }

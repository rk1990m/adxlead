"""
adxlead.com — SQLite Persistence & History Engine
=================================================
Handles audit persistence, historical rank snapshots, and live indexing logs.
"""

import os
import json
import sqlite3
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "adxlead.db")

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audited_domains (
                domain TEXT PRIMARY KEY,
                full_url TEXT,
                title TEXT,
                latency_ms INTEGER,
                sitemap_url TEXT,
                urls_count INTEGER,
                health_score INTEGER,
                urls_json TEXT,
                unindexed_urls_json TEXT,
                indexed_urls_json TEXT,
                quick_wins_json TEXT,
                negatives_json TEXT,
                rank_tracker_json TEXT,
                technical_audit_json TEXT,
                scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS indexing_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT,
                url TEXT,
                action TEXT,
                google_status TEXT,
                indexnow_status TEXT,
                api_response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rank_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT,
                query TEXT,
                rank TEXT,
                impressions TEXT,
                clicks TEXT,
                ctr TEXT,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()

def save_domain(data):
    domain = data.get("domain", "").lower().strip()
    if not domain:
        return False

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO audited_domains (
                domain, full_url, title, latency_ms, sitemap_url,
                urls_count, health_score, urls_json, unindexed_urls_json,
                indexed_urls_json, quick_wins_json, negatives_json,
                rank_tracker_json, technical_audit_json, scanned_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            domain,
            data.get("full_url", f"https://{domain}"),
            data.get("title", domain),
            data.get("latency_ms", 180),
            data.get("sitemap_url", f"https://{domain}/sitemap.xml"),
            data.get("urls_count", len(data.get("urls", []))),
            data.get("health_score", 85),
            json.dumps(data.get("urls", [])),
            json.dumps(data.get("unindexed_urls", [])),
            json.dumps(data.get("indexed_urls", [])),
            json.dumps(data.get("quick_wins", [])),
            json.dumps(data.get("negatives", [])),
            json.dumps(data.get("rank_tracker", [])),
            json.dumps(data.get("technical_audit", {})),
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))

        # Save rank snapshots for historical trend tracking
        rank_tracker = data.get("rank_tracker", [])
        for item in rank_tracker:
            cursor.execute("""
                INSERT INTO rank_snapshots (domain, query, rank, impressions, clicks, ctr, recorded_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                domain,
                item.get("query", ""),
                item.get("rank", ""),
                item.get("impressions", "0"),
                item.get("clicks", "0"),
                item.get("ctr", "0%"),
                datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            ))

        conn.commit()
    return True

def get_domain(domain):
    domain = domain.lower().strip()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM audited_domains WHERE domain = ?", (domain,))
        row = cursor.fetchone()
        if not row:
            return None

        # Build clean dict
        d = dict(row)
        try:
            d["urls"] = json.loads(d.get("urls_json") or "[]")
            d["unindexed_urls"] = json.loads(d.get("unindexed_urls_json") or "[]")
            d["indexed_urls"] = json.loads(d.get("indexed_urls_json") or "[]")
            d["quick_wins"] = json.loads(d.get("quick_wins_json") or "[]")
            d["negatives"] = json.loads(d.get("negatives_json") or "[]")
            d["rank_tracker"] = json.loads(d.get("rank_tracker_json") or "[]")
            d["technical_audit"] = json.loads(d.get("technical_audit_json") or "{}")
            d["unindexed_count"] = len(d["unindexed_urls"])
            d["indexed_count"] = len(d["indexed_urls"])
            d["default_inspect_url"] = d["urls"][1] if len(d["urls"]) > 1 else (d["urls"][0] if d["urls"] else f"https://{domain}")
        except Exception:
            pass
        return d

def list_history(limit=25):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT domain, title, health_score, urls_count, latency_ms, scanned_at
            FROM audited_domains
            ORDER BY scanned_at DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

def delete_domain(domain):
    domain = domain.lower().strip()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM audited_domains WHERE domain = ?", (domain,))
        cursor.execute("DELETE FROM rank_snapshots WHERE domain = ?", (domain,))
        cursor.execute("DELETE FROM indexing_logs WHERE domain = ?", (domain,))
        conn.commit()
        return cursor.rowcount > 0

def save_indexing_log(domain, url, action, google_status, indexnow_status, api_response=""):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO indexing_logs (domain, url, action, google_status, indexnow_status, api_response, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            domain,
            url,
            action,
            google_status,
            indexnow_status,
            str(api_response)[:500],
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        conn.commit()

def get_recent_indexing_logs(domain=None, limit=20):
    with get_connection() as conn:
        cursor = conn.cursor()
        if domain:
            cursor.execute("""
                SELECT * FROM indexing_logs
                WHERE domain = ?
                ORDER BY created_at DESC
                LIMIT ?
            """, (domain.lower().strip(), limit))
        else:
            cursor.execute("""
                SELECT * FROM indexing_logs
                ORDER BY created_at DESC
                LIMIT ?
            """, (limit,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

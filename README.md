# Adxlead Growth OS

**Adxlead Growth OS** is a unified Search Engine Optimization (SEO), Google Search Console, Instant Indexing, and Autonomous Google Ads Management platform.

## Core Modules

- `index.html`: Marketing landing page and SaaS overview.
- `dashboard.html`: Interactive multi-tab Growth OS dashboard (On-Page & Technical SEO, Off-Page & Entity SEO, Striking Distance Quick Wins Bento Grid, Organic Rank Tracker, Google Ads Autopilot Wizard, and White-Label PDF Audit Report generator).
- `server.py`: Lightweight HTTP server & REST API engine (`/api/domain/analyze`, `/api/url/inspect`, `/api/indexing/push`, `/api/gsc/status`, `/api/ads/*`).
- `crawler.py`: Live HTTP deep technical crawler, meta/canonical/security auditor, Bing IndexNow dispatcher, and Google Indexing API v3 client.
- `db.py`: SQLite persistence layer for domain audits, indexing logs, and rank snapshots.

## Environment Variables

Configure Google Search Console / Indexing API access using environment variables (do not commit credentials files):

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service_account.json"
export GSC_SERVICE_ACCOUNT_EMAIL="gsc-indexer@your-project.iam.gserviceaccount.com"
```

## Quick Start

```bash
python server.py
```

Then open `http://127.0.0.1:8780/app` in your browser.

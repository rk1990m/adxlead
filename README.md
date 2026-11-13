# Adxlead Growth OS

**Adxlead Growth OS** is a unified Search Engine Optimization (SEO), Google Search Console, Instant Indexing, and Autonomous Google Ads Management platform.

## Repository Structure

- `index.html`: Marketing landing page and SaaS overview (`GET /`).
- `dashboard.html`: Interactive multi-tab Growth OS dashboard (`GET /app`) — On-Page & Technical SEO, Off-Page & Entity SEO, Striking Distance Quick Wins Bento Grid, Organic Rank Tracker, Google Ads Autopilot Wizard, and White-Label PDF Audit Report generator.
- `server.py`: HTTP server & REST API engine (`/api/domain/analyze`, `/api/url/inspect`, `/api/indexing/push`, `/api/gsc/status`, `/api/ads/*`).
- `crawler.py`: Live HTTP deep technical crawler, meta/canonical/security auditor, Bing IndexNow dispatcher, and Google Indexing API v3 client.
- `db.py`: Local SQLite persistence layer for domain audits, indexing logs, and rank snapshots.
- `schema.sql`: Target multi-tenant PostgreSQL schema for commercial SaaS deployment (Workspaces, OAuth connections, Subscriptions, Agency White-Labeling, and Rank Snapshots).
- `CLAUDE.md`: Master architecture blueprint, SaaS gap analysis, 6-phase engineering roadmap, and commercialization strategy.
- `requirements.txt` & `.env.example`: Python dependencies and environment variable template.
- `Dockerfile` & `docker-compose.yml`: Containerized deployment setup.

## Quick Start (Local Python)

```bash
pip install -r requirements.txt
cp .env.example .env
python server.py
```

Open `http://127.0.0.1:8780/app` in your browser.

## Quick Start (Docker)

```bash
cp .env.example .env
docker compose up -d --build
```

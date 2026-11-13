-- ============================================================================
-- Adxlead Growth OS — Target Multi-Tenant PostgreSQL Schema (schema.sql)
-- Designed for Phase 1–6 Commercial SaaS Upgrade with Row-Level Security (RLS)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users (Authentication & Identity)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    full_name VARCHAR(255),
    google_sub VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workspaces (Multi-Tenant Isolation Boundary for Solo Brands & Agencies)
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_tier VARCHAR(32) NOT NULL DEFAULT 'free', -- 'free' | 'pro' | 'agency'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_members (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'admin', -- 'owner' | 'admin' | 'viewer'
    PRIMARY KEY (workspace_id, user_id)
);

-- 3. Agency White-Label Branding (Phase 6 — Custom Logo, Colors, CNAME)
CREATE TABLE IF NOT EXISTS agency_branding (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    agency_name VARCHAR(255) NOT NULL DEFAULT 'Adxlead Growth OS',
    logo_url TEXT,
    primary_color_hex VARCHAR(16) DEFAULT '#0B3821',
    accent_color_hex VARCHAR(16) DEFAULT '#2E8B57',
    support_email VARCHAR(255),
    custom_domain VARCHAR(255) UNIQUE,
    hide_powered_by BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Subscriptions & Monthly Quota Counters (Phase 4 — Stripe / Razorpay)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL, -- 'stripe' | 'razorpay'
    external_customer_id VARCHAR(255),
    external_subscription_id VARCHAR(255),
    plan_tier VARCHAR(32) NOT NULL DEFAULT 'free',
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active' | 'past_due' | 'canceled'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_counters (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    period_month CHAR(7) NOT NULL, -- e.g. '2026-11'
    domains_audited_count INTEGER DEFAULT 0,
    indexing_pushes_count INTEGER DEFAULT 0,
    serp_api_queries_count INTEGER DEFAULT 0,
    pdf_exports_count INTEGER DEFAULT 0,
    PRIMARY KEY (workspace_id, period_month)
);

-- 5. Encrypted Google OAuth 2.0 Credentials (Phase 2 — GSC, Indexing & Ads)
CREATE TABLE IF NOT EXISTS oauth_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL DEFAULT 'google',
    account_email VARCHAR(255),
    scopes TEXT[],
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expiry TIMESTAMPTZ,
    gsc_properties JSONB DEFAULT '[]'::jsonb,
    google_ads_customer_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Audited Domains & Public Shareable Report Tokens
CREATE TABLE IF NOT EXISTS audited_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    full_url TEXT NOT NULL,
    title TEXT,
    latency_ms INTEGER,
    sitemap_url TEXT,
    urls_count INTEGER DEFAULT 0,
    health_score INTEGER DEFAULT 0,
    urls_json JSONB DEFAULT '[]'::jsonb,
    unindexed_urls_json JSONB DEFAULT '[]'::jsonb,
    indexed_urls_json JSONB DEFAULT '[]'::jsonb,
    quick_wins_json JSONB DEFAULT '[]'::jsonb,
    negatives_json JSONB DEFAULT '[]'::jsonb,
    rank_tracker_json JSONB DEFAULT '[]'::jsonb,
    technical_audit_json JSONB DEFAULT '{}'::jsonb,
    share_token VARCHAR(64) UNIQUE, -- Enables public read-only link /r/<share_token>
    monitoring_enabled BOOLEAN DEFAULT FALSE, -- Opt-in background watchdog only
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (workspace_id, domain)
);

-- 7. Indexing API & IndexNow Submission Logs
CREATE TABLE IF NOT EXISTS indexing_logs (
    id BIGSERIAL PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    action VARCHAR(32) NOT NULL DEFAULT 'URL_UPDATED',
    google_status TEXT,
    indexnow_status TEXT,
    api_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Historical Keyword Rank Snapshots & Cannibalization Telemetry
CREATE TABLE IF NOT EXISTS rank_snapshots (
    id BIGSERIAL PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    query TEXT NOT NULL,
    organic_position NUMERIC(5,2),
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr NUMERIC(5,2) DEFAULT 0,
    paid_cpc_inr NUMERIC(10,2) DEFAULT 0,
    paid_spend_inr NUMERIC(12,2) DEFAULT 0,
    is_cannibalized BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Embeddable Agency Lead-Gen Widget Submissions
CREATE TABLE IF NOT EXISTS agency_widget_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    prospect_domain VARCHAR(255) NOT NULL,
    prospect_email VARCHAR(255) NOT NULL,
    prospect_name VARCHAR(255),
    health_score INTEGER,
    share_token VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audited_domains_workspace ON audited_domains(workspace_id);
CREATE INDEX IF NOT EXISTS idx_indexing_logs_workspace_domain ON indexing_logs(workspace_id, domain);
CREATE INDEX IF NOT EXISTS idx_rank_snapshots_lookup ON rank_snapshots(workspace_id, domain, recorded_at DESC);

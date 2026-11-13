/* ==========================================================================
   Adxlead Growth OS — MarkAI-Style Workspace Application (app.js)
   100% Domain-Neutral · Zero Unsolicited Pings · Full API Integration
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- State ---------- */
  const state = {
    view: "templates",           // default to MarkAI Templates showcase or switched via nav
    collection: null,            // null | "favorites" | "popular" | "recent"
    templateCategory: "All",
    templateLayout: "grid",      // "grid" | "list"
    selectedTemplateId: "serp-title-rewriter",
    searchQuery: "",
    lang: localStorage.getItem("adx_lang") || "en",
    favorites: JSON.parse(localStorage.getItem("adx_favs") || '["serp-title-rewriter","google-ads-rsa","seo-blog-architect","instant-url-indexer","negative-keyword-shield","striking-distance-miner","jsonld-schema-gen","case-study-builder","competitor-gap-spy","welcome-email-seq"]'),
    recent: JSON.parse(localStorage.getItem("adx_recent") || '["serp-title-rewriter","google-ads-rsa","instant-url-indexer","seo-blog-architect","striking-distance-miner","rank-decay-refresher","b2b-pr-pitch","negative-keyword-shield","youtube-seo-desc","listicle-outline"]'),
    domainData: null,
    history: [],
    urlFilter: "unindexed",      // "unindexed" | "indexed" | "all"
    selectedUrls: new Set(),
    inspectResult: null,
    indexingLogs: [],
    armStatus: null,
    adsWizard: {
      goal: "leads",
      domain: "",
      budget: 1500,
      cpa: 450,
      keywords: [],
      negatives: ["free", "jobs", "career", "internship", "course", "pdf", "download", "crack", "meaning", "wikipedia", "login", "salary"]
    },
    anchorCounts: {
      branded: 14,
      naked: 7,
      generic: 4,
      partial: 3,
      exact: 1
    }
  };

  /* ---------- i18n Dictionary ---------- */
  const I18N = {
    en: {
      newAudit: "New Audit",
      whatsNew: "What's New?",
      searchPlaceholder: "Search templates, SEO & Ads tools…",
      navHome: "Home",
      navTemplates: "Templates",
      navTechSeo: "Technical SEO",
      navQuickWins: "Striking Distance",
      navRankTracker: "Rank Tracker",
      navCampaigns: "Campaigns",
      navOffPage: "Off-Page & PR",
      navReport: "Client Report",
      colFav: "Favorite Tools",
      colPop: "Popular Tools",
      colRec: "Recent Tools"
    },
    hi: {
      newAudit: "नया ऑडिट (New Audit)",
      whatsNew: "नया क्या है?",
      searchPlaceholder: "टूल्स और टेम्पलेट खोजें…",
      navHome: "होम डैशबोर्ड",
      navTemplates: "टेम्पलेट्स (Templates)",
      navTechSeo: "टेक्निकल SEO",
      navQuickWins: "स्ट्राइकिंग डिस्टेंस",
      navRankTracker: "रैंक ट्रैकर",
      navCampaigns: "Google Ads कैंपेन",
      navOffPage: "ऑफ-पेज और PR",
      navReport: "क्लाइंट रिपोर्ट",
      colFav: "पसंदीदा टूल्स",
      colPop: "पॉपुलर टूल्स",
      colRec: "हाल के टूल्स"
    }
  };

  /* ---------- MarkAI Templates Catalog (16 Tools) ---------- */
  const TEMPLATES = [
    {
      id: "serp-title-rewriter",
      emoji: "📸",
      title: "AI Click-Magnet SERP Title & Meta",
      desc: "Catchy, high-CTR title tags and meta descriptions engineered to lift organic clicks.",
      category: "SEO",
      tag: "Pro Subs",
      tagColor: "green",
      popular: true,
      linkedView: "quick-wins",
      promptLabel: "Target URL or Primary Keyword",
      promptPlaceholder: "e.g. Enterprise Cloud Software or /pricing"
    },
    {
      id: "google-ads-rsa",
      emoji: "🎯",
      title: "Google Ads RSA Copy Architect",
      desc: "High-converting Responsive Search Ad headlines and descriptions to grab attention and drive clicks.",
      category: "Advertising",
      tag: "Pro Subs",
      tagColor: "green",
      popular: true,
      linkedView: "campaigns",
      promptLabel: "Product / Service & Offer Hook",
      promptPlaceholder: "e.g. Dedicated React Developers — 7-Day Risk-Free Trial"
    },
    {
      id: "youtube-seo-desc",
      emoji: "🎥",
      title: "YouTube Video SEO Description",
      desc: "Optimized video descriptions, chapter timestamps, and entity tags to improve discoverability.",
      category: "Social Media",
      tag: null,
      tagColor: null,
      popular: true,
      linkedView: null,
      promptLabel: "Video Topic & Target Keyword",
      promptPlaceholder: "e.g. How to Cut Google Ads Wasted Spend by 40%"
    },
    {
      id: "seo-blog-architect",
      emoji: "🔍",
      title: "SEO-Optimized Blog Post",
      desc: "AI-powered long-form blog posts with H2/H3 entity hierarchy designed for top search rankings.",
      category: "SEO",
      tag: "Beta",
      tagColor: "amber",
      popular: true,
      linkedView: null,
      promptLabel: "Primary Blog Keyword",
      promptPlaceholder: "e.g. Technical SEO Audit Checklist for SaaS"
    },
    {
      id: "listicle-outline",
      emoji: "📋",
      title: "Listicle Article Generator",
      desc: "Engaging, easy-to-read comparison articles with numbered lists built for AI Overviews.",
      category: "Blog",
      tag: null,
      tagColor: null,
      popular: true,
      linkedView: null,
      promptLabel: "Listicle Topic",
      promptPlaceholder: "e.g. 10 Best B2B Lead Generation Strategies in 2026"
    },
    {
      id: "case-study-builder",
      emoji: "📊",
      title: "Case Study Template",
      desc: "A structured Challenge → Architecture → ROI Metrics format to showcase client success stories.",
      category: "Product Marketing",
      tag: "Pro Subs",
      tagColor: "green",
      popular: true,
      linkedView: null,
      promptLabel: "Client Industry & Key Result Achieved",
      promptPlaceholder: "e.g. FinTech SaaS — +210% Organic Signups in 90 Days"
    },
    {
      id: "product-review-post",
      emoji: "⭐",
      title: "Product Review & Comparison Post",
      desc: "Persuasive vs-competitor comparison reviews highlighting unique product benefits and proof.",
      category: "Blog",
      tag: "Beta",
      tagColor: "amber",
      popular: false,
      linkedView: null,
      promptLabel: "Your Brand vs Competitor Name",
      promptPlaceholder: "e.g. Our Platform vs Legacy Agency Retainers"
    },
    {
      id: "welcome-email-seq",
      emoji: "👋",
      title: "Welcome & Lead Nurture Sequence",
      desc: "Warm 3-part onboarding & follow-up emails to make a great first impression and book demos.",
      category: "Email Marketing",
      tag: null,
      tagColor: null,
      popular: true,
      linkedView: null,
      promptLabel: "Audience & Lead Magnet / Offer",
      promptPlaceholder: "e.g. Free Technical SEO Audit Report Signups"
    },
    {
      id: "instant-url-indexer",
      emoji: "⚡",
      title: "Instant Indexing API Dispatcher",
      desc: "Push unindexed URLs directly to Google Indexing API v3 and Bing IndexNow in one click.",
      category: "Indexing",
      tag: "Pro Subs",
      tagColor: "green",
      popular: true,
      linkedView: "tech-seo",
      promptLabel: "URL to Inspect & Force-Index",
      promptPlaceholder: "https://example.com/new-landing-page"
    },
    {
      id: "striking-distance-miner",
      emoji: "🚀",
      title: "Striking Distance Quick-Win Miner",
      desc: "Identify keywords ranking Position 4–20 and generate 4-part diagnostic CTR fixes.",
      category: "SEO",
      tag: "Pro Subs",
      tagColor: "green",
      popular: true,
      linkedView: "quick-wins",
      promptLabel: "Page URL & Ranking Keyword",
      promptPlaceholder: "e.g. /services — custom software development"
    },
    {
      id: "negative-keyword-shield",
      emoji: "🛡️",
      title: "Negative Keyword Shield Builder",
      desc: "Block junk search intent (free, jobs, cracks, login) before launching any Google Ads campaign.",
      category: "Advertising",
      tag: "Pro Subs",
      tagColor: "green",
      popular: true,
      linkedView: "campaigns",
      promptLabel: "Campaign Niche / Industry",
      promptPlaceholder: "e.g. B2B SaaS / Legal / Healthcare / E-Commerce"
    },
    {
      id: "jsonld-schema-gen",
      emoji: "🧩",
      title: "Entity JSON-LD Schema Architect",
      desc: "Generate Google-compliant Organization, FAQPage, and sameAs Knowledge Graph markup.",
      category: "SEO",
      tag: null,
      tagColor: null,
      popular: false,
      linkedView: "off-page",
      promptLabel: "Brand Name & Official Website",
      promptPlaceholder: "e.g. Acme Corp — https://acme.com"
    },
    {
      id: "rank-decay-refresher",
      emoji: "📈",
      title: "30% Content Decay Refresher",
      desc: "Revive slipping Page-1 rankings with fresh 2026 statistics, comparison tables, and FAQ schema.",
      category: "SEO",
      tag: "Beta",
      tagColor: "amber",
      popular: false,
      linkedView: "rank-tracker",
      promptLabel: "Decaying Page Topic",
      promptPlaceholder: "e.g. Complete Guide to Cloud MigrationCosts"
    },
    {
      id: "b2b-pr-pitch",
      emoji: "📰",
      title: "Digital PR & Backlink Outreach Pitch",
      desc: "Data-backed journalist pitches and guest-post outreach emails that earn DR 70+ authority links.",
      category: "Sales Copy",
      tag: "Pro Subs",
      tagColor: "green",
      popular: false,
      linkedView: "off-page",
      promptLabel: "Research Hook or Industry Trend",
      promptPlaceholder: "e.g. 2026 Benchmark: Why 68% of Paid Search Budgets Leak"
    },
    {
      id: "social-caption-pro",
      emoji: "💬",
      title: "Engaging Instagram & LinkedIn Caption",
      desc: "Catchy and relatable social captions with scroll-stopping hooks to boost engagement.",
      category: "Social Media",
      tag: "Pro Subs",
      tagColor: "green",
      popular: false,
      linkedView: null,
      promptLabel: "Post Topic or Announcement",
      promptPlaceholder: "e.g. Launching our automated SEO & Ads audit workspace"
    },
    {
      id: "competitor-gap-spy",
      emoji: "🕵️",
      title: "Competitor Ad & Keyword Gap Spy",
      desc: "Reverse-engineer competitor search terms, CPC bids, and counter-positioning ad angles.",
      category: "Advertising",
      tag: "Beta",
      tagColor: "amber",
      popular: false,
      linkedView: "campaigns",
      promptLabel: "Competitor Domain",
      promptPlaceholder: "e.g. competitor.com"
    }
  ];

  const TEMPLATE_CATEGORIES = [
    "All",
    "SEO",
    "Advertising",
    "Indexing",
    "Social Media",
    "Blog",
    "Email Marketing",
    "Product Marketing",
    "Sales Copy"
  ];

  /* ---------- Helper Utilities ---------- */
  function esc(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function t(key) {
    return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
  }

  function toast(msg, isError = false) {
    const root = document.getElementById("toast-root");
    if (!root) return;
    const el = document.createElement("div");
    el.className = "toast" + (isError ? " error" : "");
    el.innerHTML = `<span>${esc(msg)}</span>`;
    root.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transition = "opacity .2s";
      setTimeout(() => el.remove(), 220);
    }, 3200);
  }

  function copyText(text, label = "Copied to clipboard") {
    navigator.clipboard.writeText(text).then(() => toast(label)).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast(label);
    });
  }

  function saveCollections() {
    localStorage.setItem("adx_favs", JSON.stringify(state.favorites));
    localStorage.setItem("adx_recent", JSON.stringify(state.recent));
  }

  function toggleFavorite(id, ev) {
    if (ev) ev.stopPropagation();
    const idx = state.favorites.indexOf(id);
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      toast("Removed from Favorite Tools");
    } else {
      state.favorites.unshift(id);
      toast("Added to Favorite Tools ★");
    }
    saveCollections();
    renderNav();
    if (state.view === "templates") renderView();
  }

  function markRecent(id) {
    state.recent = [id, ...state.recent.filter(x => x !== id)].slice(0, 12);
    saveCollections();
    renderNav();
  }

  /* ---------- API Calls (Zero auto-crawl on load) ---------- */
  async function loadHistoryList() {
    try {
      const res = await fetch("/api/history");
      if (!res.ok) return;
      const data = await res.json();
      state.history = data.history || [];
      renderView();
    } catch (_) {}
  }

  async function loadArmStatus() {
    try {
      const res = await fetch("/api/ads/arm/status");
      if (!res.ok) return;
      state.armStatus = await res.json();
    } catch (_) {}
  }

  async function analyzeDomain(rawDomain) {
    const clean = (rawDomain || "").trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
    if (!clean || !clean.includes(".")) {
      toast("Please enter a valid domain (e.g. example.com)", true);
      return;
    }
    const btn = document.getElementById("btn-run-audit");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span><span>Scanning ${esc(clean)}…</span>`;
    }
    toast(`Running live crawl & sitemap discovery for ${clean}…`);
    try {
      const res = await fetch("/api/domain/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: clean })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast(data.error || "Failed to analyze domain", true);
      } else {
        state.domainData = data;
        state.adsWizard.domain = data.domain;
        state.selectedUrls.clear();
        toast(`Audit complete: ${data.domain} (Health ${data.health_score}/100 · ${data.urls_count} URLs)`);
        await loadHistoryList();
      }
    } catch (e) {
      toast("Network error while analyzing domain: " + e.message, true);
    } finally {
      renderView();
    }
  }

  async function loadSavedDomain(domain) {
    if (!domain) return;
    try {
      const res = await fetch(`/api/domain/load?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      if (res.ok && !data.error) {
        state.domainData = data;
        state.adsWizard.domain = data.domain;
        state.selectedUrls.clear();
        toast(`Loaded cached audit for ${data.domain}`);
        renderView();
      } else {
        toast(data.error || "Could not load domain", true);
      }
    } catch (e) {
      toast("Error loading saved domain", true);
    }
  }

  /* ---------- Sidebar Navigation ---------- */
  const NAV_ITEMS = [
    { id: "home", labelKey: "navHome", icon: `<svg class="ico" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
    { id: "templates", labelKey: "navTemplates", icon: `<svg class="ico" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>` },
    { id: "tech-seo", labelKey: "navTechSeo", icon: `<svg class="ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>` },
    { id: "quick-wins", labelKey: "navQuickWins", icon: `<svg class="ico" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>` },
    { id: "rank-tracker", labelKey: "navRankTracker", icon: `<svg class="ico" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>` },
    { id: "campaigns", labelKey: "navCampaigns", icon: `<svg class="ico" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>` },
    { id: "off-page", labelKey: "navOffPage", icon: `<svg class="ico" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>` },
    { id: "report", labelKey: "navReport", icon: `<svg class="ico" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>` }
  ];

  function renderNav() {
    const navMain = document.getElementById("nav-main");
    const navCol = document.getElementById("nav-collections");
    if (!navMain || !navCol) return;

    navMain.innerHTML = NAV_ITEMS.map(item => {
      const active = state.view === item.id && !state.collection;
      return `
        <button class="nav-item ${active ? "active" : ""}" data-view="${item.id}" type="button">
          ${item.icon}
          <span>${esc(t(item.labelKey))}</span>
        </button>
      `;
    }).join("");

    const popCount = TEMPLATES.filter(x => x.popular).length;
    const cols = [
      { id: "favorites", label: t("colFav"), color: "#F59E0B", count: state.favorites.length },
      { id: "popular", label: t("colPop"), color: "#5B5BD6", count: popCount },
      { id: "recent", label: t("colRec"), color: "#16A34A", count: state.recent.length }
    ];

    navCol.innerHTML = cols.map(c => {
      const active = state.view === "templates" && state.collection === c.id;
      return `
        <button class="nav-item ${active ? "active" : ""}" data-collection="${c.id}" type="button">
          <span class="dot" style="background:${c.color}"></span>
          <span>${esc(c.label)}</span>
          <span class="count">${c.count}</span>
        </button>
      `;
    }).join("");

    navMain.querySelectorAll("[data-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.view = btn.dataset.view;
        state.collection = null;
        document.getElementById("sidebar")?.classList.remove("open");
        renderNav();
        renderView();
      });
    });

    navCol.querySelectorAll("[data-collection]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.view = "templates";
        state.collection = btn.dataset.collection;
        state.templateCategory = "All";
        document.getElementById("sidebar")?.classList.remove("open");
        renderNav();
        renderView();
      });
    });

    // Update static i18n elements
    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    const searchInput = document.getElementById("global-search");
    if (searchInput) searchInput.placeholder = t("searchPlaceholder");
  }

  /* ---------- Top Domain Bar Component (Shared across SEO/Ads views) ---------- */
  function renderDomainAuditBar() {
    const d = state.domainData;
    const historyOpts = state.history.map(h =>
      `<option value="${esc(h.domain)}" ${d && d.domain === h.domain ? "selected" : ""}>${esc(h.domain)} (${h.health_score}/100 · ${h.urls_count} URLs)</option>`
    ).join("");

    return `
      <div class="domain-bar mb-20" style="margin-bottom:20px;flex-wrap:wrap">
        <span class="prefix">https://</span>
        <input id="domain-input" type="text" placeholder="Enter any website domain (e.g. yourbrand.com)…" value="${esc(d ? d.domain : "")}" autocomplete="off">
        ${state.history.length ? `
          <select id="history-select" class="select" style="width:auto;height:38px;font-size:13px">
            <option value="">Recent Audits (${state.history.length})…</option>
            ${historyOpts}
          </select>
        ` : ""}
        <button class="btn btn-primary" id="btn-run-audit" type="button">
          <svg class="ico ico-sm" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span>Analyze Domain</span>
        </button>
        ${d ? `<span class="active-domain"><span class="dot" style="background:var(--green)"></span>${esc(d.domain)} · ${d.health_score}/100</span>` : ""}
      </div>
    `;
  }

  function bindDomainBarEvents() {
    const input = document.getElementById("domain-input");
    const btn = document.getElementById("btn-run-audit");
    const hist = document.getElementById("history-select");

    if (btn && input) {
      btn.addEventListener("click", () => analyzeDomain(input.value));
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") analyzeDomain(input.value);
      });
    }
    if (hist) {
      hist.addEventListener("change", () => {
        if (hist.value) loadSavedDomain(hist.value);
      });
    }
  }

  /* ==========================================================================
     VIEW 1: TEMPLATES (Exact MarkAI Reference Layout + Interactive Studio)
     ========================================================================== */
  function renderTemplatesView() {
    let items = TEMPLATES.slice();

    if (state.collection === "favorites") {
      items = items.filter(x => state.favorites.includes(x.id));
    } else if (state.collection === "popular") {
      items = items.filter(x => x.popular);
    } else if (state.collection === "recent") {
      items = state.recent.map(id => TEMPLATES.find(t => t.id === id)).filter(Boolean);
    }

    if (state.templateCategory !== "All") {
      items = items.filter(x => x.category === state.templateCategory);
    }

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      items = items.filter(x =>
        x.title.toLowerCase().includes(q) ||
        x.desc.toLowerCase().includes(q) ||
        x.category.toLowerCase().includes(q)
      );
    }

    const headingTitle = state.collection === "favorites"
      ? t("colFav")
      : state.collection === "popular"
      ? t("colPop")
      : state.collection === "recent"
      ? t("colRec")
      : "Templates";

    const tabsHtml = TEMPLATE_CATEGORIES.map(cat => `
      <button class="tab ${state.templateCategory === cat ? "active" : ""}" data-cat="${esc(cat)}" type="button">${esc(cat)}</button>
    `).join("");

    const cardsHtml = items.length === 0 ? `
      <div class="empty">
        <div class="emoji-tile lg">🔎</div>
        <h3>No matching templates</h3>
        <p>Try clearing your search filter or switching back to the All tab.</p>
        <button class="btn" id="btn-reset-filter" type="button">Reset Filters</button>
      </div>
    ` : state.templateLayout === "grid" ? `
      <div class="tools-grid">
        ${items.map(item => {
          const isSelected = state.selectedTemplateId === item.id;
          const isFav = state.favorites.includes(item.id);
          return `
            <div class="tool-card ${isSelected ? "selected" : ""}" data-template-id="${item.id}" role="button" tabindex="0">
              <button class="fav-btn ${isFav ? "on" : ""}" data-fav-id="${item.id}" type="button" title="Toggle Favorite">
                <svg class="ico ico-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
              <div class="emoji-tile">${item.emoji}</div>
              <h4>${esc(item.title)}</h4>
              <p>${esc(item.desc)}</p>
              <div class="tool-tags">
                <span class="chip">${esc(item.category)}</span>
                ${item.tag ? `<span class="tag-text ${item.tagColor || "green"}">${esc(item.tag)}</span>` : ""}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    ` : `
      <div class="tools-list">
        ${items.map(item => {
          const isFav = state.favorites.includes(item.id);
          return `
            <div class="tool-row" data-template-id="${item.id}" role="button" tabindex="0">
              <div class="emoji-tile">${item.emoji}</div>
              <div style="flex:1;min-width:0">
                <h4>${esc(item.title)}</h4>
                <p class="truncate">${esc(item.desc)}</p>
              </div>
              <span class="chip">${esc(item.category)}</span>
              ${item.tag ? `<span class="tag-text ${item.tagColor || "green"}" style="min-width:64px">${esc(item.tag)}</span>` : `<span style="min-width:64px"></span>`}
              <button class="fav-btn ${isFav ? "on" : ""}" style="position:static" data-fav-id="${item.id}" type="button" title="Favorite">
                <svg class="ico ico-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
            </div>
          `;
        }).join("")}
      </div>
    `;

    return `
      <section class="panel" style="position:relative">
        <div class="sticky-panel-top">
          <div class="page-head" style="margin-bottom:14px">
            <div>
              <h1>${esc(headingTitle)}</h1>
            </div>
            <div class="row gap-8">
              <button class="icon-btn ${state.templateLayout === "grid" ? "active" : ""}" id="btn-layout-grid" type="button" title="Grid View">
                <svg class="ico" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              </button>
              <button class="icon-btn ${state.templateLayout === "list" ? "active" : ""}" id="btn-layout-list" type="button" title="List View">
                <svg class="ico" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          </div>

          <div class="tabs-wrap">
            <button class="tab-slide-btn" id="btn-tabs-left" type="button" title="Slide categories left">‹</button>
            <div class="tabs" id="template-tabs">
              ${tabsHtml}
            </div>
            <button class="tab-slide-btn" id="btn-tabs-right" type="button" title="Slide categories right">›</button>
          </div>
        </div>

        ${cardsHtml}

        <button class="floating-next-btn" id="btn-floating-next" type="button" title="Next Category">
          <svg class="ico" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </section>
    `;
  }

  function bindTemplatesEvents() {
    document.querySelectorAll("#template-tabs [data-cat]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.templateCategory = btn.dataset.cat;
        renderView();
      });
    });

    const tabsEl = document.getElementById("template-tabs");
    document.getElementById("btn-tabs-left")?.addEventListener("click", () => {
      tabsEl?.scrollBy({ left: -220, behavior: "smooth" });
    });
    document.getElementById("btn-tabs-right")?.addEventListener("click", () => {
      tabsEl?.scrollBy({ left: 220, behavior: "smooth" });
    });
    document.getElementById("btn-floating-next")?.addEventListener("click", () => {
      const idx = TEMPLATE_CATEGORIES.indexOf(state.templateCategory);
      state.templateCategory = TEMPLATE_CATEGORIES[(idx + 1) % TEMPLATE_CATEGORIES.length];
      renderView();
    });

    document.getElementById("btn-layout-grid")?.addEventListener("click", () => {
      state.templateLayout = "grid";
      renderView();
    });
    document.getElementById("btn-layout-list")?.addEventListener("click", () => {
      state.templateLayout = "list";
      renderView();
    });
    document.getElementById("btn-reset-filter")?.addEventListener("click", () => {
      state.templateCategory = "All";
      state.searchQuery = "";
      state.collection = null;
      const g = document.getElementById("global-search");
      if (g) g.value = "";
      renderNav();
      renderView();
    });

    document.querySelectorAll("[data-fav-id]").forEach(btn => {
      btn.addEventListener("click", ev => toggleFavorite(btn.dataset.favId, ev));
    });

    document.querySelectorAll("[data-template-id]").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.dataset.templateId;
        state.selectedTemplateId = id;
        markRecent(id);
        renderView();
        openTemplateModal(id);
      });
    });
  }

  /* ---------- Interactive Template Studio Modal ---------- */
  function generateTemplateOutput(tpl, inputVal, tone) {
    const dom = state.domainData ? state.domainData.domain : "yourbrand.com";
    const topic = (inputVal || "").trim() || (state.domainData ? state.domainData.title || dom : "B2B Growth & Marketing Automation");

    switch (tpl.id) {
      case "serp-title-rewriter":
        return [
          `=== GOOGLE SERP CLICK-MAGNET VARIATIONS (${dom}) ===`,
          ``,
          `[Option 1 — High-Intent Commercial + Brackets]`,
          `Title (58 chars): ${topic} — #1 Rated Solution [2026 Audit]`,
          `Meta (154 chars): Looking for ${topic}? See how teams cut wasted spend by 42% and scale qualified pipeline in 7 days. Instant setup — try it risk-free today.`,
          ``,
          `[Option 2 — Data & Proof Hook]`,
          `Title (56 chars): ${topic}: Compare Pricing, ROI & Case Studies`,
          `Meta (151 chars): Compare verified benchmarks for ${topic} on ${dom}. Transparent pricing, 99.9% SLA, and live customer telemetry. Request your free growth audit.`,
          ``,
          `[Option 3 — Direct Question / AI Overview Snippet]`,
          `Title (54 chars): What Is the Best ${topic}? (2026 Buyer Guide)`,
          `Meta (149 chars): Complete 2026 buyer's guide to ${topic}: architecture checklist, cost breakdown, and why 500+ scaling teams switched to ${dom}.`
        ].join("\n");

      case "google-ads-rsa":
        return [
          `=== GOOGLE ADS RESPONSIVE SEARCH AD (RSA) PACK ===`,
          `Target Domain: https://${dom}`,
          `Offer / Hook : ${topic}`,
          `Tone         : ${tone}`,
          ``,
          `--- 10 HIGH-CTR HEADLINES (<= 30 chars) ---`,
          `H1: ${topic.slice(0, 28)}`,
          `H2: Trusted by 500+ Growth Teams`,
          `H3: Start Your 7-Day Free Trial`,
          `H4: Cut Wasted Ad Spend by 40%`,
          `H5: Official ${dom.split(".")[0].toUpperCase()} Platform`,
          `H6: Transparent Monthly Pricing`,
          `H7: Setup in Under 5 Minutes`,
          `H8: Verified ROI & Live Metrics`,
          `H9: Book a 15-Min Strategy Demo`,
          `H10: Switch & Save 35% Today`,
          ``,
          `--- 4 CONVERSION DESCRIPTIONS (<= 90 chars) ---`,
          `D1: Scale faster with ${topic.slice(0, 35)}. Zero long-term lock-in. Start your 7-day risk-free trial.`,
          `D2: Stop overpaying for legacy retainers. Get dedicated execution, live reporting & 24/7 SLA.`,
          `D3: Join high-growth teams using ${dom} to automate SEO, indexing & profitable Google Ads.`,
          `D4: Compare plans & calculate your exact ROAS in 60 seconds. Instant onboarding available now.`
        ].join("\n");

      case "negative-keyword-shield":
        return [
          `=== MANDATORY NEGATIVE KEYWORD SHIELD (${topic}) ===`,
          `Apply at Campaign or Shared Library level BEFORE activating traffic:`,
          ``,
          `# Freebie & Piracy Bleed`,
          `"free"`,
          `"free download"`,
          `"crack"`,
          `"nulled"`,
          `"open source"`,
          `"torrent"`,
          ``,
          `# Job Seeker & Career Bleed`,
          `"jobs"`,
          `"salary"`,
          `"hiring"`,
          `"internship"`,
          `"resume"`,
          `"vacancy"`,
          `"work from home"`,
          ``,
          `# Educational & Research Intent`,
          `"what is"`,
          `"meaning"`,
          `"definition"`,
          `"wikipedia"`,
          `"course"`,
          `"tutorial"`,
          `"pdf"`,
          `"reddit"`,
          ``,
          `# Existing User Navigation`,
          `"login"`,
          `"sign in"`,
          `"customer support number"`
        ].join("\n");

      case "jsonld-schema-gen":
        return JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": topic,
          "url": `https://${dom}`,
          "logo": `https://${dom}/logo.png`,
          "sameAs": [
            `https://www.linkedin.com/company/${dom.split(".")[0]}`,
            `https://x.com/${dom.split(".")[0]}`,
            `https://www.crunchbase.com/organization/${dom.split(".")[0]}`,
            `https://www.g2.com/products/${dom.split(".")[0]}/reviews`
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": `support@${dom}`,
            "availableLanguage": ["English", "Hindi"]
          }
        }, null, 2);

      default:
        return [
          `=== ${tpl.title.toUpperCase()} ===`,
          `Workspace Domain: https://${dom}  |  Tone: ${tone}`,
          `Topic / Focus   : ${topic}`,
          ``,
          `1. Scroll-Stopping Hook / Headline:`,
          `   "Why 73% of teams struggle with ${topic} — and the exact 3-step blueprint we used on ${dom} to fix it in 14 days."`,
          ``,
          `2. Core Value Breakdown:`,
          `   • Problem: Manual workflows, slow indexing, and unmonitored ad spend drain growth budgets.`,
          `   • Mechanism: Combine live technical telemetry, striking-distance CTR fixes, and 2x CPA guardrails.`,
          `   • Proof: Verified sub-second page speed, structured schema entities, and measurable pipeline lift.`,
          ``,
          `3. Primary Call-To-Action (CTA):`,
          `   "Run your free live audit at https://${dom} or reply 'AUDIT' to get the full checklist."`
        ].join("\n");
    }
  }

  function openTemplateModal(id) {
    const tpl = TEMPLATES.find(x => x.id === id);
    if (!tpl) return;
    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) return;

    const defaultInput = state.domainData ? `${state.domainData.domain} — ${state.domainData.title || ""}` : "";
    const initialOutput = generateTemplateOutput(tpl, defaultInput, "Professional & Data-Driven");

    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="tpl-backdrop">
        <div class="modal modal-lg" role="dialog" aria-modal="true">
          <div class="modal-head">
            <div class="row gap-12">
              <div class="emoji-tile lg">${tpl.emoji}</div>
              <div>
                <div class="row gap-8">
                  <h3 style="font-size:18px">${esc(tpl.title)}</h3>
                  <span class="chip">${esc(tpl.category)}</span>
                  ${tpl.tag ? `<span class="tag-text ${tpl.tagColor || "green"}">${esc(tpl.tag)}</span>` : ""}
                </div>
                <p class="small text-2 mt-4">${esc(tpl.desc)}</p>
              </div>
            </div>
            <button class="icon-btn" id="btn-close-modal" type="button" aria-label="Close">✕</button>
          </div>

          <div class="modal-body">
            <div class="two-col" style="grid-template-columns:1fr 1.35fr;gap:20px">
              <div class="stack gap-12">
                <div>
                  <label class="label">${esc(tpl.promptLabel || "Topic / Target URL")}</label>
                  <input class="input" id="tpl-input" type="text" placeholder="${esc(tpl.promptPlaceholder || "")}" value="${esc(defaultInput)}">
                </div>
                <div>
                  <label class="label">Tone of Voice</label>
                  <select class="select" id="tpl-tone">
                    <option value="Professional & Data-Driven">Professional & Data-Driven</option>
                    <option value="Direct & High-Urgency Conversion">Direct & High-Urgency Conversion</option>
                    <option value="Executive White-Label">Executive White-Label</option>
                    <option value="Conversational & Engaging">Conversational & Engaging</option>
                  </select>
                </div>
                <button class="btn btn-primary btn-block mt-4" id="btn-tpl-generate" type="button">
                  <span>Generate Output</span>
                </button>
                ${tpl.linkedView ? `
                  <button class="btn btn-block" id="btn-tpl-open-module" type="button">
                    <span>Open Full ${esc(tpl.category)} Workspace →</span>
                  </button>
                ` : ""}
              </div>

              <div class="stack gap-8">
                <div class="between">
                  <span class="label" style="margin:0">Generated Output</span>
                  <button class="btn btn-sm" id="btn-tpl-copy" type="button">Copy Result</button>
                </div>
                <textarea class="textarea" id="tpl-output" style="min-height:290px">${esc(initialOutput)}</textarea>
              </div>
            </div>
          </div>

          <div class="modal-foot">
            <button class="btn" id="btn-close-modal-2" type="button">Close</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ""; };
    document.getElementById("btn-close-modal")?.addEventListener("click", close);
    document.getElementById("btn-close-modal-2")?.addEventListener("click", close);
    document.getElementById("tpl-backdrop")?.addEventListener("click", e => {
      if (e.target.id === "tpl-backdrop") close();
    });

    document.getElementById("btn-tpl-generate")?.addEventListener("click", () => {
      const val = document.getElementById("tpl-input")?.value || "";
      const tone = document.getElementById("tpl-tone")?.value || "Professional";
      const out = document.getElementById("tpl-output");
      if (out) out.value = generateTemplateOutput(tpl, val, tone);
      toast("Generated fresh template output");
    });

    document.getElementById("btn-tpl-copy")?.addEventListener("click", () => {
      const out = document.getElementById("tpl-output");
      if (out) copyText(out.value, "Template output copied!");
    });

    document.getElementById("btn-tpl-open-module")?.addEventListener("click", () => {
      close();
      state.view = tpl.linkedView;
      state.collection = null;
      renderNav();
      renderView();
    });
  }

  /* ==========================================================================
     VIEW 2: HOME (Command Center, KPI Stat Cards, Recent Audits, Quick Launch)
     ========================================================================== */
  function renderHomeView() {
    const d = state.domainData;
    const unindexedCount = d ? (d.unindexed_urls || []).length : 0;
    const qwCount = d ? (d.quick_wins || []).length : 0;
    const scoreCol = !d ? "var(--muted)" : d.health_score >= 80 ? "var(--green)" : d.health_score >= 60 ? "var(--amber)" : "var(--red)";

    return `
      <section class="panel">
        <div class="page-head">
          <div>
            <h1>Growth Command Center</h1>
            <p>Crawl any domain in real time, audit technical SEO & indexing, and launch protected Google Ads campaigns.</p>
          </div>
          ${d ? `<button class="btn" id="btn-home-report" type="button">Export Client PDF Report</button>` : ""}
        </div>

        ${renderDomainAuditBar()}

        <div class="stats">
          <div class="stat">
            <div class="label-sm">SEO Health Score</div>
            <div class="value" style="color:${scoreCol}">${d ? d.health_score + "/100" : "—"}</div>
            <div class="hint">${d ? `TTFB ${d.latency_ms}ms · ${esc(d.title || d.domain)}` : "Run a domain scan above"}</div>
          </div>
          <div class="stat">
            <div class="label-sm">Discovered Sitemap URLs</div>
            <div class="value">${d ? d.urls_count : "—"}</div>
            <div class="hint">${d ? `<span class="tag-text amber">${unindexedCount} awaiting indexing</span>` : "Auto-discovers XML sitemaps"}</div>
          </div>
          <div class="stat">
            <div class="label-sm">Striking Distance Wins</div>
            <div class="value">${d ? qwCount : "—"}</div>
            <div class="hint">${d ? "Keywords Pos 4–20 ready for CTR lift" : "Page-2 quick-win opportunities"}</div>
          </div>
          <div class="stat">
            <div class="label-sm">Google Ads ARM Guard</div>
            <div class="value" style="color:var(--green)">Active</div>
            <div class="hint">2× Target CPA Stop-Loss + Negative Shield</div>
          </div>
        </div>

        ${d ? `
          <div class="two-col mt-20">
            <div class="card card-pad">
              <div class="between">
                <div>
                  <h3>Active Audit: ${esc(d.domain)}</h3>
                  <p class="small text-2 mt-4">Sitemap: <code>${esc(d.sitemap_url || "HTML Links Crawl")}</code></p>
                </div>
                <div class="score-ring" style="--val:${d.health_score};--col:${scoreCol}">
                  <div>
                    <b>${d.health_score}</b>
                    <small>Health</small>
                  </div>
                </div>
              </div>
              <div class="row wrap gap-8 mt-16">
                <button class="btn btn-primary btn-sm" data-goto="tech-seo" type="button">Index ${unindexedCount} Unindexed URLs →</button>
                <button class="btn btn-sm" data-goto="quick-wins" type="button">Fix ${qwCount} Striking-Distance Keywords</button>
                <button class="btn btn-sm" data-goto="rank-tracker" type="button">Open Rank Tracker</button>
                <button class="btn btn-sm" data-goto="campaigns" type="button">Build Google Ads Campaign</button>
              </div>
            </div>

            <div class="card card-pad">
              <h3>Recent Audited Domains (${state.history.length})</h3>
              <p class="small text-2 mt-4">Stored locally in SQLite — click any domain to load instantly without re-crawling.</p>
              <div class="stack gap-8 mt-12">
                ${state.history.slice(0, 5).map(h => `
                  <div class="between" style="padding:8px 10px;border:1px solid var(--border);border-radius:10px">
                    <div>
                      <b class="small">${esc(h.domain)}</b>
                      <span class="small muted"> · ${h.urls_count} URLs · ${h.latency_ms}ms</span>
                    </div>
                    <div class="row gap-8">
                      <span class="chip ${h.health_score >= 80 ? "chip-green" : "chip-amber"}">${h.health_score}/100</span>
                      <button class="btn btn-sm" data-load-domain="${esc(h.domain)}" type="button">Load</button>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        ` : `
          <div class="card card-pad mt-20">
            <div class="between wrap gap-12">
              <div>
                <h3>Ready when you are — Zero background pings</h3>
                <p class="small text-2 mt-4">Enter any client or project domain above to run a live crawl, or pick a previously scanned domain below.</p>
              </div>
              <button class="btn" data-goto="templates" type="button">Browse All 16 Marketing Templates →</button>
            </div>
            ${state.history.length ? `
              <div class="row wrap gap-8 mt-16">
                ${state.history.map(h => `
                  <button class="btn btn-sm" data-load-domain="${esc(h.domain)}" type="button">
                    <span>${esc(h.domain)}</span>
                    <span class="chip ${h.health_score >= 80 ? "chip-green" : "chip-amber"}">${h.health_score}</span>
                  </button>
                `).join("")}
              </div>
            ` : ""}
          </div>
        `}
      </section>
    `;
  }

  function bindHomeEvents() {
    bindDomainBarEvents();
    document.getElementById("btn-home-report")?.addEventListener("click", () => {
      state.view = "report";
      renderNav();
      renderView();
    });
    document.querySelectorAll("[data-goto]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.view = btn.dataset.goto;
        renderNav();
        renderView();
      });
    });
    document.querySelectorAll("[data-load-domain]").forEach(btn => {
      btn.addEventListener("click", () => loadSavedDomain(btn.dataset.loadDomain));
    });
  }

  /* ==========================================================================
     VIEW 3: TECHNICAL SEO & INSTANT INDEXING
     ========================================================================== */
  function renderTechSeoView() {
    const d = state.domainData;
    const audit = d && d.technical_audit ? d.technical_audit : [];
    const unindexed = d ? (d.unindexed_urls || []) : [];
    const indexed = d ? (d.indexed_urls || []) : [];
    const allUrls = d ? (d.urls || []) : [];
    const list = state.urlFilter === "unindexed" ? unindexed : state.urlFilter === "indexed" ? indexed : allUrls;

    return `
      <section class="panel">
        <div class="page-head">
          <div>
            <h1>Technical SEO & Instant Indexing</h1>
            <p>Live HTTP header & canonical inspector, Core Web Vitals checks, and Google Indexing API v3 + Bing IndexNow batch dispatcher.</p>
          </div>
        </div>

        ${renderDomainAuditBar()}

        ${!d ? `
          <div class="empty">
            <div class="emoji-tile lg">🔍</div>
            <h3>Scan a domain to unlock Technical SEO & Instant Indexing</h3>
            <p>Enter any website above or select from your saved history dropdown.</p>
          </div>
        ` : `
          <div class="two-col">
            <!-- URL Indexing Queue -->
            <div class="card">
              <div class="card-head">
                <div>
                  <h3>Sitemap URL Indexing Dispatcher</h3>
                  <div class="card-sub">Select URLs and push directly to Google Indexing API v3 & Bing IndexNow</div>
                </div>
                <div class="segmented">
                  <button class="${state.urlFilter === "unindexed" ? "active" : ""}" data-ufilter="unindexed" type="button">Unindexed (${unindexed.length})</button>
                  <button class="${state.urlFilter === "indexed" ? "active" : ""}" data-ufilter="indexed" type="button">Indexed (${indexed.length})</button>
                  <button class="${state.urlFilter === "all" ? "active" : ""}" data-ufilter="all" type="button">All (${allUrls.length})</button>
                </div>
              </div>
              <div class="card-pad">
                <div class="between mb-12" style="margin-bottom:12px">
                  <div class="row gap-8">
                    <button class="btn btn-sm" id="btn-select-batch" type="button">Select Top 15</button>
                    <button class="btn btn-sm" id="btn-clear-batch" type="button">Clear</button>
                  </div>
                  <button class="btn btn-primary btn-sm" id="btn-push-index" type="button">
                    <span>⚡ Push Selected to Google & IndexNow (${state.selectedUrls.size})</span>
                  </button>
                </div>

                <div class="table-wrap" style="max-height:360px;overflow:auto;border:1px solid var(--border);border-radius:12px">
                  <table class="table">
                    <thead>
                      <tr>
                        <th style="width:36px"></th>
                        <th>Discovered URL</th>
                        <th>Coverage Status</th>
                        <th>Inspect</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${list.slice(0, 60).map(u => {
                        const isUnidx = unindexed.includes(u);
                        const checked = state.selectedUrls.has(u);
                        return `
                          <tr>
                            <td><input type="checkbox" class="url-cb" data-url="${esc(u)}" ${checked ? "checked" : ""}></td>
                            <td class="mono small truncate" style="max-width:320px" title="${esc(u)}">${esc(u)}</td>
                            <td>
                              <span class="chip ${isUnidx ? "chip-amber" : "chip-green"}">
                                ${isUnidx ? "Crawled - Not Indexed" : "Indexed"}
                              </span>
                            </td>
                            <td>
                              <button class="btn btn-sm" data-inspect-url="${esc(u)}" type="button">Inspect</button>
                            </td>
                          </tr>
                        `;
                      }).join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Live URL Inspector + Technical Audit -->
            <div class="stack gap-16">
              <div class="card card-pad">
                <h3>Live HTTP & Googlebot URL Inspector</h3>
                <p class="small text-2 mt-4">Test live status code, TTFB latency, canonical tag, and mobile viewport.</p>
                <div class="row gap-8 mt-12">
                  <input class="input" id="inspect-input" type="url" placeholder="https://example.com/page" value="${esc(d.default_inspect_url || d.full_url || "")}">
                  <button class="btn btn-primary" id="btn-run-inspect" type="button">Inspect URL</button>
                </div>
                ${state.inspectResult ? `
                  <div class="diag mt-12">
                    <div class="diag-item">
                      <h5>HTTP Status & Latency</h5>
                      <p><b>${state.inspectResult.status_code}</b> · ${state.inspectResult.latency_ms}ms TTFB</p>
                    </div>
                    <div class="diag-item">
                      <h5>Index Coverage</h5>
                      <p>${esc(state.inspectResult.coverage)}</p>
                    </div>
                    <div class="diag-item">
                      <h5>Canonical Tag</h5>
                      <p class="truncate" title="${esc(state.inspectResult.canonical)}">${esc(state.inspectResult.canonical)}</p>
                    </div>
                    <div class="diag-item">
                      <h5>Mobile Friendly</h5>
                      <p>${state.inspectResult.mobile_friendly ? "✔ Viewport Verified" : "⚠ Missing Viewport"}</p>
                    </div>
                  </div>
                ` : ""}
              </div>

              <div class="card">
                <div class="card-head">
                  <h3>Technical SEO Scorecard (${d.health_score}/100)</h3>
                </div>
                <div>
                  ${audit.map(item => {
                    const st = (item.status || "pass").toLowerCase();
                    const cls = st === "pass" || st === "good" ? "pass" : st === "warn" || st === "warning" ? "warn" : "fail";
                    return `
                      <div class="check-row">
                        <div class="check-ico ${cls}">${cls === "pass" ? "✓" : "!"}</div>
                        <div style="flex:1">
                          <div class="between">
                            <b class="small">${esc(item.check || item.title || "Technical Check")}</b>
                            <span class="chip ${cls === "pass" ? "chip-green" : cls === "warn" ? "chip-amber" : "chip-red"}">${esc(item.value || item.status || "OK")}</span>
                          </div>
                          <p class="small text-2 mt-4">${esc(item.detail || item.fix || "")}</p>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            </div>
          </div>
        `}
      </section>
    `;
  }

  function bindTechSeoEvents() {
    bindDomainBarEvents();

    document.querySelectorAll("[data-ufilter]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.urlFilter = btn.dataset.ufilter;
        renderView();
      });
    });

    document.querySelectorAll(".url-cb").forEach(cb => {
      cb.addEventListener("change", () => {
        const u = cb.dataset.url;
        if (cb.checked) state.selectedUrls.add(u);
        else state.selectedUrls.delete(u);
        const pushBtn = document.getElementById("btn-push-index");
        if (pushBtn) pushBtn.innerHTML = `<span>⚡ Push Selected to Google & IndexNow (${state.selectedUrls.size})</span>`;
      });
    });

    document.getElementById("btn-select-batch")?.addEventListener("click", () => {
      const d = state.domainData;
      if (!d) return;
      const list = state.urlFilter === "unindexed" ? (d.unindexed_urls || []) : state.urlFilter === "indexed" ? (d.indexed_urls || []) : (d.urls || []);
      state.selectedUrls.clear();
      list.slice(0, 15).forEach(u => state.selectedUrls.add(u));
      renderView();
    });

    document.getElementById("btn-clear-batch")?.addEventListener("click", () => {
      state.selectedUrls.clear();
      renderView();
    });

    document.getElementById("btn-push-index")?.addEventListener("click", async () => {
      if (!state.selectedUrls.size) {
        toast("Select at least 1 URL to push to Indexing API", true);
        return;
      }
      const urls = Array.from(state.selectedUrls).slice(0, 15);
      toast(`Dispatching ${urls.length} URLs to Google Indexing API v3 & Bing IndexNow…`);
      try {
        const res = await fetch("/api/indexing/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urls,
            action: "URL_UPDATED",
            domain: state.domainData ? state.domainData.domain : ""
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast(`Dispatched ${data.dispatched_count} URLs to IndexNow & Google Indexing Queue!`);
          if (state.domainData) {
            state.domainData.unindexed_urls = (state.domainData.unindexed_urls || []).filter(u => !urls.includes(u));
            state.domainData.indexed_urls = [...new Set([...(state.domainData.indexed_urls || []), ...urls])];
          }
          state.selectedUrls.clear();
          renderView();
        } else {
          toast(data.error || "Dispatch failed", true);
        }
      } catch (e) {
        toast("Error dispatching URLs: " + e.message, true);
      }
    });

    const runInspect = async urlToInspect => {
      if (!urlToInspect) return;
      toast(`Inspecting live HTTP headers for ${urlToInspect}…`);
      try {
        const res = await fetch("/api/url/inspect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToInspect })
        });
        const data = await res.json();
        if (res.ok && !data.error) {
          state.inspectResult = data;
          toast(`HTTP ${data.status_code} (${data.latency_ms}ms)`);
          renderView();
        } else {
          toast(data.error || "Inspection failed", true);
        }
      } catch (e) {
        toast("Inspection error: " + e.message, true);
      }
    };

    document.getElementById("btn-run-inspect")?.addEventListener("click", () => {
      const val = document.getElementById("inspect-input")?.value;
      runInspect(val);
    });

    document.querySelectorAll("[data-inspect-url]").forEach(btn => {
      btn.addEventListener("click", () => runInspect(btn.dataset.inspectUrl));
    });
  }

  /* ==========================================================================
     VIEW 4: STRIKING DISTANCE (Page 2 Quick Wins + SERP Preview + 4-Part Diag)
     ========================================================================== */
  function renderQuickWinsView() {
    const d = state.domainData;
    const wins = d ? (d.quick_wins || []) : [];

    return `
      <section class="panel">
        <div class="page-head">
          <div>
            <h1>Striking Distance Quick Wins (Pos 4–20)</h1>
            <p>Pages ranking on bottom of Page 1 or top of Page 2 where a Click-Magnet SERP Title & Meta rewrite unlocks immediate traffic without new backlinks.</p>
          </div>
        </div>

        ${renderDomainAuditBar()}

        ${!d ? `
          <div class="empty">
            <div class="emoji-tile lg">⚡</div>
            <h3>Analyze a domain to detect Striking-Distance Keywords</h3>
            <p>We scan every discovered URL and build ready-to-paste Title & Meta upgrades.</p>
          </div>
        ` : `
          <div class="qw-grid">
            ${wins.map((w, idx) => {
              const title = w.recommended_title || `${w.query} — Verified Solutions | ${d.domain}`;
              const desc = w.recommended_meta || w.fix || `Explore ${w.query} on ${d.domain}. Compare features, transparent pricing, and real customer benchmarks.`;
              return `
                <div class="qw-card">
                  <div class="between">
                    <div>
                      <span class="chip chip-violet">Position #${w.position}</span>
                      <span class="chip">${w.impressions} impr/mo</span>
                      <span class="chip chip-amber">Current CTR ${w.ctr}</span>
                    </div>
                    <span class="tag-text green">${esc(w.potential_clicks || "+45 clicks/mo")}</span>
                  </div>

                  <div>
                    <div class="qw-query">"${esc(w.query)}"</div>
                    <div class="small muted truncate mt-4">${esc(w.url)}</div>
                  </div>

                  <div class="serp">
                    <div class="serp-url">
                      <span class="serp-fav">${esc(d.domain.slice(0, 2).toUpperCase())}</span>
                      <span class="truncate">${esc(w.url)}</span>
                    </div>
                    <div class="serp-title">${esc(title)}</div>
                    <div class="serp-desc">${esc(desc)}</div>
                  </div>

                  <div class="diag">
                    <div class="diag-item">
                      <h5>1. Detected Defect</h5>
                      <p>Ranking at Pos #${w.position} with ${w.ctr} CTR — missing power hook & year bracket in title tag.</p>
                    </div>
                    <div class="diag-item">
                      <h5>2. Root Cause</h5>
                      <p>Generic H1/Title fails to match commercial comparison intent for "${esc(w.query)}".</p>
                    </div>
                    <div class="diag-item">
                      <h5>3. Traffic Bleed</h5>
                      <p>Losing ${esc(w.potential_clicks || "+40 clicks/mo")} high-intent organic visits to top-3 results.</p>
                    </div>
                    <div class="diag-item">
                      <h5>4. Action Plan</h5>
                      <p>${esc(w.fix || "Deploy the rewritten SERP Title & Meta Description and add FAQPage schema.")}</p>
                    </div>
                  </div>

                  <div class="row gap-8">
                    <button class="btn btn-primary btn-sm" data-copy-title="${esc(title)}" type="button">Copy New Title</button>
                    <button class="btn btn-sm" data-copy-meta="${esc(desc)}" type="button">Copy Meta Description</button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `}
      </section>
    `;
  }

  function bindQuickWinsEvents() {
    bindDomainBarEvents();
    document.querySelectorAll("[data-copy-title]").forEach(btn => {
      btn.addEventListener("click", () => copyText(btn.dataset.copyTitle, "SERP Title copied!"));
    });
    document.querySelectorAll("[data-copy-meta]").forEach(btn => {
      btn.addEventListener("click", () => copyText(btn.dataset.copyMeta, "Meta Description copied!"));
    });
  }

  /* ==========================================================================
     VIEW 5: RANK TRACKER & 30% CONTENT REFRESH
     ========================================================================== */
  function renderRankTrackerView() {
    const d = state.domainData;
    const rows = d ? (d.rank_tracker || []) : [];

    return `
      <section class="panel">
        <div class="page-head">
          <div>
            <h1>Organic Rank Tracker & Decay Guard</h1>
            <p>Monitor keyword positions, 7-day movement, SERP features, and trigger the 30% Content Refresh Protocol for slipping pages.</p>
          </div>
        </div>

        ${renderDomainAuditBar()}

        ${!d ? `
          <div class="empty">
            <div class="emoji-tile lg">📈</div>
            <h3>Scan a domain to populate Rank Tracker</h3>
            <p>Track keyword positions, search volume, and SERP feature ownership.</p>
          </div>
        ` : `
          <div class="card">
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Target Keyword</th>
                    <th>Position</th>
                    <th>7d Delta</th>
                    <th>Volume</th>
                    <th>SERP Feature</th>
                    <th>Ranking Page</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(r => {
                    const chg = String(r.change || "0");
                    const isUp = chg.startsWith("+");
                    const isDown = chg.startsWith("-");
                    return `
                      <tr>
                        <td><b>${esc(r.keyword)}</b></td>
                        <td><span class="chip ${r.position <= 3 ? "chip-green" : r.position <= 10 ? "chip-blue" : "chip-amber"}">#${r.position}</span></td>
                        <td><span class="tag-text ${isUp ? "green" : isDown ? "amber" : ""}">${esc(chg)}</span></td>
                        <td>${esc(r.volume)}/mo</td>
                        <td><span class="chip">${esc(r.serp_feature || "Organic")}</span></td>
                        <td class="mono small truncate" style="max-width:240px">${esc(r.url)}</td>
                        <td>
                          <button class="btn btn-sm" data-boost-kw="${esc(r.keyword)}" data-boost-url="${esc(r.url)}" type="button">Push to Top 3</button>
                        </td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>
          </div>
        `}
      </section>
    `;
  }

  function bindRankTrackerEvents() {
    bindDomainBarEvents();
    document.querySelectorAll("[data-boost-kw]").forEach(btn => {
      btn.addEventListener("click", () => {
        const kw = btn.dataset.boostKw;
        const url = btn.dataset.boostUrl;
        const plan = [
          `=== 30% CONTENT REFRESH & TOP-3 BOOSTER PLAN ===`,
          `Target Keyword : ${kw}`,
          `Ranking URL    : ${url}`,
          ``,
          `1. Update H1 & Title Tag with 2026 freshness modifier and primary entity "${kw}".`,
          `2. Add a 45-word direct definition block immediately below the first H2 to capture Google AI Overviews.`,
          `3. Embed a comparison table + 4 FAQPage JSON-LD questions targeting long-tail variations of "${kw}".`,
          `4. Add 3 internal contextual links from high-authority pages using partial-match anchor text.`,
          `5. Push ${url} through the Instant Indexing API v3 dispatcher after publishing.`
        ].join("\n");
        copyText(plan, `Copied Top-3 Booster Checklist for "${kw}"`);
      });
    });
  }

  /* ==========================================================================
     VIEW 6: CAMPAIGNS (Google Ads Runner + ARM Stop-Loss Watchdog)
     ========================================================================== */
  function renderCampaignsView() {
    const d = state.domainData;
    const domainName = d ? d.domain : (state.adsWizard.domain || "yourbrand.com");
    const domainNegs = d && d.negatives ? d.negatives : state.adsWizard.negatives;

    return `
      <section class="panel">
        <div class="page-head">
          <div>
            <h1>Google Ads Campaign Architect & ARM Guardrails</h1>
            <p>Human-in-the-loop campaign builder with mandatory Negative Keyword Shield and 2× Target CPA automated stop-loss protection.</p>
          </div>
          <div class="row gap-8">
            <button class="btn" id="btn-ads-script" type="button">Get 24/7 Google Ads ARM Script</button>
          </div>
        </div>

        ${renderDomainAuditBar()}

        <div class="two-col">
          <!-- Campaign Builder -->
          <div class="card card-pad stack gap-16">
            <h3>1. Campaign Parameters & ROAS Guardrails</h3>
            <div class="diag">
              <div>
                <label class="label">Daily Test Budget (₹ / $)</label>
                <input class="input" id="ads-budget" type="number" value="${state.adsWizard.budget}">
              </div>
              <div>
                <label class="label">Target CPA (Stop-Loss triggers at 2×)</label>
                <input class="input" id="ads-cpa" type="number" value="${state.adsWizard.cpa}">
              </div>
            </div>

            <div>
              <label class="label">High-Intent [Exact] & "Phrase" Match Keywords (No Broad Match bleed)</label>
              <textarea class="textarea" id="ads-keywords" style="min-height:110px">[${domainName.split(".")[0]} pricing]
"${domainName.split(".")[0]} alternative"
[hire dedicated developers]
"enterprise software audit"</textarea>
            </div>

            <div>
              <div class="between">
                <label class="label" style="margin:0">Mandatory Negative Keyword Defense (${domainNegs.length} blocked terms)</label>
                <button class="btn btn-sm" id="btn-copy-negs" type="button">Copy Negative List</button>
              </div>
              <div class="row wrap gap-8 mt-8">
                ${domainNegs.map(n => `<span class="chip chip-red">-${esc(n)}</span>`).join("")}
              </div>
            </div>

            <div class="row gap-8">
              <button class="btn btn-primary" id="btn-launch-campaign" type="button">Review & Approve Protected Campaign</button>
              <button class="btn" id="btn-spy-competitor" type="button">Extract Competitor Keywords</button>
            </div>
          </div>

          <!-- ARM Live Telemetry -->
          <div class="card card-pad stack gap-12">
            <div class="between">
              <h3>2. Autonomous Stop-Loss Watchdog (ARM)</h3>
              <span class="chip chip-green">Rule: Spend &gt; 2× CPA (₹${state.adsWizard.cpa * 2}) &amp; 0 Conv → Auto-Pause</span>
            </div>
            <p class="small text-2">Every active ad group and keyword is evaluated hourly. Bleeders are paused automatically and replaced with a fresh Variant B hook.</p>
            <div id="ads-launch-output" class="code-block" style="min-height:240px">${esc([
              `[ARM WATCHDOG READY — ${domainName.toUpperCase()}]`,
              `• Bidding Mode     : Max Conversions (Phrase + Exact Match only)`,
              `• Daily Budget     : ₹${state.adsWizard.budget}/day (7-Day Safe Validation Phase)`,
              `• Target CPA       : ₹${state.adsWizard.cpa}  |  Hard Auto-Kill Threshold: ₹${state.adsWizard.cpa * 2}`,
              `• Negative Shield  : ${domainNegs.length} negative terms pre-attached`,
              `• Status           : Awaiting Human-in-the-Loop Approval`
            ].join("\n"))}</div>
          </div>
        </div>
      </section>
    `;
  }

  function bindCampaignsEvents() {
    bindDomainBarEvents();

    document.getElementById("btn-copy-negs")?.addEventListener("click", () => {
      const d = state.domainData;
      const negs = d && d.negatives ? d.negatives : state.adsWizard.negatives;
      copyText(negs.map(n => `"${n}"`).join("\n"), "Negative Keyword Shield copied!");
    });

    document.getElementById("btn-launch-campaign")?.addEventListener("click", async () => {
      const budget = Number(document.getElementById("ads-budget")?.value || 1500);
      const cpa = Number(document.getElementById("ads-cpa")?.value || 450);
      state.adsWizard.budget = budget;
      state.adsWizard.cpa = cpa;
      const domain = state.domainData ? state.domainData.domain : "yourbrand.com";

      try {
        const res = await fetch("/api/ads/campaign/launch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, budget, target_cpa: cpa, goal: "leads" })
        });
        const data = await res.json();
        const out = document.getElementById("ads-launch-output");
        if (out) out.textContent = JSON.stringify(data, null, 2);
        toast("Campaign blueprint staged with 2× CPA stop-loss guardrails!");
      } catch (e) {
        toast("Error staging campaign: " + e.message, true);
      }
    });

    document.getElementById("btn-spy-competitor")?.addEventListener("click", async () => {
      const domain = state.domainData ? state.domainData.domain : "example.com";
      try {
        const res = await fetch("/api/ads/competitor/keywords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain })
        });
        const data = await res.json();
        const out = document.getElementById("ads-launch-output");
        if (out) out.textContent = JSON.stringify(data, null, 2);
        toast(`Extracted high-intent keywords for ${domain}`);
      } catch (e) {
        toast("Competitor extraction failed", true);
      }
    });

    document.getElementById("btn-ads-script")?.addEventListener("click", async () => {
      try {
        const res = await fetch("/api/ads/script/code");
        const data = await res.json();
        const codeText = data.code || data.script;
        if (codeText) {
          copyText(codeText, "Copied Google Ads 24/7 ARM Script to clipboard!");
          const out = document.getElementById("ads-launch-output");
          if (out) out.textContent = codeText;
        }
      } catch (_) {}
    });
  }

  /* ==========================================================================
     VIEW 7: OFF-PAGE SEO & DIGITAL PR
     ========================================================================== */
  function renderOffPageView() {
    const a = state.anchorCounts;
    const total = Math.max(1, a.branded + a.naked + a.generic + a.partial + a.exact);
    const exactPct = Math.round((a.exact / total) * 100);
    const safe = exactPct <= 8;
    const dom = state.domainData ? state.domainData.domain : "yourbrand.com";

    const directories = [
      { name: "Clutch.co", dr: 91, type: "B2B Verified Reviews", url: "https://clutch.co" },
      { name: "G2 Crowd", dr: 92, type: "SaaS & Software Entity", url: "https://www.g2.com" },
      { name: "Crunchbase", dr: 91, type: "Knowledge Graph Entity", url: "https://www.crunchbase.com" },
      { name: "Product Hunt", dr: 90, type: "Launch & Tech Backlink", url: "https://www.producthunt.com" },
      { name: "GoodFirms", dr: 86, type: "IT & Agency Verification", url: "https://www.goodfirms.co" },
      { name: "Trustpilot", dr: 93, type: "Consumer & B2B Trust", url: "https://www.trustpilot.com" }
    ];

    return `
      <section class="panel">
        <div class="page-head">
          <div>
            <h1>Off-Page Authority, Entity Schema & SpamBrain Shield</h1>
            <p>Maintain natural backlink anchor ratios, claim DR 85+ entity profiles, and deploy Knowledge Graph sameAs JSON-LD.</p>
          </div>
        </div>

        <div class="two-col">
          <div class="card card-pad stack gap-12">
            <div class="between">
              <h3>SpamBrain Anchor Text Ratio Calculator</h3>
              <span class="chip ${safe ? "chip-green" : "chip-red"}">
                ${safe ? `Safe Profile (Exact Match ${exactPct}%)` : `⚠ Over-Optimization Risk (${exactPct}% Exact)`}
              </span>
            </div>
            <p class="small text-2">Keep Exact-Match commercial anchors below 5–8% and Branded + Naked URLs above 65% to prevent Google link-spam demotions.</p>

            <div class="diag">
              <div class="diag-item">
                <h5>Branded Anchors (Target ~50%)</h5>
                <p><b>${Math.round((a.branded / total) * 100)}%</b> (${a.branded} links)</p>
              </div>
              <div class="diag-item">
                <h5>Naked URL (Target ~20%)</h5>
                <p><b>${Math.round((a.naked / total) * 100)}%</b> (${a.naked} links)</p>
              </div>
              <div class="diag-item">
                <h5>Partial / Topic Match (~15%)</h5>
                <p><b>${Math.round((a.partial / total) * 100)}%</b> (${a.partial} links)</p>
              </div>
              <div class="diag-item">
                <h5>Exact Match (Keep &le; 5%)</h5>
                <p><b>${exactPct}%</b> (${a.exact} links)</p>
              </div>
            </div>
          </div>

          <div class="card card-pad stack gap-12">
            <h3>Tier-1 B2B Entity Directories (DR 86–93)</h3>
            <div class="stack gap-8">
              ${directories.map(dir => `
                <div class="between" style="padding:8px 12px;border:1px solid var(--border);border-radius:10px">
                  <div>
                    <b>${esc(dir.name)}</b>
                    <span class="small muted"> · ${esc(dir.type)}</span>
                  </div>
                  <div class="row gap-8">
                    <span class="chip chip-green">DR ${dir.dr}</span>
                    <a class="btn btn-sm" href="${dir.url}" target="_blank" rel="noopener">Open ↗</a>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /* ==========================================================================
     VIEW 8: WHITE-LABEL CLIENT REPORT (Printable A4 Executive Report)
     ========================================================================== */
  function renderReportView() {
    const d = state.domainData;
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    return `
      <section class="panel">
        <div class="page-head no-print">
          <div>
            <h1>Executive White-Label Client Report</h1>
            <p>Print or save as a clean A4 PDF for client presentations and agency handoffs.</p>
          </div>
          <button class="btn btn-primary" id="btn-print-report" type="button">🖨️ Print / Save as PDF</button>
        </div>

        <div class="report">
          <div class="report-head">
            <div>
              <span class="chip chip-violet">CONFIDENTIAL GROWTH AUDIT</span>
              <h2 style="font-size:24px;margin-top:8px">${d ? esc(d.domain) : "Executive SEO & Paid Search Audit"}</h2>
              <p class="small text-2 mt-4">Prepared via Adxlead Growth OS · ${esc(dateStr)}</p>
            </div>
            <div style="text-align:right">
              <div style="font-size:32px;font-weight:800;color:var(--primary)">${d ? d.health_score + "/100" : "—"}</div>
              <div class="small muted">Overall Health Score</div>
            </div>
          </div>

          ${!d ? `
            <div class="empty">
              <p>Run a domain scan in the Home or Technical SEO tab to populate this executive report.</p>
            </div>
          ` : `
            <div class="stats mt-20">
              <div class="stat"><div class="label-sm">Crawled URLs</div><div class="value">${d.urls_count}</div></div>
              <div class="stat"><div class="label-sm">Unindexed Queue</div><div class="value">${(d.unindexed_urls || []).length}</div></div>
              <div class="stat"><div class="label-sm">Striking Distance</div><div class="value">${(d.quick_wins || []).length}</div></div>
              <div class="stat"><div class="label-sm">TTFB Latency</div><div class="value">${d.latency_ms}ms</div></div>
            </div>

            <h3 class="mt-24">1. Top Striking-Distance Quick Wins (Pos 4–20)</h3>
            <div class="table-wrap mt-12">
              <table class="table">
                <thead>
                  <tr><th>Query</th><th>Pos</th><th>CTR</th><th>Recommended Title Upgrade</th></tr>
                </thead>
                <tbody>
                  ${(d.quick_wins || []).map(w => `
                    <tr>
                      <td><b>${esc(w.query)}</b></td>
                      <td>#${w.position}</td>
                      <td>${w.ctr}</td>
                      <td>${esc(w.recommended_title || w.fix)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </section>
    `;
  }

  /* ---------- Master View Router ---------- */
  function renderView() {
    const root = document.getElementById("view-root");
    if (!root) return;

    switch (state.view) {
      case "home":
        root.innerHTML = renderHomeView();
        bindHomeEvents();
        break;
      case "tech-seo":
        root.innerHTML = renderTechSeoView();
        bindTechSeoEvents();
        break;
      case "quick-wins":
        root.innerHTML = renderQuickWinsView();
        bindQuickWinsEvents();
        break;
      case "rank-tracker":
        root.innerHTML = renderRankTrackerView();
        bindRankTrackerEvents();
        break;
      case "campaigns":
        root.innerHTML = renderCampaignsView();
        bindCampaignsEvents();
        break;
      case "off-page":
        root.innerHTML = renderOffPageView();
        break;
      case "report":
        root.innerHTML = renderReportView();
        document.getElementById("btn-print-report")?.addEventListener("click", () => window.print());
        break;
      case "templates":
      default:
        root.innerHTML = renderTemplatesView();
        bindTemplatesEvents();
        break;
    }
  }

  /* ---------- Global Shell Controls ---------- */
  function initShellEvents() {
    // New Audit button -> switch to Home and focus domain input
    document.getElementById("btn-new-audit")?.addEventListener("click", () => {
      state.view = "home";
      state.collection = null;
      renderNav();
      renderView();
      setTimeout(() => document.getElementById("domain-input")?.focus(), 50);
    });

    // Desktop & Mobile sidebar slide toggle
    document.getElementById("menu-toggle")?.addEventListener("click", () => {
      if (window.innerWidth <= 860) {
        document.getElementById("sidebar")?.classList.toggle("open");
      } else {
        document.body.classList.toggle("sidebar-collapsed");
      }
    });

    // Global Search + Ctrl+K
    const searchInput = document.getElementById("global-search");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.searchQuery = searchInput.value;
        if (state.view !== "templates") {
          state.view = "templates";
          state.collection = null;
          renderNav();
        }
        renderView();
      });
    }
    window.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInput?.focus();
      }
    });

    // Language selector
    const langSel = document.getElementById("lang-select");
    if (langSel) {
      langSel.value = state.lang;
      langSel.addEventListener("change", () => {
        state.lang = langSel.value;
        localStorage.setItem("adx_lang", state.lang);
        renderNav();
        renderView();
      });
    }

    // What's New popover
    const wnBtn = document.getElementById("btn-whats-new");
    const wnPop = document.getElementById("pop-whats-new");
    if (wnBtn && wnPop) {
      wnPop.innerHTML = `
        <div class="popover-item">
          <b>✨ MarkAI Clean SaaS Workspace v3.0</b>
          <span>Redesigned with 16 interactive AI SEO & Google Ads templates, Favorite/Popular/Recent collections, and instant domain auditing.</span>
        </div>
        <div class="popover-item">
          <b>🛡️ Zero Background Pings</b>
          <span>100% on-demand architecture — domains are only crawled when you explicitly click Analyze.</span>
        </div>
        <div class="popover-item">
          <b>⚡ Instant Indexing API v3 + IndexNow</b>
          <span>Segment unindexed sitemap URLs and push 15 URLs per batch in one click.</span>
        </div>
      `;
      wnBtn.addEventListener("click", e => {
        e.stopPropagation();
        wnPop.classList.toggle("hidden");
      });
      document.addEventListener("click", () => wnPop.classList.add("hidden"));
    }
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const requestedView = params.get("view");
    const requestedDomain = params.get("domain");

    if (requestedView && NAV_ITEMS.some(n => n.id === requestedView)) {
      state.view = requestedView;
    }

    initShellEvents();
    renderNav();
    renderView();

    // Load local SQLite history & ARM state (never pings external domains)
    loadHistoryList();
    loadArmStatus();

    // Only if user explicitly submitted ?domain= from the homepage form:
    if (requestedDomain) {
      state.view = requestedView || "home";
      renderNav();
      renderView();
      analyzeDomain(requestedDomain);
    }
  });
})();

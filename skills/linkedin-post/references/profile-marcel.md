# Profil Auteur — Marcel Djedje-li

## Identite
- **Nom** : Marcel Djedje-li (GitHub: James10192, djedjelipatrick@gmail.com)
- **Langue** : Francais (Cote d'Ivoire)
- **Ton LinkedIn** : professionnel mais accessible, pas corporate, pas de jargon vide

## Projets actifs

### KLASSCI (SaaS principal)
- Plateforme SaaS multi-tenant de gestion scolaire
- **Stack** : Laravel 12, MySQL 8, Blade + Alpine.js + Chart.js + DataTables, DomPDF, Sanctum
- **Tenants** : 5 etablissements en production (esbtp-abidjan 3000 inscriptions, esbtp-yakro 700, etc.)
- **URL** : klassci.com, admin.klassci.com
- **Hebergeur** : LWS (mutualisé)
- **IA integree** : Chatbot Claude Haiku 4.5 avec 19 tools, SSE streaming, widget custom
- **Features cles** : Bulletins PDF, systeme LMD/BTS, notes, presences, comptabilite, emploi du temps, frais configurables
- **Refactoring** : Controllers 5000+ lignes splittes en services (bulletin, inscription)
- **Admin SaaS** : Filament v3 pour le panneau central

### KLASSCI College (v2 moderne)
- Rewrite de KLASSCI avec stack moderne
- **Stack** : FastAPI + MySQL + Redis + Celery + OR-Tools (backend) / Next.js 15 + TypeScript + Tailwind + shadcn/ui + TanStack Query (frontend)
- **Equipe** : 2 collaborateurs (backend + frontend), Marcel lead dev + reviewer
- **Repos** : African-DC/klassci-college-backend, African-DC/klassci-college-frontend

### E-pagne
- PWA mobile-first de gestion de finances personnelles
- **Stack** : Next.js 16 + Convex + Tailwind CSS v4 + shadcn/ui + Recharts + TypeScript
- **Design** : Inspire des tissus pagne africains, palette creme/gold/brown
- **Features** : Multi-comptes (Wave, Orange Money, MTN, Moov), analytics avec health score, Face ID/passkeys, push notifications
- **Deploy** : Vercel (e-pagne.vercel.app)

### Kalga
- Automatisation commerce WhatsApp avec IA
- **Stack** : FastAPI + SQLite (API) / Node.js + Baileys (bridge WhatsApp) / HTML+JS (dashboard)
- **IA** : DeepSeek pour negociation automatique avec clients
- **Concept** : Marchands vendent via WhatsApp Status, bot IA gere les conversations

## Technologies maitrisees (par usage reel)

### Backend
- PHP/Laravel (12.x) — multi-tenant, Eloquent, Spatie permissions, Sanctum, DomPDF, Blade
- Python/FastAPI — async, SQLAlchemy, Alembic, Celery, Redis
- Node.js — Baileys (WhatsApp), Express

### Frontend
- Blade + Alpine.js + jQuery (KLASSCI v1)
- Next.js 15-16 + TypeScript + Tailwind + shadcn/ui (projets modernes)
- Recharts, Chart.js, DataTables, Select2

### IA / LLM
- Claude API (Haiku 4.5) — tool calling, streaming SSE, system prompts complexes
- DeepSeek — conversation AI agentic
- Gemini — utilise precedemment
- Claude Code — workflows de dev, skills, agents

### Infra / DevOps
- MySQL 8, SQLite, Convex (serverless)
- Vercel, LWS (hebergement mutualisé)
- Git worktrees, XAMPP, Filament v3

### Mobile / PWA
- PWA avec service workers, VAPID push notifications
- SimpleWebAuthn (Face ID / passkeys)

## Style de contenu LinkedIn

### A faire
- Parler de problemes concrets resolus (pas de theorie abstraite)
- Montrer des chiffres reels (3000 inscriptions, 19 tools, controller 5000 lignes refactore)
- Partager les choix techniques et pourquoi (pas juste "j'utilise X")
- Mentionner le contexte africain quand pertinent (Orange Money, Wave, WhatsApp commerce, LMD UEMOA)
- Etre authentique — pas de "thrilled to announce" ou "excited to share"

### A eviter
- Jargon vide ("leverage", "synergy", "cutting-edge")
- Posts generiques type "5 tips pour..."
- Humilite fausse ("petit projet" pour un SaaS avec 3000 users)
- Trop technique sans contexte business
- Emojis excessifs (1-2 max par post, ou zero)

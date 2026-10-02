# LearnStratum Documentation Hub 📚

Welcome to the official technical documentation for **LearnStratum**, the autonomous AI-powered curriculum generator and cognitive spaced repetition platform.

---

## 📑 Documentation Index

| Guide | Description |
|---|---|
| [**Architecture Overview**](./architecture.md) | High-level system architecture, client-server data flow, App Router patterns, multi-tier Gemini auto-fallback, and security isolation. |
| [**Feature Deep Dive**](./features.md) | In-depth breakdown of all 10 core subsystems: Curriculum Synthesis, Multi-Modal Harvester, Classroom & AI Tutor, SM-2 Engine, Gamification, Public Feed, pgvector Search, Certificates, Credits, and Animations. |
| [**Database Schema & Migrations**](./database-schema.md) | Complete PostgreSQL table definitions, Entity-Relationship (ER) diagram, pgvector embedding functions, RLS policies, and triggers. |
| [**API & Server Actions Reference**](./api-reference.md) | Full specifications for Server Actions, SSE streaming `/api/tutor` endpoint, parameter types, return signatures, and error codes. |
| [**Setup & Deployment Guide**](./setup-guide.md) | Prerequisites, local installation, environment variables setup, Supabase migration sequencing, Vercel deployment, and troubleshooting. |

---

## ⚡ Quick Architecture Glance

```
Learner Browser (React 19 + Motion v12)
        │
        ▼
Next.js 16 App Router (SSR + Server Actions)
        │
        ├─► Supabase (PostgreSQL 15 + RLS + pgvector + Auth)
        ├─► Google Gemini API (Multi-model Auto-Fallback: 2.5 Flash / 2.0 / 1.5)
        ├─► YouTube Data API v3 (Verified Video Lectures via youtube-nocookie.com)
        ├─► Tavily AI Search + Jina Reader (Ad-Free Markdown Documentation)
        └─► PostgreSQL SHA-256 AI Response Cache
```

---

## 🎯 Key Metrics & Highlights

- **Zero-Cost Infrastructure:** Runs on permanent free tiers across Vercel, Supabase, Google AI Studio, and YouTube Data API.
- **Zero Hallucinations:** Real-time multi-modal harvester replaces LLM link fabrication with authentic lectures and parsed documentation.
- **Cognitive Retention:** Incorporates SuperMemo-2 (SM-2) algorithmic review scheduling to prevent the Ebbinghaus forgetting curve.
- **Gamified Consistency:** 5 Stratum ranks, daily study streaks, unlockable mastery badges, and cryptographically verifiable completion certificates.
- **Fluid UX:** Full page-route transitions and tactile micro-interactions powered by `motion` (`v12`).

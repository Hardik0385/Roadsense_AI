# RoadSense AI — Technical Artifacts & Links

## 🔗 1. Repository & Production Deployment Links

| Resource | URL | Description |
| :--- | :--- | :--- |
| **Live Production Web App** | [https://roadsense-ai-one.vercel.app/](https://roadsense-ai-one.vercel.app/) | Live Next.js 16 operations cockpit deployed on Vercel |
| **GitHub Monorepo Repository** | [https://github.com/Hardik0385/Roadsense_AI](https://github.com/Hardik0385/Roadsense_AI) | Complete source code, services, algorithms, and documentation |
| **Documentation Root** | [GitHub docs/ Folder](https://github.com/Hardik0385/Roadsense_AI/tree/main/docs) | Architecture Decision Records (ADRs), 3NF SQL DDL, solution docs |

---

## 🔑 2. Testing Credentials & User Profiles

You can log in to the live production deployment using any of the following methods:

### Option A: One-Click Demo Personas (Instant Access)
- **Fleet Operations Lead:**
  - Name: `Hardik Agrawal`
  - Email: `hardik.demo@roadsense.ai`
  - Department: `Enterprise Fleet Intelligence`
- **NHAI Incident Dispatcher:**
  - Name: `Dr. Priya Menon`
  - Email: `priya.demo@morth.gov.in`
  - Department: `NHAI Emergency Response Unit`
- **Municipal Traffic Engineer:**
  - Name: `Vikramaditya Rao`
  - Email: `vikram.demo@traffic.gov.in`
  - Department: `Urban Corridor Control Bureau`

### Option B: OAuth 2.0 Single Sign-On
- **Google OAuth 2.0:** Click *"Continue with Google"* to authenticate with your Google account.
- **GitHub OAuth:** Click *"Continue with GitHub"* to authenticate with your GitHub account.

---

## 🛠️ 3. Technology Stack Summary

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5.3, Tailwind CSS v4, MapLibre GL JS, Recharts, Lucide Icons.
- **Backend API:** Fastify 4.26, WebSocket (`@fastify/websocket`), Node.js v20 LTS.
- **Streaming Pipeline:** Apache Kafka 7.4 (Multi-partition broker), 100,000-vehicle simulator.
- **Data Persistence:** PostgreSQL 15 (3NF Core), TimescaleDB (Time-series partitions), Redis 7.2 (Hot coordinate cache), `pgvector` (AI RAG embeddings).
- **Validation Engine:** `@roadsense/validation` (ISO 3779 VIN, SAE J2019 DTC, Dijkstra EV charger graph search, Streaming Bloom Filter).

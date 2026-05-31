# CareerPilot AI

CareerPilot AI is an enterprise-grade, venture-backed scale AI career development ecosystem. Built on a clean MERN monorepo using React 19, Node.js, and TypeScript, this platform combines dynamic AI agents, secure compiler sandboxing, and real-time Socket.io channels to provide an elite, end-to-end recruitment accelerator.

---

## 🚀 Architecture Highlights

1. **Clean Monorepo Design**: Workspace architecture keeping types (`packages/types`), shared helper classes (`packages/shared`), and configurations isolated from applications.
2. **Three-layer Sandbox Compiler**: Secure execution of Python, Java, C++, and Javascript inside:
   - Primary: Isolated Docker alpine containers constrained to `128MB` memory and `0.5` CPU core.
   - Secondary: Failover routing to Piston developer execution API.
   - Fallback: Strict in-process Node `vm` context with timeouts and disabled standard modules.
3. **10-Agent AI Gateway**: Dedicated Gemini prompts orchestrator utilizing structured JSON generation to execute CV parser scans, mock behavioral STAR analyses, and custom timelines recommendations.
4. **Decoupled Event-Driven Flow**: Local `AppEventBus` triggers achievements, XP, level recalculations, and notification dispatches decoupely, designed for future BullMQ migrations.
5. **Security Hardening**: Standard JWT Token Rotation to catch token reuse, Helmet CSP configurations, rate-limiting guards, and input XSS sanitizers.

---

## 📂 Project Structure

```
CareerPilot AI/
├── apps/
│   ├── web/                     # React 19 Client SPA (Vite)
│   └── api/                     # Express.js Server Gateway (TypeScript)
├── packages/
│   ├── types/                   # Shared interfaces & data models
│   └── shared/                  # EventBus, winston loggers, custom errors
├── infra/
│   ├── docker/                  # Environment files
│   └── github-actions/          # GitHub actions workflow configs
├── docker-compose.yml           # Local multi-service orchestration
└── nginx.conf                   # Reverse proxy static routes distribution
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI
- Docker (optional, for Tier 1 code compiler sandboxing)

### 1. Configure Environments
Create a `.env` file inside `apps/api/` (use the template provided in `.env.example` as a base reference).

### 2. Install Workspaces Dependencies
In the root directory, run:
```bash
npm install
```

### 3. Start Development Servers
Run the full monorepo concurrently:
```bash
npm run dev
```
The client console launches at `http://localhost:5173`, and the API gateway starts at `http://localhost:5000`.

---

## 🐳 Docker Deployment Setup

Spin up the entire production environment (Database, API, Nginx, and client statics) using Docker Compose:
```bash
docker compose up --build
```
Nginx acts as the primary ingress port `80`, handling client routes and reverse proxying API parameters to the backend safely.

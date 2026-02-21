# 🛍️ LUXE — Java Full Stack E-Commerce Platform

> Production-grade monorepo: **Spring Boot** (backend) + **ReactJS** (frontend)  
> Deployed via **GitHub Actions CI/CD** → **Railway** (Spring Boot + MySQL) + **Vercel** (React)  
> Supports **lakhs of concurrent users** via horizontal scaling, connection pooling & CDN

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     GITHUB REPOSITORY                   │
│                                                         │
│   main ──► staging ──► dev ──► feature/* branches       │
│                 ↓ GitHub Actions CI/CD                  │
└─────────────────────────────────────────────────────────┘
         ↓ Backend                      ↓ Frontend
  ┌─────────────┐                 ┌─────────────┐
  │   Railway   │                 │   Vercel    │
  │ Spring Boot │◄───API calls────│   ReactJS   │
  │  (Docker)   │                 │  (CDN/Edge) │
  └──────┬──────┘                 └─────────────┘
         │
  ┌──────▼──────┐
  │   Railway   │
  │   MySQL 8   │ ← Managed DB, auto-backups, 
  │  (Managed)  │   connection pooling (HikariCP)
  └─────────────┘
```

---

## 👥 4-Member Team & Branch Strategy

| Member | Role | Branch | Deploys To |
|---|---|---|---|
| Member 1 | Backend Lead | `feature/backend-*` → `dev` | Dev environment |
| Member 2 | Frontend Lead | `feature/frontend-*` → `dev` | Dev environment |
| Member 3 | DevOps/QA | `staging` | Staging environment |
| Member 4 | Full Stack / PM | Merges to `main` | Production |

### Branch Flow
```
feature/* ──► dev ──► staging ──► main (production)
```

- **`feature/*`** — Individual developer branches  
- **`dev`** — Merged features, CI runs tests  
- **`staging`** — Pre-production, full integration tests  
- **`main`** — Production, auto-deploys on merge

---

## 📁 Repository Structure

```
luxe-fullstack/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml               # Run tests on every PR
│   │   ├── deploy-staging.yml   # Deploy to staging on push to staging
│   │   ├── deploy-production.yml # Deploy to production on push to main
│   │   └── pr-checks.yml        # PR quality gates (lint, test, build)
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── backend/                     # Spring Boot (Java 17)
│   ├── src/
│   ├── Dockerfile
│   ├── pom.xml
│   └── README.md
├── frontend/                    # ReactJS
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── vercel.json
├── docker/
│   └── docker-compose.yml       # Local full-stack development
├── scripts/
│   ├── setup.sh                 # One-command local setup
│   └── seed-db.sh               # Database seeding
└── docs/
    ├── API.md                   # API documentation
    ├── DEPLOYMENT.md            # Deployment guide
    └── CONTRIBUTING.md          # Team contribution guide
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Java 17, Maven 3.8+
- Node.js 18+, npm
- Docker & Docker Compose
- Git

### One Command Setup
```bash
git clone https://github.com/jaswanth457259/luxe-fullstack.git
cd luxe-fullstack
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Setup
```bash
# Start MySQL via Docker
docker-compose -f docker/docker-compose.yml up -d mysql

# Backend
cd backend
mvn spring-boot:run

# Frontend (new terminal)
cd frontend
npm install && npm run dev
```

---

## 🌐 Live URLs

| Environment | Frontend | Backend API |
|---|---|---|
| Production | `https://luxe.vercel.app` | `https://luxe-api.railway.app/api` |
| Staging | `https://luxe-staging.vercel.app` | `https://luxe-api-staging.railway.app/api` |
| Dev | `http://localhost:5173` | `http://localhost:8080/api` |

---

## 📖 Swagger API Docs
`https://luxe-api.railway.app/api/swagger-ui.html`

---

## 🔑 GitHub Secrets Required

Go to: `Repository → Settings → Secrets and Variables → Actions`

| Secret Name | Description |
|---|---|
| `RAILWAY_TOKEN` | Railway deployment token |
| `RAILWAY_SERVICE_ID_PROD` | Production service ID |
| `RAILWAY_SERVICE_ID_STAGING` | Staging service ID |
| `VERCEL_TOKEN` | Vercel deployment token |
| `VERCEL_ORG_ID` | Your Vercel organization ID |
| `VERCEL_PROJECT_ID` | Your Vercel project ID |
| `DB_URL_PROD` | Production MySQL JDBC URL |
| `DB_USERNAME_PROD` | Production DB username |
| `DB_PASSWORD_PROD` | Production DB password |
| `JWT_SECRET_PROD` | Production JWT secret (256-bit) |
| `SONAR_TOKEN` | SonarQube analysis token |

---

## 🧪 Running Tests
```bash
# Backend unit tests (JUnit 5 + Mockito)
cd backend && mvn test

# Backend with coverage report
cd backend && mvn verify jacoco:report

# Frontend tests
cd frontend && npm test
```

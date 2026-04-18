# PAASHU - Complete Project Development Guide (Part 2)

This document continues your blueprint with implementation-ready guidance for:
1. Mobile App Development
2. Deployment and DevOps
3. Bharat Pashudhan Integration
4. Testing and Quality Assurance
5. Performance Optimization
6. Security Implementation

---

## Phase 5: Mobile App Development (React Native)

### 5.1 Mobile Tech Stack

Use React Native + Expo for fastest delivery and easier camera integration.

```bash
cd mobile
npx create-expo-app@latest paashu-mobile
cd paashu-mobile
npm install axios @react-navigation/native @react-navigation/native-stack
npm install expo-image-picker expo-camera expo-file-system
npm install @tanstack/react-query zustand
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
```

### 5.2 Mobile App Structure

```text
mobile/paashu-mobile/src/
|-- screens/
|   |-- Auth/
|   |-- Home/
|   |-- Prediction/
|   |-- BreedDetails/
|   `-- Profile/
|-- components/
|-- services/
|-- store/
|-- hooks/
`-- utils/
```

### 5.3 Core Mobile Features

1. Authentication screens (Login/Register) with token storage.
2. Camera capture + gallery upload for breed identification.
3. Prediction results screen with confidence bars and top-3 breeds.
4. Offline cache for recent predictions and saved breed cards.
5. Push notifications for vaccination reminders (future extension).

### 5.4 Camera Upload Flow

1. Ask camera and media permissions on app start.
2. Capture image or pick from gallery.
3. Compress image before upload (`maxWidth: 1280`, quality `0.75`).
4. Upload via multipart form-data to `/api/predictions/predict?device=mobile`.
5. Show progress loader and retry option on failure.

### 5.5 Mobile Milestones

1. Week 1: auth + navigation + API client.
2. Week 2: camera/gallery + prediction flow.
3. Week 3: history + breed detail + state management.
4. Week 4: polish, offline caching, release build.

---

## Phase 6: Deployment and DevOps

### 6.1 Containerization

Create `deployment/docker-compose.yml`:

```yaml
version: "3.9"
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: paashu_db
      POSTGRES_USER: paashu_user
      POSTGRES_PASSWORD: paashu_pass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build: ../backend
    env_file:
      - ../backend/.env
    depends_on:
      - db
      - redis
    ports:
      - "5000:5000"
    volumes:
      - ../backend:/app

  frontend:
    build: ../frontend
    depends_on:
      - backend
    ports:
      - "5173:5173"

volumes:
  pgdata:
```

### 6.2 Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "run.py"]
```

### 6.3 Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

### 6.4 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/ci.yml`:

1. Run backend lint and tests.
2. Run frontend lint and tests.
3. Build backend and frontend Docker images.
4. Push to registry on `main`.
5. Trigger deployment job.

### 6.5 Cloud Deployment Options

1. MVP: Render/Railway/Fly.io (fastest setup).
2. Scale path: AWS (ECS + RDS + ElastiCache + CloudFront).
3. ML inference scaling: separate GPU-backed inference service.

### 6.6 Environment Separation

Maintain 3 environments with separate DBs and secrets:
1. Development
2. Staging
3. Production

---

## Phase 7: Bharat Pashudhan Portal Integration

### 7.1 Integration Goals

1. Sync official breed metadata and classification references.
2. Pull advisory updates (health, breeding, nutrition).
3. Map PAASHU breed IDs to Bharat Pashudhan IDs.

### 7.2 Integration Service Design

Create `backend/app/services/bharat_pashudhan_service.py`:

Responsibilities:
1. Auth and token management for external API.
2. Breed fetch and normalization.
3. Scheduled sync and conflict resolution.
4. Error logging and retry.

### 7.3 Data Mapping Table

Create a table `breed_external_mapping`:

1. `id`
2. `breed_id` (FK to local breed)
3. `external_source` (`bharat_pashudhan`)
4. `external_breed_id`
5. `last_synced_at`

### 7.4 Sync Strategy

1. Nightly full sync at 2:00 AM.
2. Incremental sync every 6 hours if endpoint supports updates.
3. Manual admin-triggered sync endpoint.

### 7.5 Fallback Rules

1. If external API is down, serve local cached breed data.
2. Mark external advisory fields as stale with timestamp.
3. Retry with exponential backoff (1m, 5m, 15m, 1h).

---

## Phase 8: Testing and Quality Assurance

### 8.1 Backend Test Plan

Use `pytest` with target coverage:
1. Unit tests: models, services, validation utilities.
2. API tests: auth, breeds, predictions, analytics.
3. Integration tests: DB + ML service mock.
4. Minimum coverage target: 80%.

### 8.2 Frontend Test Plan

Use `vitest` + React Testing Library:
1. Component render and behavior tests.
2. Store/action tests for auth and prediction flows.
3. Route protection tests.
4. Error and loading state tests.

### 8.3 Mobile Test Plan

1. Component tests for upload and result screens.
2. Device tests on Android low-memory devices.
3. Offline mode tests for cached views.

### 8.4 End-to-End Testing

Use Playwright or Cypress:
1. Register/login flow.
2. Image upload and prediction response.
3. History retrieval and details screen.
4. Profile update flow.

### 8.5 Performance QA Benchmarks

Acceptance criteria:
1. API p95 latency < 500ms (excluding ML inference).
2. Inference response < 3s (standard load).
3. Frontend first load < 2.5s on 4G.
4. Crash-free mobile sessions > 99.5%.

---

## Phase 9: Performance Optimization

### 9.1 Backend Optimization

1. Add Redis caching for:
   - breed list
   - breed details
   - analytics summaries
2. Introduce DB indexes:
   - `predictions.user_id`
   - `predictions.created_at`
   - `breeds.name`
3. Use pagination for list endpoints.
4. Move heavy image preprocessing to background workers (Celery/RQ).

### 9.2 ML Inference Optimization

1. Preload model at startup, avoid per-request load.
2. Add image size guardrails before inference.
3. Use batched inference for queued mobile requests.
4. Add fallback model (smaller) for high load mode.
5. Export optimized TFLite/ONNX variants where applicable.

### 9.3 Frontend Optimization

1. Route-level lazy loading.
2. React Query caching and stale-time tuning.
3. CDN delivery for static assets.
4. WebP/AVIF image formats for breed assets.
5. Bundle size checks in CI.

### 9.4 Monitoring and Observability

1. Logs: structured JSON logging with request IDs.
2. Metrics: Prometheus/Grafana or managed equivalent.
3. Error tracking: Sentry for frontend/backend/mobile.
4. Uptime checks for API and prediction endpoint.

---

## Phase 10: Security Implementation

### 10.1 Auth and Access Control

1. Use strong JWT secret and rotation policy.
2. Add refresh token flow with revocation.
3. Role-based access control for farmer/vet/admin routes.
4. Brute-force protection on login (rate limit + temporary lockout).

### 10.2 API Security

1. Input validation for all payloads (Pydantic/Marshmallow).
2. File upload hardening:
   - MIME validation
   - extension whitelist
   - size limits
   - image re-encode before storage
3. Enable CORS only for allowed frontend origins.
4. Add rate limiting per user/IP.

### 10.3 Data Security

1. Encrypt sensitive data at rest.
2. Enforce TLS in transit.
3. Hash passwords using `bcrypt` or `argon2`.
4. Keep secrets in environment vaults, never in source code.
5. Add DB backup and restore verification process.

### 10.4 Infrastructure Security

1. Regular dependency scans (`npm audit`, `pip-audit`, Snyk).
2. Container vulnerability scans in CI.
3. Principle of least privilege for DB/API credentials.
4. Disable debug mode in production.
5. Add WAF + bot filtering at edge.

### 10.5 Compliance and Privacy

1. Build clear consent flow for user images.
2. Define data retention policy.
3. Implement account deletion and data export endpoints.
4. Add audit logs for admin-level actions.

---

## Suggested Build Order (Execution Plan)

1. Finalize backend models and auth.
2. Implement prediction API with ML integration.
3. Build frontend upload + result flow.
4. Add history and breed knowledge pages.
5. Introduce automated tests and CI pipeline.
6. Add mobile app with shared API contracts.
7. Integrate Bharat Pashudhan sync service.
8. Harden security, optimize performance, deploy production.

---

## Definition of Done (Production Readiness)

PAASHU is production-ready when all are true:
1. Core user journeys pass end-to-end tests.
2. Model accuracy and inference SLA meet targets.
3. Monitoring, alerting, backup, and rollback are configured.
4. Security checklist is fully closed.
5. Staging soak test runs clean for 7 consecutive days.

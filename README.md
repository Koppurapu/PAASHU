# CampusGo / PAASHU Scaffold

This workspace is now scaffolded around the PAASHU guide and includes a live demo slice:

- `backend/` for the API, ML orchestration, auth, and Bharat Pashudhan integration
- `frontend/` for the web app
- `mobile/paashu-mobile/` for the Expo app
- `deployment/` for local container orchestration
- `.github/workflows/` for CI

## What works now

- `GET /api/health` for backend health checks
- `GET /api/breeds` for a sample breed catalog
- `POST /api/predictions/predict` for a mocked image prediction response
- Frontend UI at `http://localhost:5173` that loads the catalog and submits image uploads to the API

## Local validation

- Backend: `python run.py` from `backend/`
- Tests: `python -m pytest` from `backend/`
- Frontend: `npm run dev -- --host` from `frontend/`

## Next steps

1. Replace the mocked prediction route with real ML inference.
2. Add backend auth, persisted breeds, and prediction history.
3. Expand the frontend into auth, history, and breed detail views.
4. Add mobile camera capture and prediction UX.
5. Expand CI with linting, coverage, and build checks.

# PAASHU

# Lab Daily Sprint Update

One application for members to submit daily sprint updates and for Barnum to monitor progress, blockers, contributions, and team activity.

## Stack

- React + TypeScript + Vite
- FastAPI
- Supabase PostgreSQL

## Setup

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor.
2. Copy `backend/.env.example` to `backend/.env` and fill in the project URL and server-side service-role key.
3. Copy `frontend/.env.example` to `frontend/.env`.
4. Install and start the backend:

   ```powershell
   cd backend
   python -m venv .venv
   .venv\Scripts\python -m pip install -r requirements.txt
   .venv\Scripts\python -m uvicorn app.main:app --reload
   ```

5. Install and start the frontend:

   ```powershell
   cd frontend
   npm.cmd install
   npm.cmd run dev
   ```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:8000`.

## Deploying to Vercel

Create two Vercel projects from this repository.

### Backend project

1. Import the repository into Vercel.
2. Set the project's **Root Directory** to `backend`.
3. Keep the framework detection and build settings at their defaults. Vercel detects the FastAPI application through `backend/index.py`.
4. Add these environment variables for Production and Preview:

   ```text
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_SIDE_SERVICE_ROLE_KEY
   FRONTEND_ORIGIN=https://YOUR_FRONTEND_PROJECT.vercel.app
   ```

5. Deploy and copy the backend deployment URL.

The service-role key belongs only in the backend Vercel project. Never add it to the frontend project.

### Frontend project

1. Import the same repository as a second Vercel project.
2. Set the project's **Root Directory** to `frontend`.
3. Select the Vite framework preset if it is not detected automatically.
4. Add this environment variable:

   ```text
   VITE_API_URL=https://YOUR_BACKEND_PROJECT.vercel.app/api
   ```

5. Deploy the frontend.

After the frontend receives its final production domain, update `FRONTEND_ORIGIN` in the backend project and redeploy the backend. Environment-variable changes apply only to new deployments.

### Deployment checks

- Open `https://YOUR_BACKEND_PROJECT.vercel.app/api/health` and confirm `{"status":"ok"}`.
- Open `https://YOUR_BACKEND_PROJECT.vercel.app/docs` to confirm the API documentation loads.
- Open the frontend, add a member, and submit a daily update.
- Confirm the dashboard loads data without a CORS warning.

## Authentication

Authentication is intentionally deferred. The MVP lets a member select their identity while submitting. Do not expose this version publicly until authentication and row-level access policies are added.

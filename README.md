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

## Authentication

Authentication is intentionally deferred. The MVP lets a member select their identity while submitting. Do not expose this version publicly until authentication and row-level access policies are added.


from datetime import date
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from postgrest.exceptions import APIError
from supabase import Client

from .config import get_settings
from .database import get_supabase
from .models import DashboardSummary, DailyUpdateCreate, MemberCreate

settings = get_settings()
app = FastAPI(title="Lab Daily Sprint API", version="0.1.0")
allowed_origins = {
    settings.frontend_origin.rstrip("/"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}
app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/members")
def list_members(db: Client = Depends(get_supabase)):
    result = db.table("members").select("*").eq("active", True).order("full_name").execute()
    return result.data


@app.post("/api/members", status_code=status.HTTP_201_CREATED)
def create_member(payload: MemberCreate, db: Client = Depends(get_supabase)):
    try:
        return db.table("members").insert(payload.model_dump(mode="json")).execute().data[0]
    except APIError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/updates", status_code=status.HTTP_201_CREATED)
def submit_update(payload: DailyUpdateCreate, db: Client = Depends(get_supabase)):
    values = payload.model_dump(mode="json")
    try:
        result = db.table("daily_updates").upsert(
            values, on_conflict="member_id,reporting_date"
        ).execute()
        return result.data[0]
    except APIError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/updates")
def list_updates(
    reporting_date: date = Query(default_factory=date.today),
    team: str | None = None,
    db: Client = Depends(get_supabase),
):
    query = db.table("daily_updates").select("*, member:members(id,full_name,email,team,role)").eq(
        "reporting_date", reporting_date.isoformat()
    )
    result = query.order("created_at", desc=True).execute()
    rows = result.data
    if team:
        rows = [row for row in rows if row.get("member", {}).get("team") == team]
    return rows


@app.get("/api/updates/member/{member_id}")
def member_updates(member_id: UUID, db: Client = Depends(get_supabase)):
    return db.table("daily_updates").select("*").eq("member_id", str(member_id)).order(
        "reporting_date", desc=True
    ).limit(30).execute().data


@app.get("/api/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(
    reporting_date: date = Query(default_factory=date.today),
    db: Client = Depends(get_supabase),
):
    members = db.table("members").select("id").eq("active", True).execute().data
    updates = db.table("daily_updates").select(
        "member_id,hours_spent,current_status,blocker_severity,review_readiness"
    ).eq("reporting_date", reporting_date.isoformat()).execute().data
    active = len(members)
    submitted = len({row["member_id"] for row in updates})
    return DashboardSummary(
        reporting_date=reporting_date,
        active_members=active,
        submitted=submitted,
        missing=max(active - submitted, 0),
        submission_rate=round((submitted / active * 100) if active else 0, 1),
        total_hours=round(sum(float(row["hours_spent"]) for row in updates), 2),
        completed=sum(row["current_status"] == "Completed" for row in updates),
        blocked=sum(row["current_status"] == "Blocked" for row in updates),
        high_priority_blockers=sum(row.get("blocker_severity") in {"High", "Critical"} for row in updates),
        ready_for_review=sum(row["review_readiness"] == "Yes" for row in updates),
        no_progress=sum(row["current_status"] == "No progress today" for row in updates),
    )


@app.get("/api/dashboard/missing")
def missing_members(
    reporting_date: date = Query(default_factory=date.today),
    db: Client = Depends(get_supabase),
):
    members = db.table("members").select("id,full_name,email,team,role").eq("active", True).execute().data
    submitted = db.table("daily_updates").select("member_id").eq(
        "reporting_date", reporting_date.isoformat()
    ).execute().data
    submitted_ids = {row["member_id"] for row in submitted}
    return [member for member in members if member["id"] not in submitted_ids]

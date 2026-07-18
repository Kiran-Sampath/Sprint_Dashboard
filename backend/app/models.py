from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, model_validator


Team = Literal["Agentic AI", "Infrastructure", "OTel", "Security", "Testing"]
Role = Literal["Team Lead", "Technical Lead", "Module Owner", "Contributor", "Reviewer", "Tester"]
Status = Literal["Completed", "On track", "In progress", "Blocked", "No progress today"]
Severity = Literal["Low", "Medium", "High", "Critical"]
Readiness = Literal["Yes", "Partially", "Not yet", "Blocked"]


class MemberCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    asu_id: str = Field(min_length=2, max_length=30)
    email: EmailStr
    team: Team
    role: Role


class Member(MemberCreate):
    id: UUID
    active: bool = True


class DailyUpdateCreate(BaseModel):
    member_id: UUID
    reporting_date: date
    sub_task_category: str = Field(min_length=2, max_length=120)
    sprint_goal: str = Field(min_length=2, max_length=500)
    worked_on: str = Field(min_length=2, max_length=4000)
    completed_today: str = Field(min_length=1, max_length=4000)
    hours_spent: float = Field(ge=0, le=24)
    supporting_evidence: str | None = Field(default=None, max_length=4000)
    current_status: Status
    blocker_details: str = Field(default="None", min_length=2, max_length=4000)
    blocker_severity: Severity | None = None
    dependency_owner: str = Field(default="None", min_length=2, max_length=200)
    plan_tomorrow: str = Field(min_length=2, max_length=4000)
    review_readiness: Readiness
    leadership_contributions: list[str] = []
    no_progress_explanation: str | None = Field(default=None, max_length=4000)

    @model_validator(mode="after")
    def validate_conditional_fields(self):
        if self.current_status == "Blocked" and not self.blocker_severity:
            raise ValueError("Blocker severity is required when status is Blocked")
        if self.current_status == "Completed" and not (self.supporting_evidence or "").strip():
            raise ValueError("Supporting evidence is required for completed work")
        if self.current_status == "No progress today" and not (self.no_progress_explanation or "").strip():
            raise ValueError("An explanation is required when no progress was made")
        return self


class DailyUpdate(DailyUpdateCreate):
    id: UUID
    created_at: datetime
    updated_at: datetime
    member: dict | None = None


class DashboardSummary(BaseModel):
    reporting_date: date
    active_members: int
    submitted: int
    missing: int
    submission_rate: float
    total_hours: float
    completed: int
    blocked: int
    high_priority_blockers: int
    ready_for_review: int
    no_progress: int


export type Member = {
  id: string
  full_name: string
  email: string
  asu_id: string
  team: string
  role: string
}

export type DailyUpdate = {
  id: string
  member_id: string
  reporting_date: string
  sub_task_category: string
  sprint_goal: string
  worked_on: string
  completed_today: string
  hours_spent: number
  supporting_evidence?: string
  current_status: string
  blocker_details: string
  blocker_severity?: string
  dependency_owner: string
  plan_tomorrow: string
  review_readiness: string
  leadership_contributions: string[]
  no_progress_explanation?: string
  member?: Member
}

export type Summary = {
  reporting_date: string
  active_members: number
  submitted: number
  missing: number
  submission_rate: number
  total_hours: number
  completed: number
  blocked: number
  high_priority_blockers: number
  ready_for_review: number
  no_progress: number
}


import type { DailyUpdate, Member, Summary } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail ?? 'Something went wrong')
  }
  return response.json()
}

export const api = {
  members: () => request<Member[]>('/members'),
  createMember: (member: Omit<Member, 'id'>) =>
    request<Member>('/members', { method: 'POST', body: JSON.stringify(member) }),
  submit: (update: Record<string, unknown>) =>
    request<DailyUpdate>('/updates', { method: 'POST', body: JSON.stringify(update) }),
  updates: (date: string) => request<DailyUpdate[]>(`/updates?reporting_date=${date}`),
  memberUpdates: (memberId: string) => request<DailyUpdate[]>(`/updates/member/${memberId}`),
  summary: (date: string) => request<Summary>(`/dashboard/summary?reporting_date=${date}`),
  missing: (date: string) => request<Member[]>(`/dashboard/missing?reporting_date=${date}`),
}

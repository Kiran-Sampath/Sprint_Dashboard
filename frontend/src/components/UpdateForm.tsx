import { FormEvent, useState } from 'react'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { api } from '../api'
import type { Member } from '../types'
import './survey-layout.css'

const categories = ['Technical Architecture','Backend Services and APIs','Frontend and Control Tower Dashboard','AI Agents and Models','OTel Capture and Collector','Egress Gateway and Fail-Open Routing','Telemetry Ingestion and Normalization','Security, Redaction, and Customer Approval','Docker / Kubernetes / Infrastructure','Testing, QA, and Adversarial Scenarios','CI/CD and Integration','Demo, Documentation, and Presentation','Other']
const leadership = ['Clarified requirements','Refined architecture or interfaces','Assigned or coordinated tasks','Unblocked another team member','Reviewed code or design','Led testing or integration','Identified a major risk','Prepared or led a demo','Documented decisions','No leadership activity today']
const today = new Date().toLocaleDateString('en-CA')

export default function UpdateForm({ members }: { members: Member[] }) {
  const [status, setStatus] = useState('In progress')
  const [memberId, setMemberId] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const member = members.find((item) => item.id === memberId)
  const isLead = member?.role === 'Team Lead' || member?.role === 'Technical Lead'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setSending(true); setMessage('')
    const data = new FormData(form)
    const payload = Object.fromEntries(data.entries()) as Record<string, unknown>
    payload.hours_spent = Number(payload.hours_spent)
    payload.leadership_contributions = data.getAll('leadership_contributions')
    if (status !== 'Blocked') payload.blocker_severity = null
    try {
      await api.submit(payload)
      setMessage('Your daily update was saved. Thank you for keeping the sprint moving.')
      form.reset(); setMemberId(''); setStatus('In progress')
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Submission failed') }
    finally { setSending(false) }
  }

  return <div className="form-page">
    <header className="survey-header">
      <span className="eyebrow">Daily check-in</span>
      <h1>Daily sprint update</h1>
      <time dateTime={today}>{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</time>
    </header>
    <form className="update-form" onSubmit={submit}>
      <input name="reporting_date" type="hidden" value={today} />
      <div className="section-heading"><span>01</span><div><h2>About today's work</h2><p>Connect your update to the right person and sprint objective.</p></div></div>
      <label className="wide">Your name<select name="member_id" required value={memberId} onChange={e=>setMemberId(e.target.value)}><option value="">Select your name</option>{members.map(m=><option key={m.id} value={m.id}>{m.full_name} · {m.team}</option>)}</select></label>
      <label className="wide">Sub-task category<select name="sub_task_category" required><option value="">Select category</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
      <label className="wide">Sprint goal or milestone<input name="sprint_goal" placeholder="Which sprint objective does today's work support?" required /></label>

      <div className="section-heading wide"><span>02</span><div><h2>Progress and contribution</h2><p>Be specific—concrete outcomes make coordination easier.</p></div></div>
      <label className="wide">What did you work on today?<textarea name="worked_on" placeholder="Describe the task, component, or problem…" required /></label>
      <label className="wide">What did you complete today?<textarea name="completed_today" placeholder="List concrete deliverables completed…" required /></label>
      <label>Hours spent today<input name="hours_spent" type="number" min="0" max="24" step="0.25" placeholder="3.5" required /></label>
      <label>Current status<select name="current_status" value={status} onChange={e=>setStatus(e.target.value)} required>{['Completed','On track','In progress','Blocked','No progress today'].map(s=><option key={s}>{s}</option>)}</select></label>
      <label className="wide">Supporting evidence <small>{status === 'Completed' ? 'Required for completed work' : 'Optional'}</small><textarea name="supporting_evidence" required={status === 'Completed'} placeholder="GitHub PR, commit, test result, document, screenshot, or demo link…" /></label>

      <div className="section-heading wide"><span>03</span><div><h2>Dependencies and next step</h2><p>Surface obstacles early and make the next handoff clear.</p></div></div>
      <label className="wide">Blockers or support needed<textarea name="blocker_details" defaultValue="None" required /></label>
      {status === 'Blocked' && <label>Blocker severity<select name="blocker_severity" required><option value="">Select severity</option>{['Low','Medium','High','Critical'].map(s=><option key={s}>{s}</option>)}</select></label>}
      <label>Dependency owner<input name="dependency_owner" defaultValue="None" required /></label>
      <label className="wide">Plan for tomorrow<textarea name="plan_tomorrow" placeholder="State the next concrete deliverable…" required /></label>
      <label className="wide">Ready for review or integration?<div className="choice-row">{['Yes','Partially','Not yet','Blocked'].map((v,i)=><label className="choice" key={v}><input type="radio" name="review_readiness" value={v} defaultChecked={i===2}/><span>{v}</span></label>)}</div></label>
      {isLead && <fieldset className="wide"><legend>Leadership contribution</legend><div className="check-grid">{leadership.map(v=><label key={v}><input type="checkbox" name="leadership_contributions" value={v}/>{v}</label>)}</div></fieldset>}
      {status === 'No progress today' && <label className="wide">If you made no progress, explain why<textarea name="no_progress_explanation" required /></label>}
      {message && <div className={`form-message wide ${message.startsWith('Your') ? 'success' : ''}`}>{message.startsWith('Your') && <CheckCircle2 size={19}/>} {message}</div>}
      <button className="submit-button wide" disabled={sending}>{sending ? 'Saving update…' : <>Submit daily update <ChevronRight size={18}/></>}</button>
    </form>
  </div>
}

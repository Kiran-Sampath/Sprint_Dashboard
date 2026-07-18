import { useEffect, useState } from 'react'
import { BarChart3, ClipboardPen, FlaskConical } from 'lucide-react'
import { api } from './api'
import Dashboard from './components/Dashboard'
import UpdateForm from './components/UpdateForm'
import type { Member } from './types'

type View = 'submit' | 'dashboard'

export default function App() {
  const [view, setView] = useState<View>('submit')
  const [members, setMembers] = useState<Member[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.members().then(setMembers).catch((err) => setError(err.message))
  }, [])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><FlaskConical size={22} /></span>
          <div><strong>Lab Sprint Pulse</strong><span>Daily delivery intelligence</span></div>
        </div>
        <nav aria-label="Main navigation">
          <button className={view === 'submit' ? 'active' : ''} onClick={() => setView('submit')}>
            <ClipboardPen size={17} /> Daily update
          </button>
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
            <BarChart3 size={17} /> Barnum's dashboard
          </button>
        </nav>
      </header>
      {error && <div className="connection-banner">API connection: {error}. Start the backend and configure Supabase.</div>}
      <main>{view === 'submit' ? <UpdateForm members={members} /> : <Dashboard />}</main>
    </div>
  )
}


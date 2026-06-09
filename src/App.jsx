import { useState, useEffect } from 'react'
import { UserProvider, useUser } from './context/UserContext'
import Splash from './components/Splash'
import Login from './components/Login'
import ProfileCreation from './components/ProfileCreation'
import WorkerDashboard from './components/WorkerDashboard'
import JobFinderDashboard from './components/JobFinderDashboard'
import DriverDashboard from './components/DriverDashboard'
import HRDashboard from './components/HRDashboard'
import SOSAlert from './components/SOSAlert'

function AppContent() {
  const { user, profile, loading, toast } = useUser()
  const [showSplash, setShowSplash] = useState(true)
  const [isSOSActive, setIsSOSActive] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => { const t = setTimeout(() => setShowSplash(false), 2200); return () => clearTimeout(t); }, [])

  if (isSOSActive) return <SOSAlert onCancel={() => setIsSOSActive(false)} />

  if (showSplash) return <div className="app-shell"><Splash /></div>

  if (loading) return (
    <div className="app-shell">
      <div className="screen flex-col items-center justify-center">
        <div className="spinner" /><p className="mt-3" style={{ color: '#999' }}>Loading...</p>
      </div>
    </div>
  )

  if (!user) return (
    <div className="app-shell">
      {showCreate
        ? <ProfileCreation onCancel={() => setShowCreate(false)} />
        : <Login onCreateProfile={() => setShowCreate(true)} />
      }
    </div>
  )

  const role = profile?.role || 'worker'

  const renderDashboard = () => {
    switch (role) {
      case 'jobfinder': return <JobFinderDashboard onSOS={() => setIsSOSActive(true)} />
      case 'driver': return <DriverDashboard />
      case 'hr': return <HRDashboard />
      default: return <WorkerDashboard onSOS={() => setIsSOSActive(true)} />
    }
  }

  return (
    <div className="app-shell">
      {renderDashboard()}
      <div className="app-footer">
        <span>Designed & crafted by Roaring Thunders with <span className="heart">❤️</span></span>
        <a href="mailto:tumkuru.contact@gmail.com">Help & Support</a>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default function App() {
  return <UserProvider><AppContent /></UserProvider>
}

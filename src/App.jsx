import React, { useState, useEffect } from 'react'
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
  const { user, profile, loading, toast, signOut } = useUser()
  const [showSplash, setShowSplash] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const handleSOS = () => {
    window.location.href = 'tel:112'
  }

  useEffect(() => { const t = setTimeout(() => setShowSplash(false), 2200); return () => clearTimeout(t); }, [])

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

  if (profile && !profile.profileComplete) {
    return (
      <div className="app-shell">
        <ProfileCreation 
          isCompleting={true} 
          onCancel={() => signOut()} 
        />
      </div>
    )
  }

  const role = profile?.role || 'worker'

  const renderDashboard = () => {
    switch (role) {
      case 'jobfinder': return <JobFinderDashboard onSOS={handleSOS} />
      case 'driver': return <DriverDashboard />
      case 'hr': return <HRDashboard />
      default: return <WorkerDashboard onSOS={handleSOS} />
    }
  }

  return (
    <div className="app-shell">
      {renderDashboard()}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#fff', background: '#020617', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ color: '#ef4444' }}>Something went wrong.</h2>
          <p>The app encountered an error and could not load.</p>
          <pre style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.8rem', marginTop: '1rem' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '2rem', padding: '1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ErrorBoundary>
  );
}

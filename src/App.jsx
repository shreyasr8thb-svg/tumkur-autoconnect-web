import { useState, useEffect } from 'react'
import { UserProvider, useUser } from './context/UserContext'
import Splash from './components/Splash'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import OwnerDashboard from './components/OwnerDashboard'
import SOSAlert from './components/SOSAlert'
import ProfileCreation from './components/ProfileCreation'

function AppContent() {
  const { user, profile, loading, toast } = useUser()
  const [showSplash, setShowSplash] = useState(true)
  const [isSOSActive, setIsSOSActive] = useState(false)
  const [showCreateProfile, setShowCreateProfile] = useState(false)

  // Auto-hide splash
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  // SOS overlay
  if (isSOSActive) {
    return <SOSAlert onCancel={() => setIsSOSActive(false)} />
  }

  // Splash screen
  if (showSplash) {
    return (
      <div className="app-container">
        <Splash />
      </div>
    )
  }

  // Loading auth state
  if (loading) {
    return (
      <div className="app-container">
        <div className="screen flex-col items-center justify-center">
          <div className="loading-spinner"></div>
          <p className="mt-3">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="app-container">
        {showCreateProfile ? (
          <ProfileCreation onCancel={() => setShowCreateProfile(false)} />
        ) : (
          <Login onCreateProfile={() => setShowCreateProfile(true)} />
        )}
      </div>
    )
  }

  // Logged in
  const isOwner = profile?.role === 'owner'

  return (
    <div className="app-container">
      {isOwner ? (
        <OwnerDashboard />
      ) : (
        <Dashboard onSOS={() => setIsSOSActive(true)} />
      )}

      {/* Global Footer */}
      <div className="footer flex-col items-center gap-1">
        <div>
          This app is designed and crafted by Roaring Thunders with <span className="heart">❤️</span>
        </div>
        <a
          href="mailto:tumkuru.contact@gmail.com"
          style={{ color: 'var(--text-gray-light)', fontSize: '0.75rem', textDecoration: 'underline' }}
        >
          Help & Support
        </a>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}

export default App

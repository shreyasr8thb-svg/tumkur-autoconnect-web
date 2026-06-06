import { useState } from 'react'
import Splash from './components/Splash'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import OwnerDashboard from './components/OwnerDashboard'
import SOSAlert from './components/SOSAlert'

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash')
  const [userRole, setUserRole] = useState(null) // 'worker' or 'owner'

  // Global state for SOS
  const [isSOSActive, setIsSOSActive] = useState(false)

  const navigateTo = (screen) => setCurrentScreen(screen)

  const handleLogin = (role) => {
    setUserRole(role)
    navigateTo(role === 'owner' ? 'owner-dashboard' : 'dashboard')
  }

  // Handle active SOS overlay
  if (isSOSActive) {
    return <SOSAlert onCancel={() => setIsSOSActive(false)} />
  }

  return (
    <div className="app-container">
      {currentScreen === 'splash' && <Splash onComplete={() => navigateTo('login')} />}
      {currentScreen === 'login' && <Login onLogin={handleLogin} />}
      {currentScreen === 'dashboard' && <Dashboard onSOS={() => setIsSOSActive(true)} />}
      {currentScreen === 'owner-dashboard' && <OwnerDashboard />}

      {/* Global Footer */}
      {currentScreen !== 'splash' && currentScreen !== 'login' && (
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
      )}
    </div>
  )
}

export default App

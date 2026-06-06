import { useState } from 'react';
import { Bell, AlertTriangle, ShieldCheck, Bus, IndianRupee, CreditCard, ChevronRight, MapPin, Navigation } from 'lucide-react';

export default function Dashboard({ onSOS }) {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="flex-col" style={{ flex: 1 }}>
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-panel)' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-gray-light)' }}>Welcome,</div>
            <div style={{ fontWeight: '600' }}>Ramesh K.</div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <Bell size={24} color="#ADB5BD" />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', backgroundColor: '#DC3545', borderRadius: '50%' }}></div>
        </div>
      </div>

      <div className="screen" style={{ overflowY: 'auto' }}>
        {activeTab === 'home' && <HomeView onSOS={onSOS} />}
        {activeTab === 'passport' && <SkillPassportView />}
        {activeTab === 'salary' && <SalaryView />}
        {activeTab === 'bus' && <BusTrackingView />}
        {activeTab === 'access' && <SmartAccessView />}
      </div>

      {/* Bottom Navigation */}
      <div className="flex" style={{ backgroundColor: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <NavTab icon={<ShieldCheck size={20} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavTab icon={<CreditCard size={20} />} label="Access" active={activeTab === 'access'} onClick={() => setActiveTab('access')} />
        <NavTab icon={<IndianRupee size={20} />} label="Salary" active={activeTab === 'salary'} onClick={() => setActiveTab('salary')} />
        <NavTab icon={<Bus size={20} />} label="Bus" active={activeTab === 'bus'} onClick={() => setActiveTab('bus')} />
      </div>
    </div>
  );
}

function NavTab({ icon, label, active, onClick }) {
  return (
    <div className={`nav-tab flex-col items-center gap-1 ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span style={{ fontSize: '0.7rem', fontWeight: active ? '600' : '400' }}>{label}</span>
    </div>
  );
}

function HomeView({ onSOS }) {
  return (
    <div className="flex-col gap-4">
      {/* SOS Button */}
      <div className="card text-center" style={{ borderColor: 'rgba(220, 53, 69, 0.3)', backgroundColor: 'rgba(220, 53, 69, 0.05)' }}>
        <button 
          onClick={onSOS}
          className="btn btn-primary flex-col gap-2" 
          style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}
        >
          <AlertTriangle size={32} />
          <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '1px' }}>EMERGENCY SOS</span>
        </button>
        <p className="mt-2" style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Slide/Tap to Confirm SOS to Factory Security & Police</p>
      </div>

      <h3 className="mt-2">Quick Access</h3>
      
      {/* Action Cards Grid */}
      <div className="grid-2">
        <ActionCard 
          icon={<ShieldCheck size={28} color="#DC3545" />} 
          title="Skill Passport" 
          subtitle="Lathe Master (Verified)" 
        />
        <ActionCard 
          icon={<Bus size={28} color="#DC3545" />} 
          title="Live Bus" 
          subtitle="Next Shuttle: 5 mins" 
        />
        <ActionCard 
          icon={<IndianRupee size={28} color="#DC3545" />} 
          title="Your Earnings" 
          subtitle="Total: ₹18,500" 
        />
        <ActionCard 
          icon={<CreditCard size={28} color="#DC3545" />} 
          title="Smart Access" 
          subtitle="Canteen Bal: ₹450" 
        />
      </div>
    </div>
  );
}

function ActionCard({ icon, title, subtitle }) {
  return (
    <div className="card flex-col items-start gap-2" style={{ padding: '1rem' }}>
      <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)' }}>
        {icon}
      </div>
      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-gray-light)' }}>{subtitle}</div>
    </div>
  );
}

function SkillPassportView() {
  return (
    <div className="flex-col gap-4">
      <div className="flex items-center gap-4 mb-2">
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <h2>Ramesh K.</h2>
          <p>ID: TMR-4492 • Machining Dept</p>
        </div>
      </div>
      
      <h3>My Badges</h3>
      
      <div className="card flex gap-3 items-center" style={{ borderLeft: '4px solid #DC3545' }}>
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)' }}>
          <Settings size={24} color="#DC3545" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600' }}>Lathe Master</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Verified by: Govt. ITI Tumkur</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-gray-dark)' }}>Issued: Oct 2024</div>
        </div>
      </div>

      <div className="card mt-2">
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Path to Promotion</span>
          <span style={{ fontSize: '0.9rem', color: '#DC3545', fontWeight: '600' }}>60%</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)', marginBottom: '0.5rem' }}>Supervisor Level 1</div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: '60%', height: '100%', backgroundColor: '#DC3545' }}></div>
        </div>
      </div>
    </div>
  );
}

function SalaryView() {
  return (
    <div className="flex-col gap-4">
      <div className="text-center mb-2">
        <h2 style={{ color: '#DC3545' }}>Why Tumkur Works For You</h2>
        <p>Your clear advantage over gig work.</p>
      </div>

      <div className="grid-2">
        {/* Tumkur Card */}
        <div className="card" style={{ borderTop: '4px solid #DC3545', backgroundColor: 'rgba(220, 53, 69, 0.05)' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Tumkur Factory Job</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>₹21,000</div>
          
          <div className="flex-col gap-2">
            <div className="flex justify-between">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Factory Wage</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>₹16,000</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>PF & Gratuity</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>₹2,500</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Welfare (Bus/Med)</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#28a745' }}>+ ₹2,500</span>
            </div>
          </div>
        </div>

        {/* Bangalore Card */}
        <div className="card" style={{ borderTop: '4px solid var(--text-gray-dark)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-gray-light)' }}>B'lore Delivery Gig</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-gray-light)' }}>₹18,500</div>
          
          <div className="flex-col gap-2">
            <div className="flex justify-between">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-dark)' }}>Gross Earnings</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-gray-dark)' }}>₹25,000</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-dark)' }}>Fuel & Maint.</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#DC3545' }}>- ₹4,000</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-dark)' }}>Rent Diff.</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#DC3545' }}>- ₹2,500</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-2 p-3" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderRadius: 'var(--radius-md)', color: '#DC3545', fontWeight: '600' }}>
        Take Home More in Tumkur. Build a Career.
      </div>
    </div>
  );
}

function BusTrackingView() {
  return (
    <div className="flex-col gap-4 h-full">
      <div className="flex justify-between items-center mb-2">
        <h2>Live Shuttle Tracking</h2>
        <div className="flex gap-2 items-center">
          <div style={{ width: '8px', height: '8px', backgroundColor: '#28a745', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.8rem', color: '#28a745' }}>Live</span>
        </div>
      </div>

      {/* Map Placeholder */}
      <div style={{ flex: 1, minHeight: '300px', backgroundColor: '#1a1a1a', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        {/* Mock Map Grid Background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#2a2a2a 1px, transparent 1px), linear-gradient(90deg, #2a2a2a 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }}></div>
        
        {/* Route Line */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M 50 50 Q 150 150 250 100 T 350 250" fill="none" stroke="#DC3545" strokeWidth="4" strokeDasharray="5,5" opacity="0.5" />
        </svg>

        {/* User Dot */}
        <div style={{ position: 'absolute', left: '50px', top: '50px', transform: 'translate(-50%, -50%)' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#FFF', borderRadius: '50%', boxShadow: '0 0 10px #FFF' }}></div>
          <div style={{ position: 'absolute', left: '-4px', top: '-4px', width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', animation: 'pulse 2s infinite' }}></div>
        </div>

        {/* Bus Dot */}
        <div className="flex-col items-center" style={{ position: 'absolute', left: '250px', top: '100px', transform: 'translate(-50%, -50%)' }}>
          <div style={{ backgroundColor: '#DC3545', padding: '6px', borderRadius: '50%', boxShadow: '0 0 10px #DC3545' }}>
            <Bus size={16} color="#FFF" />
          </div>
          <div style={{ marginTop: '4px', backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', border: '1px solid #DC3545' }}>
            T-04
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)' }}>
              <Navigation size={24} color="#DC3545" />
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>Route T-04 (VasanthNagar)</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Capacity: 32/40 Seats</div>
            </div>
          </div>
          <div className="text-right">
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#DC3545' }}>5 min</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray-light)' }}>ETA</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmartAccessView() {
  const [activeTab, setActiveTab] = useState('log');

  return (
    <div className="flex-col gap-4">
      {/* Digital Card */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)', 
        border: '1px solid #DC3545', 
        boxShadow: '0 10px 30px rgba(220, 53, 69, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', border: '2px solid rgba(220,53,69,0.2)' }}></div>
        <div style={{ position: 'absolute', top: '20px', right: '-40px', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(220,53,69,0.1)' }}></div>
        
        <div className="flex justify-between mb-4 position-relative">
          <div className="flex gap-2 items-center">
            <Settings size={20} color="#DC3545" />
            <span style={{ fontWeight: '600', letterSpacing: '1px' }}>TUMKURU CONNECT</span>
          </div>
          <div style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: 'rgba(40, 167, 69, 0.2)', color: '#28a745', borderRadius: 'var(--radius-pill)', fontWeight: '600' }}>
            ACTIVE
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 position-relative">
          <div style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-dark)', border: '2px solid var(--border-color)', overflow: 'hidden' }}>
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>Ramesh Kumar</div>
            <div style={{ color: 'var(--text-gray-light)', fontSize: '0.9rem' }}>Machinist • TMR-4492</div>
          </div>
        </div>

        <div className="flex justify-between items-end position-relative">
           <div>
             <div style={{ fontSize: '0.75rem', color: 'var(--text-gray-dark)' }}>NFC ENABLED</div>
           </div>
           <CreditCard size={32} color="var(--text-gray-dark)" opacity={0.5} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ backgroundColor: 'var(--bg-panel)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
        {['log', 'canteen', 'buspass'].map((tab) => (
          <button 
            key={tab}
            className={`btn ${activeTab === tab ? '' : 'btn-secondary'}`} 
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', backgroundColor: activeTab === tab ? '#DC3545' : 'transparent', border: 'none' }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'log' ? 'Access Log' : tab === 'canteen' ? 'Canteen' : 'Bus Pass'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card" style={{ padding: '1rem' }}>
        {activeTab === 'log' && (
          <div className="flex-col gap-3">
            <h4 style={{ color: 'var(--text-gray-light)' }}>Today's Activity</h4>
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: '600' }}>Main Gate (In)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Factory Sector A</div>
              </div>
              <div style={{ fontWeight: '600' }}>08:14 AM</div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div style={{ fontWeight: '600' }}>Machining Floor</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Zone 3 Access</div>
              </div>
              <div style={{ fontWeight: '600' }}>08:22 AM</div>
            </div>
          </div>
        )}

        {activeTab === 'canteen' && (
          <div className="flex-col gap-3">
            <div className="flex justify-between items-center mb-2">
              <span style={{ color: 'var(--text-gray-light)' }}>Available Balance</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#DC3545' }}>₹450.00</span>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.75rem' }}>Top Up Balance</button>
            <h4 className="mt-3" style={{ color: 'var(--text-gray-light)' }}>Recent</h4>
            <div className="flex justify-between items-center">
              <div>
                <div style={{ fontWeight: '600' }}>Lunch Thali</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Today, 1:15 PM</div>
              </div>
              <div style={{ fontWeight: '600', color: '#DC3545' }}>- ₹45.00</div>
            </div>
          </div>
        )}

        {activeTab === 'buspass' && (
          <div className="flex-col gap-3 text-center">
            <div style={{ padding: '1rem', backgroundColor: 'rgba(40, 167, 69, 0.1)', borderRadius: 'var(--radius-sm)', color: '#28a745' }}>
              <div style={{ fontWeight: '600' }}>Valid State Bus Pass</div>
              <div style={{ fontSize: '0.8rem' }}>Expires: 30 Nov 2024</div>
            </div>
            <div style={{ margin: '1rem auto', width: '150px', height: '150px', backgroundColor: '#FFF', padding: '10px' }}>
              {/* Mock QR Code */}
              <div style={{ width: '100%', height: '100%', backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
            </div>
            <button className="btn btn-secondary">Generate Digital Pass</button>
          </div>
        )}
      </div>
    </div>
  );
}

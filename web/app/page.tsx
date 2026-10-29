// app/page.tsx — Login / Landing page
import Link from 'next/link';
import Footer from './components/Footer';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,59,48,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 72, height: 72, borderRadius: 20,
              background: 'var(--red)',
              boxShadow: '0 8px 32px var(--red-glow)',
              fontSize: 32, fontWeight: 800, color: '#000',
              marginBottom: 16,
            }}>TA</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--white)', marginBottom: 6 }}>
              Tumkur AutoConnect
            </h1>
            <p style={{ fontSize: 14, color: 'var(--grey1)' }}>
              Industrial ERP &amp; Marketplace · HR Dashboard
            </p>
          </div>

          {/* Login card */}
          <div className="glass" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--grey1)', marginBottom: 8, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="hr@factory.com"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--glass1)', border: '1px solid var(--glass-border)',
                  color: 'var(--white)', fontSize: 15, outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--grey1)', marginBottom: 8, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--glass1)', border: '1px solid var(--glass-border)',
                  color: 'var(--white)', fontSize: 15, outline: 'none',
                }}
              />
            </div>

            <Link href="/dashboard" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 4 }}>
              Sign In to Dashboard →
            </Link>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--grey2)' }}>
              Workers &amp; Drivers use the{' '}
              <span style={{ color: 'var(--red)', fontWeight: 600 }}>Mobile App</span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

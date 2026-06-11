'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2, Shield, FileBarChart2, Globe } from 'lucide-react'

const features = [
  { icon: FileBarChart2, text: 'Tính BOM & chi phí tự động theo từng máy ép' },
  { icon: Globe,         text: 'Xuất báo giá song ngữ Tiếng Việt / English' },
  { icon: Shield,        text: 'Phân quyền Sales · Kỹ thuật · Giám đốc' },
  { icon: CheckCircle2,  text: 'Quản lý Rev 0 / Rev 1 / Rev 2 theo dự án' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Đăng nhập thất bại: ' + error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>

      {/* ─── LEFT: Branding ─── */}
      <div style={{
        flex: '0 0 52%',
        background: 'linear-gradient(160deg, #0a1628 0%, #0d1f3c 50%, #0f2a52 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem 3.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,90,180,0.18), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.10), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #1e5ab4, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(14,165,233,0.35)',
              fontWeight: 800, color: 'white', fontSize: '18px', letterSpacing: '-1px',
            }}>E</div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '17px', letterSpacing: '0.5px' }}>ELASTEC JSC</div>
              <div style={{ color: 'rgba(148,194,255,0.6)', fontSize: '11px', marginTop: '1px' }}>elastecjsc.com</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ position: 'relative' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)',
            borderRadius: '20px', padding: '5px 14px', marginBottom: '24px',
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0ea5e9' }} />
            <span style={{ color: '#7ec8f0', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
              Hệ thống nội bộ · Internal System
            </span>
          </div>

          <h1 style={{
            color: 'white', fontSize: '2.6rem', fontWeight: 800,
            lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.5px',
          }}>
            BOM Costing<br />
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa, #38bdf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>& Quotation</span>
          </h1>

          <p style={{
            color: 'rgba(180,210,255,0.75)', fontSize: '15px', lineHeight: 1.7,
            marginBottom: '36px', maxWidth: '400px',
          }}>
            Phần mềm quản lý báo giá chi tiết nhựa ép khuôn của <strong style={{ color: 'rgba(200,225,255,0.9)' }}>ELASTEC JSC</strong> — tính toán BOM, chi phí sản xuất, và tạo báo giá chuyên nghiệp cho khách hàng trong và ngoài nước.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {features.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                  background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={15} color="#38bdf8" />
                </div>
                <span style={{ color: 'rgba(180,215,255,0.8)', fontSize: '13.5px', lineHeight: 1.55, paddingTop: '6px' }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer certs */}
        <div style={{ position: 'relative' }}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '20px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['ISO 9001', 'ISO 13485', 'ISO 22000', 'HACCP'].map(cert => (
              <span key={cert} style={{
                padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                color: 'rgba(148,194,255,0.7)', border: '1px solid rgba(148,194,255,0.2)',
                background: 'rgba(148,194,255,0.05)',
              }}>{cert}</span>
            ))}
            <span style={{ color: 'rgba(100,140,190,0.5)', fontSize: '11px', marginLeft: '4px' }}>
              · KCN Việt Nam–Singapore III, HCM
            </span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Login form ─── */}
      <div style={{
        flex: 1,
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>
            {/* Top accent bar */}
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #1e5ab4, #0ea5e9, #38bdf8)' }} />

            <div style={{ padding: '2.5rem 2.5rem 2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                Đăng nhập
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 28px' }}>
                Nhập thông tin tài khoản để truy cập hệ thống
              </p>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        paddingLeft: '40px', paddingRight: '14px', paddingTop: '11px', paddingBottom: '11px',
                        borderRadius: '10px', border: '1.5px solid #e2e8f0',
                        fontSize: '14px', color: '#0f172a', background: '#f8fafc',
                        outline: 'none', transition: 'border-color 0.15s',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.background = 'white' }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                    Mật khẩu
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        paddingLeft: '40px', paddingRight: '14px', paddingTop: '11px', paddingBottom: '11px',
                        borderRadius: '10px', border: '1.5px solid #e2e8f0',
                        fontSize: '14px', color: '#0f172a', background: '#f8fafc',
                        outline: 'none', transition: 'border-color 0.15s',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.background = 'white' }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '12px',
                    borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1e5ab4, #0ea5e9)',
                    color: 'white', fontSize: '14px', fontWeight: 700,
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(14,165,233,0.35)',
                    transition: 'all 0.2s', marginTop: '4px',
                  }}
                >
                  {loading
                    ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />Đang đăng nhập...</>
                    : <>Đăng nhập <ArrowRight size={15} /></>}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '20px', marginBottom: 0 }}>
                Liên hệ quản trị viên để được cấp tài khoản
              </p>
            </div>
          </div>

          {/* Below card */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '0 4px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>© 2025 ELASTEC JSC</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>0937 635 839</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

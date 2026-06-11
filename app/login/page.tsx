'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Layers, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

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
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
    }}>
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Layers size={20} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-wide">BOMCOSTING</span>
        </div>

        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Hệ thống tính<br />
            <span style={{ background: 'linear-gradient(90deg, #a5b4fc, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BOM & Báo giá
            </span>
          </h1>
          <p className="text-indigo-300 text-lg leading-relaxed mb-10">
            Quản lý toàn bộ quy trình báo giá chi tiết nhựa ép khuôn — từ NVL, máy ép đến xuất báo giá VN/EN.
          </p>
          <div className="flex gap-8">
            {[
              { value: 'BOM', desc: 'Tính toán chi tiết' },
              { value: 'VN/EN', desc: 'Báo giá song ngữ' },
              { value: 'PDF', desc: 'Xuất tài liệu' },
            ].map(item => (
              <div key={item.value}>
                <div className="text-2xl font-bold text-white mb-1">{item.value}</div>
                <div className="text-indigo-400 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-indigo-400/60 text-sm">© 2025 ELASTEC — All rights reserved</p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Layers size={17} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 text-base">BOMCOSTING</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</h2>
            <p className="text-gray-500 text-sm mb-8">Nhập thông tin tài khoản của bạn để tiếp tục</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-gray-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-gray-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" />Đang đăng nhập...</>
                ) : (
                  <>Đăng nhập <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              Liên hệ quản trị viên để được cấp tài khoản
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, LockKeyhole, PenLine, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function AuthPage() {
  const { loading, isAuthenticated, signIn, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace('/')
  }, [loading, isAuthenticated, router])

  return <main className="mesh-bg relative flex min-h-screen items-center justify-center overflow-hidden p-5 text-white">
    <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
    <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
    <section className="glass-surface relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] text-white shadow-2xl shadow-indigo-950/30 lg:grid-cols-[1.1fr_.9fr]">
      <div className="hidden flex-col justify-between border-r border-white/10 p-10 lg:flex"><div><div className="flex items-center gap-3"><img src="https://i.ibb.co/vSTwzN4/file-00000000b458820ba17ad3a6083d1542.png" alt="Assignment Writing logo" className="h-11 w-11 rounded-2xl object-cover shadow-lg shadow-fuchsia-500/20" /><span className="font-semibold tracking-tight">Assignment Writing</span></div><div className="mt-24 max-w-md"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200"><Sparkles size={13} /> AI-powered writing desk</span><h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight">Turn a rough idea into your best work.</h1><p className="mt-6 text-base leading-7 text-slate-400">A focused space to think, generate, refine, and keep every assignment beautifully organized.</p></div></div><div className="flex items-center gap-3 text-xs text-slate-500"><Check size={15} className="text-emerald-400" /> Private workspace · Built for deep work</div></div>
      <div className="p-7 sm:p-12"><div className="flex items-center gap-3 lg:hidden"><img src="https://i.ibb.co/vSTwzN4/file-00000000b458820ba17ad3a6083d1542.png" alt="Assignment Writing logo" className="h-11 w-11 rounded-2xl object-cover" /><span className="font-semibold">Assignment Writing</span></div><div className="mt-14 lg:mt-16"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-200">Welcome</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Welcome to Assignment Writing</h2><p className="mt-4 text-sm leading-6 text-slate-300">Sign in to start creating your academic assignments effortlessly.</p><button className="mt-9 flex min-h-14 w-full items-center justify-between rounded-2xl border border-white/15 bg-gradient-to-r from-blue-500/90 via-violet-500/90 to-fuchsia-500/90 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-500/25 disabled:opacity-50" onClick={() => void signIn()} disabled={loading}><span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white"><span className="text-lg font-bold text-[#4285f4]">G</span></span>{loading ? 'Connecting...' : 'Continue with Google'}</span><ArrowRight size={17} /></button>{error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}<div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-300"><LockKeyhole size={13} /> Secure sign-in</div></div></div>
    </section>
  </main>
}

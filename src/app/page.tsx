'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { ChatArea } from '@/components/ChatArea'
import { useAuth } from '@/context/AuthContext'
import { createChat, deleteChat, getUserChats } from '@/lib/supabase'
import type { Chat } from '@/lib/types'
import { SettingsModal } from '@/components/SettingsModal'

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => { if (!loading && !isAuthenticated) router.replace('/auth') }, [loading, isAuthenticated, router])
  useEffect(() => {
    async function loadChats() {
      if (!user) return
      const result = await getUserChats(user.id)
      if (result.data?.length) { setChats(result.data as Chat[]); setActiveChat(result.data[0].id) }
      else { setChats([]); setActiveChat(null) }
    }
    void loadChats()
  }, [user])

  async function handleNewChat() {
    if (!user) return
    const result = await createChat(user.id, 'New assignment')
    if (result.data) {
      const chat = result.data as Chat
      setChats((current) => [chat, ...current]); setActiveChat(chat.id); setSidebarOpen(false); toast.success('New assignment ready')
    } else {
      toast.error('Could not create a new assignment')
    }
  }

  async function handleDeleteChat(chat: Chat) {
    if (!window.confirm('Delete this assignment?')) return
    const result = await deleteChat(chat.id)
    if (result.error) {
      toast.error('Could not delete this assignment')
      return
    }
    setChats((current) => current.filter((item) => item.id !== chat.id))
    if (activeChat === chat.id) setActiveChat(null)
    toast.success('Assignment deleted')
  }

  if (loading || !isAuthenticated) return <div className="flex min-h-screen items-center justify-center font-sans text-sm text-slate-500">Loading workspace...</div>
  return (
    <main className="mesh-bg flex h-[100dvh] overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <Sidebar chats={chats} activeChat={activeChat} onSelect={(id) => { setActiveChat(id); setSidebarOpen(false) }} onNew={handleNewChat} onDelete={handleDeleteChat} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col"><Header onMenu={() => setSidebarOpen(true)} onSettings={() => setSettingsOpen(true)} /><ChatArea chatId={activeChat} onChatCreated={(chat) => { setChats((current) => [chat, ...current.filter((item) => item.id !== chat.id)]); setActiveChat(chat.id) }} onMessageSaved={async () => { if (user) { const result = await getUserChats(user.id); if (result.data) setChats(result.data as Chat[]) } }} /><footer className="shrink-0 border-t border-slate-200/50 px-4 py-2 text-center text-[10px] text-slate-400 dark:border-white/10 dark:text-slate-500">Powered by Waleed · © 2026. All rights reserved.</footer></div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  )
}
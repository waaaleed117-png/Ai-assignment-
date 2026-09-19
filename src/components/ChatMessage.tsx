'use client'

import React, { useState } from 'react'
import { Message, FormattingSettings } from '@/lib/types'
import { Check, Copy, Download } from 'lucide-react'
import { convertMarkdownToHtml } from '@/lib/export'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface ChatMessageProps {
  message: Message
  formatting?: FormattingSettings
}

export default function ChatMessage({ message, formatting = { bodyFont: 'Arial', bodySize: 12, headingFont: 'Arial', headingSize: 18 } }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success('Assignment copied')
    window.setTimeout(() => setCopied(false), 1500)
  }

  const handleDownloadPDF = async () => {
    try {
      const { exportToPDF } = await import('@/lib/export')
      const htmlContent = convertMarkdownToHtml(message.content, formatting)
      await exportToPDF(htmlContent, 'assignment.pdf')
      toast.success('PDF downloaded successfully')
    } catch (error) {
      toast.error('Failed to download PDF')
      console.error('Error downloading PDF:', error)
    }
  }

  const handleDownloadDocx = async () => {
    try {
      const { exportToDocx } = await import('@/lib/export')
      await exportToDocx(message.content, 'assignment.docx', formatting)
      toast.success('Word document downloaded successfully')
    } catch (error) {
      toast.error('Failed to download Word document')
      console.error('Error downloading DOCX:', error)
    }
  }

  return (
    <motion.div
      className={`flex gap-2 sm:gap-4 ${isUser ? 'justify-end' : 'items-start justify-start'}`}
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
          ✦
        </div>
      )}

      {/* Message Container */}
      <div
          className={`min-w-0 rounded-2xl p-4 shadow-sm sm:p-5 ${
          isUser
            ? 'max-w-[min(86%,36rem)] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/15'
            : 'w-full glass-surface text-slate-900 dark:text-slate-100'
        }`}
      >
        {/* Message Content */}
        <div className="prose dark:prose-invert prose-sm max-w-none">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: convertMarkdownToHtml(message.content, formatting),
              }}
                className="prose-content dark:prose-invert"
            />
          )}
        </div>

        {/* Attachments Preview */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.attachments.map((attachment, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-sm dark:bg-white/10"
              >
                {attachment.type === 'image' ? '🖼️' : '📄'} {attachment.name}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons - Only for Assistant Messages */}
        {!isUser && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 rounded-lg bg-rose-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
            >
              <Download size={16} />
              PDF
            </button>
            <button
              onClick={handleDownloadDocx}
              className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-600"
            >
              <Download size={16} />
              Word
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white/10 dark:hover:bg-white/20"
            >
              {showPreview ? '🙈 Hide' : '👁️ Preview'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

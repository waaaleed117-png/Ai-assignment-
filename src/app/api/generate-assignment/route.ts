import { NextRequest, NextResponse } from 'next/server'
import { generateAssignment } from '@/lib/gemini'
import { getSession, getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Validate the browser session token because server-side Supabase clients
    // cannot read the browser's persisted session automatically.
    const authorization = request.headers.get('authorization')
    const accessToken = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : null
    const client = getSupabaseClient()
    const tokenResult = accessToken && client
      ? await client.auth.getUser(accessToken)
      : null
    const sessionResult = !accessToken ? await getSession() : null
    const authenticatedUser = tokenResult?.data.user || sessionResult?.session?.user
    const authError = tokenResult?.error || sessionResult?.error

    if (authError || !authenticatedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, pageLength = 5, attachmentContext, formatting } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }

    const result = await generateAssignment(prompt, pageLength, attachmentContext, formatting)

    return NextResponse.json({ content: result }, { status: 200 })
  } catch (error) {
    console.error('Error generating assignment:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate assignment',
      },
      { status: 500 }
    )
  }
}

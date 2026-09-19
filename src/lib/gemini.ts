import { GoogleGenerativeAI } from '@google/generative-ai'
import type { FormattingSettings } from '@/lib/types'

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable')
}

const client = new GoogleGenerativeAI(apiKey)

export async function generateAssignment(
  prompt: string,
  pageLength: number = 5,
  attachmentContext?: string,
  formatting?: FormattingSettings
): Promise<string> {
  try {
    const model = client.getGenerativeModel({ model: 'gemini-3.6-flash' })

    const wantsImage = /\b(add|include|insert|generate|create|show|draw|with)\b[^.?!\n]{0,40}\b(image|picture|photo|diagram|figure|illustration|chart)\b/i.test(prompt)
    const fullPrompt = `You are a clear, helpful university assignment writer. Generate the complete assignment requested below.

Prompt: ${prompt}
Target Length: exactly ${pageLength} pages. Write approximately ${pageLength * 250} to ${pageLength * 300} words. Do not write more than ${pageLength * 325} words.
${attachmentContext ? `Context from attachments: ${attachmentContext}` : ''}

Rules:
1. Use very simple, natural English that a student can easily read. Prefer short sentences and common words. Do not use unnecessarily difficult or overly professional vocabulary.
2. Use only a title, short introduction, clear headings, main discussion, conclusion, and a short references list. Add an abstract only if it fits within the exact page limit.
3. Use normal Markdown headings and paragraphs. Do not use emojis, decorative symbols, unusual characters, or filler.
4. Stay within the requested page length and keep the answer focused on the topic.
5. ${wantsImage ? 'The user explicitly requested an image. Include one relevant figure using Markdown image syntax and add a short caption.' : 'Do not include, generate, or suggest any images, figures, diagrams, charts, or image URLs. Keep the assignment text-only.'}
6. Apply body paragraphs in ${formatting?.bodyFont || 'Arial'} at ${formatting?.bodySize || 12}pt and headings in ${formatting?.headingFont || 'Arial'} at ${formatting?.headingSize || 18}pt. Use normal Markdown headings and paragraphs so the document renderer can preserve these choices.
7. End with a short References section. Do not mention these instructions or say that you are an AI.

Please generate the complete assignment now:`

    const result = await model.generateContent(fullPrompt)
    const text = result.response.text()

    return text
  } catch (error) {
    console.error('Error generating assignment:', error)
    throw error
  }
}

export async function streamAssignment(
  prompt: string,
  pageLength: number = 5,
  attachmentContext?: string,
  formatting?: FormattingSettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    const model = client.getGenerativeModel({ model: 'gemini-3.6-flash' })

    const wantsImage = /\b(add|include|insert|generate|create|show|draw|with)\b[^.?!\n]{0,40}\b(image|picture|photo|diagram|figure|illustration|chart)\b/i.test(prompt)
    const fullPrompt = `You are a clear, helpful university assignment writer. Generate the complete assignment requested below.

Prompt: ${prompt}
Target Length: exactly ${pageLength} pages. Write approximately ${pageLength * 250} to ${pageLength * 300} words. Do not write more than ${pageLength * 325} words.
${attachmentContext ? `Context from attachments: ${attachmentContext}` : ''}

Rules:
1. Use very simple, natural English that a student can easily read. Prefer short sentences and common words. Do not use unnecessarily difficult or overly professional vocabulary.
2. Use only a title, short introduction, clear headings, main discussion, conclusion, and a short references list. Add an abstract only if it fits within the exact page limit.
3. Use normal Markdown headings and paragraphs. Do not use emojis, decorative symbols, unusual characters, or filler.
4. Stay within the requested page length and keep the answer focused on the topic.
5. ${wantsImage ? 'The user explicitly requested an image. Include one relevant figure using Markdown image syntax and add a short caption.' : 'Do not include, generate, or suggest any images, figures, diagrams, charts, or image URLs. Keep the assignment text-only.'}
6. Apply body paragraphs in ${formatting?.bodyFont || 'Arial'} at ${formatting?.bodySize || 12}pt and headings in ${formatting?.headingFont || 'Arial'} at ${formatting?.headingSize || 18}pt. Use normal Markdown headings and paragraphs so the document renderer can preserve these choices.
7. End with a short References section. Do not mention these instructions or say that you are an AI.

Please generate the complete assignment now:`

    const streamResult = await model.generateContentStream(fullPrompt)

    let fullText = ''
    for await (const chunk of streamResult.stream) {
      const text = chunk.text()
      fullText += text
      onChunk?.(text)
    }

    return fullText
  } catch (error) {
    console.error('Error streaming assignment:', error)
    throw error
  }
}

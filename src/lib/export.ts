import { Document, ImageRun, Packer, Paragraph, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'
import type { FormattingSettings } from '@/lib/types'

const defaultFormatting: FormattingSettings = { bodyFont: 'Arial', bodySize: 12, headingFont: 'Arial', headingSize: 18 }

export async function exportToPDF(
  htmlContent: string,
  filename: string = 'assignment.pdf'
) {
  try {
    const { default: html2pdf } = await import('html2pdf.js')
    const element = document.createElement('div')
    element.innerHTML = htmlContent
    element.style.color = '#111827'
    element.style.backgroundColor = '#ffffff'
    element.style.fontFamily = 'Arial, sans-serif'
    element.querySelectorAll<HTMLElement>('*').forEach((node) => {
      if (!node.style.color) node.style.color = '#111827'
    })
    document.body.appendChild(element)

    // html2pdf captures the DOM immediately, so wait for remote diagrams first.
    const images = Array.from(element.querySelectorAll('img'))
    await Promise.all(
      images.map(
        (image) =>
          image.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                image.onload = () => resolve()
                image.onerror = () => resolve()
              })
      )
    )

    const options = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    }

    await html2pdf().set(options).from(element).save()
    element.remove()
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    throw error
  }
}

export async function exportToDocx(
  markdownContent: string,
  filename: string = 'assignment.docx',
  formatting: FormattingSettings = defaultFormatting
) {
  try {
    // Parse markdown-like content into DOCX paragraphs
    const lines = markdownContent.split('\n')
    const paragraphs: Paragraph[] = []

    for (const line of lines) {
      if (line.startsWith('# ')) {
        paragraphs.push(
          new Paragraph({
            text: line.replace('# ', ''),
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
            run: { font: formatting.headingFont, size: formatting.headingSize * 2, color: '111827' },
          })
        )
      } else if (line.startsWith('## ')) {
        paragraphs.push(
          new Paragraph({
            text: line.replace('## ', ''),
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 150 },
            run: { font: formatting.headingFont, size: formatting.headingSize * 2, color: '111827' },
          })
        )
      } else if (line.startsWith('### ')) {
        paragraphs.push(
          new Paragraph({
            text: line.replace('### ', ''),
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 100 },
            run: { font: formatting.headingFont, size: formatting.headingSize * 2, color: '111827' },
          })
        )
      } else if (line.trim()) {
        const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
        if (imageMatch) {
          try {
            const response = await fetch(imageMatch[2])
            const imageBuffer = await response.arrayBuffer()
            paragraphs.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageBuffer,
                    transformation: { width: 560, height: 315 },
                  }),
                ],
                spacing: { after: 100 },
              })
            )
            paragraphs.push(
              new Paragraph({
                text: imageMatch[1],
                spacing: { after: 150 },
              })
            )
            return
          } catch (error) {
            console.warn('Could not embed assignment image in Word export:', error)
          }
        }
        paragraphs.push(
          new Paragraph({
            text: line,
            spacing: { line: 360, after: 100 },
            run: { font: formatting.bodyFont, size: formatting.bodySize * 2, color: '111827' },
          })
        )
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, filename)
  } catch (error) {
    console.error('Error exporting to DOCX:', error)
    throw error
  }
}

export function convertMarkdownToHtml(markdown: string, formatting: FormattingSettings = defaultFormatting): string {
  let html = markdown

  // Headers (must be done in order from h6 to h1 to avoid conflicts)
  const headingStyle = `font-family:${formatting.headingFont};font-size:${formatting.headingSize}pt;color:#111827`
  const bodyStyle = `font-family:${formatting.bodyFont};font-size:${formatting.bodySize}pt;color:#111827`
  html = html.replace(/^###### (.*?)$/gm, `<h6 class="text-base font-bold mt-4 mb-2" style="${headingStyle}">$1</h6>`)
  html = html.replace(/^##### (.*?)$/gm, `<h5 class="text-lg font-bold mt-4 mb-2" style="${headingStyle}">$1</h5>`)
  html = html.replace(/^#### (.*?)$/gm, `<h4 class="text-xl font-bold mt-4 mb-2" style="${headingStyle}">$1</h4>`)
  html = html.replace(/^### (.*?)$/gm, `<h3 class="text-2xl font-bold mt-4 mb-2" style="${headingStyle}">$1</h3>`)
  html = html.replace(/^## (.*?)$/gm, `<h2 class="text-3xl font-bold mt-6 mb-3" style="${headingStyle}">$1</h2>`)
  html = html.replace(/^# (.*?)$/gm, `<h1 class="text-4xl font-bold mt-8 mb-4" style="${headingStyle}">$1</h1>`)

  // Code blocks (preserve before other replacements)
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>'
  )

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">$1</code>')

  // Bold (both ** and __)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
  html = html.replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>')

  // Italic (both * and _)
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
  html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>')

  // Images
  html = html.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    '<figure class="my-4"><img src="$2" alt="$1" class="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600" /><figcaption class="text-sm text-gray-600 dark:text-gray-400 mt-2">$1</figcaption></figure>'
  )

  // Links
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" class="text-blue-600 dark:text-blue-400 underline hover:no-underline" target="_blank" rel="noopener noreferrer">$1</a>'
  )

  // Bullet lists
  html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4">$1</li>')
  html = html.replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
  html = html.replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4">$2</li>')

  // Wrap list items
  html = html.replace(/(<li.*?<\/li>(?:\n<li.*?<\/li>)*)/g, '<ul class="list-disc my-2">$1</ul>')

  // Blockquotes
  html = html.replace(
    /^&gt; (.*?)$/gm,
    '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-2 italic text-gray-600 dark:text-gray-400">$1</blockquote>'
  )

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-4 border-t-2 border-gray-300 dark:border-gray-600" />')

  // Paragraphs (wrap remaining text)
  const paragraphs = html.split('\n\n')
  const wrappedParagraphs = paragraphs.map((para: string) => {
    para = para.trim()
    if (
      para.startsWith('<h') ||
      para.startsWith('<ul') ||
      para.startsWith('<blockquote') ||
      para.startsWith('<pre') ||
      para.startsWith('<figure') ||
      para.startsWith('<hr') ||
      para.startsWith('<li')
    ) {
      return para
    }
    if (para.startsWith('<')) {
      return para
    }
    if (para === '') {
      return ''
    }
    return `<p class="my-3 leading-relaxed" style="${bodyStyle}">${para}</p>`
  })

  return `<div class="prose dark:prose-invert max-w-none">${wrappedParagraphs.join('')}</div>`
}

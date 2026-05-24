// ── ExamBrain File Parser ─────────────────────────────
// Supports: PDF, TXT, MD, DOCX, DOC, RTF, CSV, JSON, images (OCR)
// All parsing happens in the browser — no server needed

// ── PDF via pdf.js CDN ────────────────────────────────
async function parsePDF(file) {
  // Dynamically load pdf.js from CDN
  if (!window.pdfjsLib) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    text += pageText + '\n'
  }
  return text.trim()
}

// ── DOCX via mammoth CDN ──────────────────────────────
async function parseDOCX(file) {
  if (!window.mammoth) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js')
  }
  const arrayBuffer = await file.arrayBuffer()
  const result = await window.mammoth.extractRawText({ arrayBuffer })
  return result.value.trim()
}

// ── Plain text formats ────────────────────────────────
function parseText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsText(file)
  })
}

// ── RTF — strip RTF tags ──────────────────────────────
async function parseRTF(file) {
  const raw = await parseText(file)
  // Basic RTF tag stripping
  return raw
    .replace(/\{[^{}]*\}/g, '')
    .replace(/\\[a-z]+\d* ?/g, '')
    .replace(/[{}\\]/g, '')
    .trim()
}

// ── CSV — convert to readable text ───────────────────
async function parseCSV(file) {
  const raw = await parseText(file)
  const lines = raw.split('\n').filter(l => l.trim())
  return lines.map(line => line.split(',').join(' | ')).join('\n')
}

// ── JSON — pretty print relevant content ─────────────
async function parseJSON(file) {
  const raw = await parseText(file)
  try {
    const obj = JSON.parse(raw)
    return extractTextFromJSON(obj)
  } catch {
    return raw
  }
}

function extractTextFromJSON(obj, depth = 0) {
  if (typeof obj === 'string') return obj
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  if (Array.isArray(obj)) return obj.map(i => extractTextFromJSON(i, depth)).join('\n')
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${extractTextFromJSON(v, depth + 1)}`)
      .join('\n')
  }
  return ''
}

// ── Image OCR via Tesseract CDN ───────────────────────
async function parseImage(file) {
  if (!window.Tesseract) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js')
  }
  const { data: { text } } = await window.Tesseract.recognize(file, 'eng')
  return text.trim()
}

// ── Script loader helper ──────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

// ── Main entry point ──────────────────────────────────
export const SUPPORTED_TYPES = {
  'pdf':  { label: 'PDF',   emoji: '📄' },
  'docx': { label: 'Word',  emoji: '📝' },
  'doc':  { label: 'Word',  emoji: '📝' },
  'txt':  { label: 'Text',  emoji: '📃' },
  'md':   { label: 'Markdown', emoji: '📋' },
  'rtf':  { label: 'RTF',   emoji: '📄' },
  'csv':  { label: 'CSV',   emoji: '📊' },
  'json': { label: 'JSON',  emoji: '🔧' },
  'png':  { label: 'Image', emoji: '🖼️' },
  'jpg':  { label: 'Image', emoji: '🖼️' },
  'jpeg': { label: 'Image', emoji: '🖼️' },
  'webp': { label: 'Image', emoji: '🖼️' },
}

export const MAX_FILE_SIZE_MB = 25

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const sizeMB = file.size / (1024 * 1024)

  if (!SUPPORTED_TYPES[ext]) {
    throw new Error(`File type .${ext} is not supported. Try PDF, DOCX, TXT, MD, RTF, CSV, JSON, or an image.`)
  }

  if (sizeMB > MAX_FILE_SIZE_MB) {
    throw new Error(`File is ${sizeMB.toFixed(1)}MB — max is ${MAX_FILE_SIZE_MB}MB. Try a smaller file.`)
  }

  let text = ''

  switch (ext) {
    case 'pdf':
      text = await parsePDF(file)
      break
    case 'docx':
    case 'doc':
      text = await parseDOCX(file)
      break
    case 'rtf':
      text = await parseRTF(file)
      break
    case 'csv':
      text = await parseCSV(file)
      break
    case 'json':
      text = await parseJSON(file)
      break
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
      text = await parseImage(file)
      break
    default:
      text = await parseText(file)
  }

  if (!text || text.trim().length < 50) {
    throw new Error(`Could not extract enough text from this file. Try copy-pasting the content instead.`)
  }

  return text.trim()
}

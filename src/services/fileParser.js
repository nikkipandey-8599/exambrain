export const SUPPORTED_TYPES = {
  'pdf':  { label: 'PDF',      emoji: '📄' },
  'docx': { label: 'Word',     emoji: '📝' },
  'doc':  { label: 'Word',     emoji: '📝' },
  'txt':  { label: 'Text',     emoji: '📃' },
  'md':   { label: 'Markdown', emoji: '📋' },
  'rtf':  { label: 'RTF',      emoji: '📄' },
  'csv':  { label: 'CSV',      emoji: '📊' },
  'json': { label: 'JSON',     emoji: '🔧' },
  'png':  { label: 'Image',    emoji: '🖼️' },
  'jpg':  { label: 'Image',    emoji: '🖼️' },
  'jpeg': { label: 'Image',    emoji: '🖼️' },
  'webp': { label: 'Image',    emoji: '🖼️' },
}

export const MAX_FILE_SIZE_MB = 50  // increased from 25MB

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src; s.async = true
    s.onload = resolve
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

async function parsePDF(file) {
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
    text += content.items.map(item => item.str).join(' ') + '\n'
  }
  return text.trim()
}

async function parseDOCX(file) {
  if (!window.mammoth) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js')
  }
  const arrayBuffer = await file.arrayBuffer()
  const result = await window.mammoth.extractRawText({ arrayBuffer })
  return result.value.trim()
}

function parseText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsText(file)
  })
}

async function parseRTF(file) {
  const raw = await parseText(file)
  return raw
    .replace(/\{[^{}]*\}/g, '')
    .replace(/\\[a-z]+\d* ?/g, '')
    .replace(/[{}\\]/g, '')
    .trim()
}

async function parseCSV(file) {
  const raw = await parseText(file)
  return raw.split('\n').filter(l => l.trim()).map(l => l.split(',').join(' | ')).join('\n')
}

async function parseJSON(file) {
  const raw = await parseText(file)
  try {
    const obj = JSON.parse(raw)
    function extract(o) {
      if (typeof o === 'string') return o
      if (typeof o === 'number' || typeof o === 'boolean') return String(o)
      if (Array.isArray(o)) return o.map(extract).join('\n')
      if (o && typeof o === 'object') return Object.entries(o).map(([k,v]) => `${k}: ${extract(v)}`).join('\n')
      return ''
    }
    return extract(obj)
  } catch { return raw }
}

async function parseImageWithGroq(file) {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const mimeType = file.type || 'image/jpeg'
  try {
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, mimeType })
    })
    if (!response.ok) throw new Error('OCR API failed')
    const data = await response.json()
    if (data.text && data.text.trim().length > 10) return data.text
    throw new Error('No text extracted')
  } catch {
    return parseImageWithTesseract(file)
  }
}

async function parseImageWithTesseract(file) {
  if (!window.Tesseract) {
    await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js')
  }
  const { data: { text } } = await window.Tesseract.recognize(file, 'eng', { logger: () => {} })
  return text.trim()
}

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const sizeMB = file.size / (1024 * 1024)

  if (!SUPPORTED_TYPES[ext]) {
    throw new Error(`.${ext} is not supported. Try PDF, DOCX, TXT, MD, RTF, CSV, JSON, or an image.`)
  }
  if (sizeMB > MAX_FILE_SIZE_MB) {
    throw new Error(`File is ${sizeMB.toFixed(1)}MB — max is ${MAX_FILE_SIZE_MB}MB.`)
  }

  let text = ''
  switch (ext) {
    case 'pdf':  text = await parsePDF(file); break
    case 'docx':
    case 'doc':  text = await parseDOCX(file); break
    case 'rtf':  text = await parseRTF(file); break
    case 'csv':  text = await parseCSV(file); break
    case 'json': text = await parseJSON(file); break
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp': text = await parseImageWithGroq(file); break
    default:     text = await parseText(file)
  }

  if (!text || text.trim().length < 20) {
    throw new Error('Could not extract enough text. Try copy-pasting the content instead.')
  }
  return text.trim()
}

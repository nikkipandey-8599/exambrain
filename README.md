<div align="center">

# 🧠 ExamBrain

### AI-Powered Exam Prep PWA

Turn your lecture notes into quizzes, flashcards & detailed reports — instantly.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ExamBrain-4f6ef7?style=for-the-badge&logo=vercel)](https://exambrain.vercel.app)
[![Made with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Powered by Groq](https://img.shields.io/badge/Powered%20by-Groq%20AI-f55036?style=for-the-badge)](https://groq.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

![ExamBrain Banner](https://raw.githubusercontent.com/nikkipandey-8599/exambrain/main/public/icon.svg)

</div>

---

## ✨ What is ExamBrain?

ExamBrain is a **mobile-first Progressive Web App** that uses AI to transform your raw study notes into a complete exam preparation toolkit — in seconds.

Paste your notes → get **10 MCQs**, **5 short answer questions**, **12 flashcards**, and a **full performance report** with topic-level analytics. Works offline, installs on your phone like a native app, and costs you nothing to run.

> Built with React + Vite, powered by Groq's LLaMA 3.3 70B, deployed on Vercel.

---

## 🎬 Demo

| Notes → Quiz | Flashcards | Score Report |
|---|---|---|
| Paste any notes, AI generates 10 MCQs with difficulty tags | 3D flip cards with mastery tracking & text-to-speech | Topic breakdown, weak area alerts, PDF export |

**[→ Try it live](https://exambrain.vercel.app)**

---

## 🚀 Features

### 📝 Smart Note Input
- Paste text or **drag & drop** `.txt` / `.md` files
- 15,000 character limit with live counter and amber warning at 90%
- Built-in **sample notes** (French Revolution) to test instantly
- Animated generation progress with stage labels

### 🤖 AI Generation (Groq LLaMA 3.3 70B)
- **10 MCQs** — 4 easy → 4 medium → 2 hard, with plausible distractors
- **5 Short Answer** questions with AI grading (0–100 score + feedback)
- **12 Flashcards** with subtopic tagging
- Topic name + 2-sentence summary extracted automatically
- Offline fallback grading using keyword matching

### 📝 MCQ Quiz Mode
- Difficulty badges (Easy / Medium / Hard) per question
- Select → Submit → see correct answer highlighted green, wrong red
- Expandable explanation for every question
- **Timed Mode** — 30-second countdown ring, turns red under 10s, auto-submits
- Answer dot tracker — gray → blue (active) → green/red (answered)
- Full prev/next navigation, jump to any question

### ✍️ Short Answer Mode
- Multi-line answer input, AI grades each response
- Score display (⭐ X/100), missed key points list
- Model answer + key points revealed after submission
- Offline fallback if API is unreachable

### 🃏 Flashcard Mode
- **True 3D CSS flip animation** (perspective + rotateY)
- **Text-to-speech** — reads card aloud using Web Speech API (browser-native, free)
- Mark cards as **Mastered** with green ring + star icon
- Mastery progress bar fills as you mark cards
- **Shuffle** button randomizes card order
- 6-column card grid — jump to any card instantly

### 📊 Score Report
- Giant % hero with color-coded label (🏆 Excellent / 👍 Good / 📚 Keep Studying / 💪 Needs Work)
- Correct / Wrong / Accuracy stat cards
- **Topic breakdown** — every subtopic with % bar, sorted weakest first
- ⚠️ Weak topic alert if any subtopic < 60%
- Full question review list with ✅ / ❌
- **Export as PDF** — full branded report with all questions and flashcards

### 📱 PWA Features
- **Installable** on Android & iOS — works like a native app
- **Offline support** via Workbox service worker + asset precaching
- Install banner with one-tap install
- Portrait orientation lock, safe-area insets for iPhone notch

### 🌙 Dark / Light Mode
- Toggle in header — sun/moon icon
- Saved to localStorage, respects system preference on first load

### 📋 Session History
- All past sessions saved to IndexedDB (offline, no server)
- Topic, date, score badge per session
- Delete individual sessions or clear all

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5 |
| **Styling** | CSS custom properties (no Tailwind, no UI library) |
| **AI** | Groq API — LLaMA 3.3 70B Versatile (free tier) |
| **Storage** | IndexedDB via `idb` library |
| **State** | Zustand |
| **PWA** | vite-plugin-pwa + Workbox |
| **PDF Export** | jsPDF |
| **Icons** | Lucide React |
| **Deploy** | Vercel |

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com) (no credit card needed)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/nikkipandey-8599/exambrain.git
cd exambrain

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Add your Groq API key inside .env
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Get your free key at **[console.groq.com](https://console.groq.com)** → API Keys → Create API Key.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

### Open on Your Phone (Local Network)

Add this to `vite.config.js` inside `defineConfig`:
```js
server: { host: true }
```

Then run `npm run dev`, find your local IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux), and open `http://YOUR_IP:5173` on your phone (same WiFi). Tap the browser menu → **Add to Home Screen**.

---

## 🚀 Deploy to Vercel

**Option 1 — GitHub Integration (recommended)**

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add environment variable: `VITE_GROQ_API_KEY`
4. Click Deploy

Every `git push` to `main` auto-redeploys. ✅

**Option 2 — Vercel CLI**

```bash
npm install -g vercel
vercel
# Follow prompts, add VITE_GROQ_API_KEY when asked
```

---

## 📁 Project Structure

```
exambrain/
├── public/
│   ├── icon-192.png          # PWA icon
│   ├── icon-512.png          # PWA icon (maskable)
│   └── apple-touch-icon.png  # iOS icon
├── src/
│   ├── components/
│   │   ├── Header.jsx        # Sticky header with theme toggle + online status
│   │   ├── BottomNav.jsx     # 5-tab bottom navigation
│   │   └── InstallBanner.jsx # PWA install prompt banner
│   ├── hooks/
│   │   ├── useTheme.js       # Dark/light mode with localStorage
│   │   ├── useOnlineStatus.js# Real-time online/offline detection
│   │   └── usePWAInstall.js  # beforeinstallprompt capture
│   ├── pages/
│   │   ├── Home.jsx          # Note input + file upload + generation
│   │   ├── Quiz.jsx          # MCQ + short answer with timed mode
│   │   ├── Flashcards.jsx    # 3D flip cards with TTS + mastery
│   │   ├── Report.jsx        # Score analytics + PDF export
│   │   └── History.jsx       # Past sessions from IndexedDB
│   ├── services/
│   │   ├── gemini.js         # Groq API calls (generate + grade)
│   │   └── db.js             # IndexedDB (sessions, notes, results)
│   ├── store/
│   │   └── examStore.js      # Zustand global state
│   └── utils/
│       ├── constants.js      # App-wide constants + sample notes
│       └── helpers.js        # Pure utility functions
├── .env.example
├── vite.config.js            # Vite + PWA manifest config
└── index.html
```

---

## 🔑 API Usage & Limits

ExamBrain uses **Groq's free tier**:

| Metric | Limit |
|---|---|
| Requests per minute | 30 |
| Requests per day | 14,400 |
| Tokens per minute | 6,000 |

For a typical student using ExamBrain 5–10 times a day, you will **never hit these limits**. The daily limit resets at midnight UTC.

> **Note:** The API key is used client-side via Vite's `import.meta.env`. For a production multi-user app, move API calls to a backend. For personal/portfolio use, this approach is fine.

---

## 📱 Install as Mobile App

### Android
1. Open the live URL in **Chrome**
2. Tap the 3-dot menu → **Add to Home Screen**
3. App installs with its own icon, no browser chrome

### iOS
1. Open the live URL in **Safari**
2. Tap the **Share** button → **Add to Home Screen**
3. Tap Add

### APK (sideload)
Use [PWABuilder](https://pwabuilder.com) → paste your Vercel URL → Android → Download APK.

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

**Ideas for contributions:**
- [ ] Spaced repetition algorithm for flashcards
- [ ] Multiple sessions comparison chart
- [ ] Support for image-based notes (OCR)
- [ ] Share quiz link with friends
- [ ] Streak tracking + study reminders

---

## 📄 License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

## 👩‍💻 Built By

**Nikki Pandey** — [@nikkipandey-8599](https://github.com/nikkipandey-8599)

> Built as a real-world portfolio project demonstrating: React PWA development, AI API integration, prompt engineering, IndexedDB offline storage, and mobile-first UI design.

---

<div align="center">

**If this helped you, consider giving it a ⭐ — it means a lot!**

[![Star on GitHub](https://img.shields.io/github/stars/nikkipandey-8599/exambrain?style=social)](https://github.com/nikkipandey-8599/exambrain)

</div>

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
- **📚 Subject Library** — 6 pre-built note sets (History, Biology, Physics, Chemistry, CS) — try without uploading anything
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
- **Keyboard shortcuts** — 1–4 to select, Enter to submit, ← → to navigate

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
- **🔁 Retry Weak Questions** — one tap to re-quiz only the questions you got wrong
- Full question review list with ✅ / ❌
- **Export as PDF** — full branded report with all questions and flashcards

### ✏️ Notes Editor
- Edit your notes inline after generating — no need to start over
- Save and regenerate instantly from the active session banner

### 🔔 Push Notifications
- Daily reminder at 6 PM — "Your streak is at risk! 🔥"
- Web Push API with local notification fallback
- Toggle on/off from the History tab

### 🔐 Auth + Cloud Sync (Supabase)
- **Google OAuth** + **GitHub OAuth** — one click, no password
- **Guest mode** — try 1 full quiz without signing up
- **Cloud history** — sessions saved to Supabase Postgres, accessible from any device
- **Auto-migrate** — local sessions sync to cloud on first login
- User avatar + name in header with logout dropdown

### 📱 PWA Features
- **Installable** on Android & iOS — works like a native app
- **Offline support** via Workbox service worker + asset precaching
- Install banner with one-tap install
- Portrait orientation lock, safe-area insets for iPhone notch

### 🌙 Dark / Light Mode
- Toggle in header — sun/moon icon
- Saved to localStorage, respects system preference on first load

### 🔥 Streak & Badges
- Daily study streak with fire indicator in header
- GitHub-style activity heatmap
- 6 unlockable achievement badges (First Session, 3-day streak, Perfect Score, etc.)

### 📋 Session History
- All past sessions saved to IndexedDB (offline, no server)
- Cloud sync when logged in — sessions accessible across devices
- Topic, date, score badge per session
- Delete individual sessions or clear all

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5 |
| **Styling** | CSS custom properties (no Tailwind, no UI library) |
| **AI** | Groq API — LLaMA 3.3 70B Versatile (free tier) |
| **Auth + Cloud** | Supabase (Google/GitHub OAuth + Postgres) |
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
- A free [Supabase](https://supabase.com) project (for auth + cloud sync)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/nikkipandey-8599/exambrain.git
cd exambrain

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your keys inside .env
```

### Environment Variables

Create a `.env` file in the project root:

```env
# AI
VITE_GEMINI_API_KEY=your_groq_api_key_here

# Supabase (Auth + Cloud Sync)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Push Notifications (optional — leave blank for local fallback)
VITE_VAPID_PUBLIC_KEY=
```

Get your free Groq key at **[console.groq.com](https://console.groq.com)** → API Keys → Create API Key.

### Supabase Setup

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Go to **SQL Editor** → paste & run `SUPABASE_SETUP.sql` (included in repo)
3. Go to **Authentication → Providers** → enable **Google** and **GitHub**
4. Copy your **Project URL** and **anon key** from Settings → API

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

The `vite.config.js` already has `server: { host: true }`. Run `npm run dev`, find your local IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux), and open `http://YOUR_IP:5173` on your phone (same WiFi). Tap the browser menu → **Add to Home Screen**.

---

## 🚀 Deploy to Vercel

**Option 1 — GitHub Integration (recommended)**

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add all 3 environment variables from your `.env`
4. Click Deploy

Every `git push` to `main` auto-redeploys. ✅

Then in Supabase → Authentication → URL Configuration:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app`

**Option 2 — Vercel CLI**

```bash
npm install -g vercel
vercel
# Follow prompts, add env vars when asked
```

---

## 📁 Project Structure

```
exambrain/
├── public/
│   ├── icon-192.png              # PWA icon
│   ├── icon-512.png              # PWA icon (maskable)
│   ├── apple-touch-icon.png      # iOS icon
│   ├── og-image.png              # Social preview image
│   ├── sitemap.xml               # SEO sitemap
│   └── robots.txt                # SEO robots
├── src/
│   ├── components/
│   │   ├── Header.jsx            # Sticky header with theme + user menu
│   │   ├── BottomNav.jsx         # 5-tab bottom navigation
│   │   ├── InstallBanner.jsx     # PWA install prompt
│   │   ├── UserMenu.jsx          # Avatar dropdown (auth)
│   │   ├── SyncBanner.jsx        # Local → cloud migration prompt
│   │   ├── NotesEditor.jsx       # Inline notes editing
│   │   ├── RetryWeakButton.jsx   # Retry wrong questions only
│   │   ├── PushNotifToggle.jsx   # Daily reminder toggle
│   │   ├── BadgeToast.jsx        # Achievement badge popups
│   │   ├── Toast.jsx             # App-wide toast notifications
│   │   ├── EmptyState.jsx        # Illustrated empty states
│   │   ├── SkeletonLoader.jsx    # Loading skeletons
│   │   ├── HintButton.jsx        # Quiz hint system
│   │   ├── ShareCard.jsx         # Share results card
│   │   └── Onboarding.jsx        # First-time 3-step intro
│   ├── data/
│   │   └── subjectLibrary.js     # 6 pre-built subject note sets
│   ├── hooks/
│   │   ├── useAuth.js            # Supabase auth state
│   │   ├── useTheme.js           # Dark/light mode
│   │   ├── useStreak.js          # Streak + badges + heatmap
│   │   ├── useKeyboard.js        # Keyboard shortcut bindings
│   │   ├── useOnlineStatus.js    # Online/offline detection
│   │   └── usePWAInstall.js      # beforeinstallprompt capture
│   ├── pages/
│   │   ├── Landing.jsx           # Marketing landing page + SEO
│   │   ├── Auth.jsx              # Google/GitHub sign-in screen
│   │   ├── Home.jsx              # Note input + subject library
│   │   ├── Quiz.jsx              # MCQ + short answer + timed mode
│   │   ├── Flashcards.jsx        # 3D flip cards + TTS + mastery
│   │   ├── Report.jsx            # Score analytics + PDF export
│   │   ├── History.jsx           # Past sessions + heatmap + badges
│   │   └── SubjectLibrary.jsx    # Pre-built note set browser
│   ├── services/
│   │   ├── gemini.js             # Groq API (generate + grade)
│   │   ├── db.js                 # IndexedDB (local storage)
│   │   ├── supabase.js           # Supabase client + cloud CRUD
│   │   └── pushNotifications.js  # Web Push + local notification
│   ├── store/
│   │   └── examStore.js          # Zustand global state
│   └── utils/
│       ├── constants.js          # App-wide constants + sample notes
│       ├── helpers.js            # Pure utility functions
│       ├── haptics.js            # Mobile vibration feedback
│       └── confetti.js           # Score celebration animation
├── SUPABASE_SETUP.sql            # Run once in Supabase SQL Editor
├── .env.example
├── vite.config.js                # Vite + PWA manifest config
└── index.html                    # SEO meta tags + JSON-LD schema
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
- [ ] More subjects in the Subject Library

---

## 📄 License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

## 👩‍💻 Built By

**Nikki Pandey** — [@nikkipandey-8599](https://github.com/nikkipandey-8599)

> Built as a real-world portfolio project demonstrating: React PWA development, AI API integration, Supabase auth + cloud sync, prompt engineering, IndexedDB offline storage, push notifications, and mobile-first UI design.

---

<div align="center">

**If this helped you, consider giving it a ⭐ — it means a lot!**

[![Star on GitHub](https://img.shields.io/github/stars/nikkipandey-8599/exambrain?style=social)](https://github.com/nikkipandey-8599/exambrain)

</div>

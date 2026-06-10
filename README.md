<div align="center">

# 🎓 ExamBrain

### AI-Powered Exam Prep PWA

Turn your lecture notes into quizzes, flashcards & detailed reports — instantly.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-exambrain.me-92400E?style=for-the-badge&logo=vercel)](https://exambrain.me)
[![Made with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Powered by Groq](https://img.shields.io/badge/Powered%20by-Groq%20AI-f55036?style=for-the-badge)](https://groq.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

</div>

---

## What is ExamBrain?

ExamBrain is a **mobile-first Progressive Web App** that uses AI to transform your raw study notes into a complete exam preparation toolkit — in seconds.

Paste your notes and get **20 MCQs**, **7 short answer questions**, **20 flashcards**, and a **full performance report** with topic-level analytics. Works offline, installs on your phone like a native app, and is completely free.

Built with React + Vite, powered by Groq LLaMA 3.3 70B, deployed on Vercel.

---

## Demo

**[Try it live → exambrain.me](https://exambrain.me)**

| Notes Input | Quiz | Score Report |
|---|---|---|
| Paste notes or upload any file up to 50MB | 20 MCQs with difficulty levels + AI-graded short answers | Topic breakdown, weak area alerts, PDF export |

---

## Features

### Smart Note Input
- Paste text or drag and drop files — supports PDF, DOCX, DOC, TXT, MD, RTF, CSV, JSON
- Image upload with OCR (Groq Vision + Tesseract.js fallback)
- 30,000 character limit with live counter
- Max file size 50MB
- Subject Library — 6 pre-built topics to try without uploading anything
- Inline Notes Editor — edit your notes after generating without starting over

### AI Generation (Groq LLaMA 3.3 70B)
- **20 MCQs** — 6 easy, 8 medium, 6 hard with plausible distractors and full explanations
- **7 Short Answer** questions with strict AI grading (0–100 score + specific feedback)
- **20 Flashcards** with subtopic tagging
- Topic name and 2-sentence summary extracted automatically
- Strict offline grading fallback using keyword matching

### MCQ Quiz Mode
- Difficulty badges (Easy / Medium / Hard) per question
- Select, submit, see correct answer highlighted
- Expandable explanation for every question
- Timed Mode — 30-second countdown per question, auto-submits
- Answer dot tracker showing progress
- Keyboard shortcuts — 1–4 to select, Enter to submit, arrow keys to navigate
- Retry Weak Questions — re-quiz only the questions you got wrong

### Short Answer Mode
- AI grades each response with score, feedback, and missed key points
- Strict grading — gibberish and very short answers score 0
- Model answer revealed after submission
- Offline fallback grading

### Flashcard Mode
- True 3D CSS flip animation
- Text-to-speech — reads card aloud using Web Speech API
- Mark cards as Mastered
- Mastery progress bar
- Shuffle button
- Jump grid to any card

### Score Report
- Animated percentage hero with colour-coded label
- Correct / Wrong / Accuracy stat cards
- Topic breakdown sorted weakest first
- Weak topic alert if any subtopic below 60%
- Full question review list
- Export as PDF — full branded report
- Share card for social media

### Auth + Cloud Sync (Supabase)
- Sign In / Sign Up tabs with Google OAuth and GitHub OAuth
- Guest mode — browse the landing page without signing in
- Mandatory sign-in to use the app
- Cloud history — sessions saved to Supabase Postgres, accessible from any device
- Auto-migrate — local sessions sync to cloud on first login
- User avatar and name in header

### Reviews and Feedback
- In-app Reviews tab with 5-star rating
- Category tags — UI, AI Quality, Feature Request, Bug Report, General
- One review per device (fingerprint) for guests, one per account for signed-in users
- Admin can delete spam and reply as ExamBrain Team
- Real-time reply notifications — badge on Reviews tab when admin replies
- Users can edit their own review after posting
- Helpful button on each review

### PWA Features
- Installable on Android and iOS
- Offline support via Workbox service worker and asset precaching
- Install banner with one-tap install
- Custom app icon (graduation cap + open book logo)

### Design
- Cream and warm brown colour scheme — parchment aesthetic
- Georgia / Times New Roman typography throughout
- Vanta.js Birds animation on landing page hero
- Vanta.js Net animation on auth screen
- Fade-in scroll animations on landing page
- No dark mode — locked to cream theme for consistent experience
- Minimal emoji usage

### Streak and Gamification
- Daily study streak with flame indicator
- GitHub-style activity heatmap in History
- 6 unlockable achievement badges

### Session History
- All past sessions saved to IndexedDB locally
- Cloud sync when signed in
- Topic, date, and score badge per session
- Delete individual sessions or clear all

### SEO and Marketing
- Landing page with EN / Hindi language toggle
- og:image and Twitter card meta tags
- sitemap.xml and robots.txt
- JSON-LD WebApplication + FAQPage schema markup
- Submitted to Google Search Console
- Google Analytics integrated

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5 |
| Styling | CSS custom properties — no Tailwind, no UI library |
| AI | Groq API — LLaMA 3.3 70B Versatile (free tier) |
| Auth + Cloud | Supabase (Google/GitHub OAuth + Postgres) |
| Local Storage | IndexedDB via idb library |
| State | Zustand |
| PWA | vite-plugin-pwa + Workbox |
| PDF Export | jsPDF |
| File Parsing | pdf.js, mammoth.js, Tesseract.js |
| OCR | Groq Vision (primary) + Tesseract.js (fallback) |
| Animations | Vanta.js (Birds + Net + Waves) |
| Icons | Lucide React |
| Deploy | Vercel (serverless functions for API) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Free [Groq API key](https://console.groq.com) — no credit card needed
- Free [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/nikkipandey-8599/exambrain.git
cd exambrain
npm install
cp .env.example .env
```

### Environment Variables

```env
# AI (Groq)
VITE_GEMINI_API_KEY=your_groq_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Push Notifications (optional)
VITE_VAPID_PUBLIC_KEY=
```

### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a project
2. SQL Editor — paste and run `SUPABASE_SETUP.sql`
3. SQL Editor — paste and run `REVIEWS_SETUP_V2.sql`
4. Authentication → Providers — enable Google and GitHub
5. Authentication → URL Configuration — set Site URL to your Vercel domain

### Run Locally

```bash
npm run dev
```

### Deploy to Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add all environment variables
4. Deploy

Add these to Supabase → Authentication → Redirect URLs after deploying:
```
https://your-app.vercel.app
https://your-app.vercel.app/**
https://exambrain.me
https://exambrain.me/**
```

---

## Project Structure

```
exambrain/
├── api/
│   ├── generate.js           # Vercel serverless — Groq API proxy
│   └── ocr.js                # Vercel serverless — Groq Vision OCR
├── public/
│   ├── icon-*.png            # PWA icons (72 → 512, maskable)
│   ├── apple-touch-icon.png  # iOS icon
│   ├── favicon-32.png        # Browser favicon
│   ├── og-image.png          # Social preview image
│   ├── sitemap.xml           # SEO sitemap
│   └── robots.txt            # SEO robots
├── src/
│   ├── components/
│   │   ├── Header.jsx            # Sticky header with logo and user menu
│   │   ├── BottomNav.jsx         # 6-tab bottom navigation with badge
│   │   ├── InstallBanner.jsx     # PWA install prompt
│   │   ├── UserMenu.jsx          # Avatar dropdown
│   │   ├── SyncBanner.jsx        # Local to cloud migration
│   │   ├── NotesEditor.jsx       # Inline notes editing
│   │   ├── RetryWeakButton.jsx   # Retry wrong questions only
│   │   ├── PushNotifToggle.jsx   # Daily reminder toggle
│   │   ├── ReviewSection.jsx     # Reviews tab with admin controls
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
│   │   ├── useStreak.js          # Streak + badges + heatmap
│   │   ├── useKeyboard.js        # Keyboard shortcut bindings
│   │   ├── useOnlineStatus.js    # Online/offline detection
│   │   └── usePWAInstall.js      # beforeinstallprompt capture
│   ├── pages/
│   │   ├── Landing.jsx           # Marketing landing page (EN + Hindi)
│   │   ├── Auth.jsx              # Sign In / Sign Up with OAuth
│   │   ├── Home.jsx              # Note input + subject library
│   │   ├── Quiz.jsx              # MCQ + short answer + timed mode
│   │   ├── Flashcards.jsx        # 3D flip cards + TTS + mastery
│   │   ├── Report.jsx            # Score analytics + PDF export
│   │   ├── History.jsx           # Past sessions + heatmap + badges
│   │   └── SubjectLibrary.jsx    # Pre-built note set browser
│   ├── services/
│   │   ├── gemini.js             # Groq API calls (generate + grade)
│   │   ├── db.js                 # IndexedDB local storage
│   │   ├── supabase.js           # Supabase client + cloud CRUD
│   │   ├── fileParser.js         # PDF, DOCX, OCR file parsing
│   │   └── pushNotifications.js  # Web Push + local notification
│   ├── store/
│   │   └── examStore.js          # Zustand global state
│   └── utils/
│       ├── constants.js          # MAX_CHARS (30,000), MIN_CHARS, sample notes
│       ├── helpers.js            # Score helpers, gradeOffline, shuffleArray
│       ├── haptics.js            # Mobile vibration feedback
│       ├── confetti.js           # Score celebration animation
│       └── vanta.js              # Vanta.js loader (Birds, Waves, Net)
├── SUPABASE_SETUP.sql            # Sessions + results tables
├── REVIEWS_SETUP_V2.sql          # Reviews table with spam controls
├── .env.example
├── vite.config.js
└── index.html
```

---

## API Usage and Limits

ExamBrain uses Groq's free tier:

| Metric | Limit |
|---|---|
| Requests per minute | 30 |
| Requests per day | 14,400 |
| Tokens per minute | 6,000 |

For typical student usage (5–10 sessions per day) these limits are never hit. The daily limit resets at midnight UTC.

The API key is server-side only — all Groq calls go through Vercel serverless functions (`/api/generate`, `/api/ocr`). The key is never exposed to the browser.

---

## Install as Mobile App

### Android
Open in Chrome → tap 3-dot menu → Add to Home Screen

### iOS
Open in Safari → tap Share → Add to Home Screen

### APK
Use [PWABuilder](https://pwabuilder.com) → paste your URL → Android → Download APK

---

## Security

- API keys are server-side only via Vercel serverless functions
- Supabase Row Level Security on all tables — users only see their own data
- OAuth only — no passwords stored
- Security headers via `vercel.json` (HSTS, X-Content-Type-Options, Referrer-Policy)
- Rate limiting on auth via Supabase settings
- Review spam prevention via browser fingerprinting

---

## License

MIT License — free to use, modify, and distribute.

---

## Built By

**Nikki Pandey** — [@nikkipandey-8599](https://github.com/nikkipandey-8599)

B.Sc. Information Technology student at University of Mumbai. Built ExamBrain as a real-world portfolio project demonstrating full-stack AI development, PWA architecture, Supabase auth and cloud sync, prompt engineering, and mobile-first UI design.

---

<div align="center">

**If this helped you, give it a star — it means a lot!**

[![Star on GitHub](https://img.shields.io/github/stars/nikkipandey-8599/exambrain?style=social)](https://github.com/nikkipandey-8599/exambrain)

</div>

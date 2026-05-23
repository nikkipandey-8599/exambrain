# 🧠 ExamBrain v2.0 — Phase 1 + Phase 4

AI-powered exam prep PWA. Upload your notes → get quizzes, flashcards & score reports instantly.

## ✅ What's New in v2.0

### Phase 1 — Auth + Cloud Sync (Supabase)
- **Google OAuth** + **GitHub OAuth** via Supabase Auth
- **Guest mode** — full access without signing up
- **Cloud sync** — sessions saved across all devices
- **Auto-migrate** — sync local sessions on first login
- **User avatar + name** in header dropdown
- **Row-level security** — only you see your data

### Phase 4 — Power Features
- **📚 Subject Library** — 6 pre-built note sets (French Revolution, Photosynthesis, Newton's Laws, Python, Organic Chemistry, Cell Biology) — try without uploading anything
- **🔁 Retry Weak Questions** — "Practice Weak Topics" button on Report page, filters only questions you got wrong
- **✏️ Notes Editor** — edit your notes inline after generating, then regenerate
- **🔔 Push Notifications** — "Your streak is at risk! 🔥" daily reminder at 6 PM (Web Push API with local notification fallback)

---

## 🚀 Setup

### 1. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) → create a new project
2. Go to **SQL Editor** → paste & run `SUPABASE_SETUP.sql`
3. Go to **Authentication → Providers** → enable **Google** and **GitHub**
4. Copy your **Project URL** and **anon key** from Settings → API

### 3. Configure environment
\`\`\`bash
cp .env.example .env
\`\`\`
Fill in `.env`:
\`\`\`
VITE_GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

### 4. Run
\`\`\`bash
npm run dev
\`\`\`

### 5. Deploy to Vercel
\`\`\`bash
vercel --prod
\`\`\`
Add all 3 env vars in Vercel dashboard → Settings → Environment Variables.

Then in Supabase → Authentication → URL Configuration:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app`

---

## 📁 New Files

| File | Purpose |
|------|---------|
| `src/services/supabase.js` | Supabase client, auth, cloud CRUD |
| `src/hooks/useAuth.js` | Auth state hook |
| `src/pages/Auth.jsx` | Google/GitHub sign-in screen |
| `src/pages/SubjectLibrary.jsx` | Pre-built subject note sets |
| `src/data/subjectLibrary.js` | 6 subject data sets |
| `src/components/UserMenu.jsx` | Avatar dropdown in header |
| `src/components/SyncBanner.jsx` | One-click local→cloud migration |
| `src/components/NotesEditor.jsx` | Inline notes editing |
| `src/components/RetryWeakButton.jsx` | Retry only wrong questions |
| `src/components/PushNotifToggle.jsx` | Daily reminder toggle |
| `src/services/pushNotifications.js` | Web Push + local notification |
| `SUPABASE_SETUP.sql` | Run once in Supabase SQL Editor |

---

## 🗺️ Full Feature Map

| Feature | Status |
|---------|--------|
| AI quiz generation (Gemini) | ✅ |
| MCQ + Short Answer + Flashcards | ✅ |
| IndexedDB local storage | ✅ |
| PWA + offline support | ✅ |
| Dark/light theme | ✅ |
| Streak tracking + badges | ✅ |
| Study heatmap | ✅ |
| PDF export | ✅ |
| Share card | ✅ |
| Timed quiz mode | ✅ |
| Landing page + SEO | ✅ |
| Google/GitHub OAuth | ✅ Phase 1 |
| Cloud sync (Supabase) | ✅ Phase 1 |
| Subject Library | ✅ Phase 4 |
| Retry Weak Questions | ✅ Phase 4 |
| Notes Editor | ✅ Phase 4 |
| Push Notifications | ✅ Phase 4 |

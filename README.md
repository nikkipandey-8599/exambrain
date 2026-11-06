# 🎓 ExamBrain

### AI-powered exam preparation from your own notes

[![Live Demo](https://img.shields.io/badge/Live%20Demo-exambrain.me-92400E?style=for-the-badge)](https://exambrain.me)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

**[Open ExamBrain](https://exambrain.me)** · **[Source code](https://github.com/nikkipandey-8599/exambrain)**

---

## What is ExamBrain?

ExamBrain is a student-focused study app that turns lecture notes and study material into an exam-preparation kit. Add your notes or upload a supported file, generate practice questions and flashcards, test yourself, and review your performance.

The project is independently built and maintained by a student. It uses a React progressive web app, Supabase for authentication and cloud data, server-side AI integrations, and Vercel for deployment.

> ExamBrain is free to use, but AI features depend on the availability and usage limits of the configured AI providers. AI generation and online grading require an internet connection.

## Features

### 1. Notes and file input
- Paste notes directly or upload supported study files.
- File parsing for formats including PDF, DOCX, DOC, TXT, Markdown, RTF, CSV, and JSON.
- Image text extraction using Groq Vision, with Tesseract.js as a client-side fallback.
- Large-note handling with a character counter and input validation.
- Sample notes and a pre-built Subject Library for trying the app without preparing your own material.
- Edit your notes after generating a study kit.

### 2. AI-generated study kit
The current generation prompt is designed to create:
- **20 multiple-choice questions** with easy, medium, and hard difficulty levels.
- **7 short-answer questions** with model answers and key points.
- **20 flashcards** with question/term fronts and answer/definition backs.
- A topic name and short summary based on the submitted notes.

Generated material is intended to be grounded in the notes provided by the student.

### 3. AI provider fallback
AI requests are handled by the server-side `/api/generate` endpoint. The default provider order is:

1. OpenRouter
2. Google Gemini
3. Groq

The provider order and model lists can be configured through server environment variables. If a provider is unavailable or returns an invalid response, the backend can try another configured provider.

### 4. Quiz and practice tools
- Multiple-choice quizzes with answer checking and explanations.
- Easy, medium, and hard question labels.
- Timed quiz mode.
- Keyboard controls for quiz navigation and answer selection.
- Retry Weak Questions to practise questions answered incorrectly.
- Short-answer practice with AI grading, a score, feedback, and missed key points.
- Offline keyword-based grading fallback when AI grading cannot be reached.

### 5. Flashcards
- Animated 3D flip cards.
- Shuffle cards and move through the deck.
- Mark cards as mastered.
- Track mastery progress.
- Text-to-speech using the browser's Web Speech API.

### 6. Reports and study history
- Score summary with correct, incorrect, and accuracy statistics.
- Topic/subtopic performance breakdown and weak-area indicators.
- Review answers after completing a quiz.
- Export a branded report as PDF.
- Shareable score card.
- Local session history stored with IndexedDB.
- Cloud session and result sync through Supabase for signed-in users.

### 7. Streaks and achievements
- Daily study streak tracking.
- Activity heatmap.
- Six achievement badges for study milestones.
- Achievement notifications when a badge is unlocked.

### 8. Accounts and cloud sync
- Supabase authentication.
- Google and GitHub sign-in options.
- Sign-in required to use the study app.
- Cloud storage for study sessions and results.
- Local-to-cloud session migration after sign-in.

### 9. Reviews and email notifications
- In-app reviews with star ratings and categories.
- Categories for general feedback, UI, AI quality, feature requests, and bug reports.
- Users can edit their reviews and mark reviews as helpful.
- Admin review moderation, deletion, and replies from the ExamBrain Team.
- In-app notification indicators for unseen admin replies.
- Email notifications to registered reviewers when the admin replies.
- Review reply emails are sent through Resend from the verified `exambrain.me` domain.
- Email replies are directed to the project's configured support inbox using the `Reply-To` header.

### 10. Feedback and admin dashboard
- Optional feedback prompt after a study kit is generated.
- Students can rate whether a study kit was helpful, somewhat helpful, or not helpful, and leave an optional comment.
- Admin-only Feedback dashboard for viewing feedback submissions and rating summaries.
- Feedback dashboard includes a manual refresh control and displays recent submissions.

### 11. Progressive Web App
- Installable on supported Android, iOS, and desktop browsers.
- Service-worker caching for supported offline app resources.
- Install prompt and app-installed tracking.
- Custom app icons and mobile-first layout.

### 12. Product analytics and interface
- Google Analytics 4 event tracking for key app actions.
- Responsive, mobile-first interface.
- Warm cream and brown visual theme.
- Landing page with feature overview, FAQs, and calls to action.
- Lightweight animations and Vanta.js visual effects where supported.

---

## Technology stack

| Area | Technology |
|---|---|
| Frontend | React 18 |
| Build tool | Vite 5 |
| Routing | React Router |
| UI icons | Lucide React |
| State management | Zustand |
| Authentication | Supabase Auth |
| Database | Supabase Postgres |
| AI generation | OpenRouter, Google Gemini, Groq |
| Image OCR | Groq Vision and Tesseract.js fallback |
| Serverless API | Vercel Functions |
| Email notifications | Resend |
| Local persistence | IndexedDB via idb |
| PDF reports | jsPDF |
| File parsing | pdf.js, mammoth.js, browser file APIs |
| PWA | vite-plugin-pwa and Workbox |
| Analytics | Google Analytics 4 |
| Deployment | Vercel |

---

## How the AI backend works

The browser sends authenticated requests to ExamBrain's API routes rather than calling the AI providers directly.

- `POST /api/generate` — validates the signed-in user, checks the AI quota, and runs the configured provider fallback.
- `POST /api/ocr` — validates the signed-in user and extracts text from supported images using Groq Vision.
- `POST /api/review-reply` — verifies the administrator, saves a review reply, looks up the review owner's email, and requests an email notification through Resend.
- `api/_auth.js` — shared authentication and quota guard for AI endpoints.

The AI quota guard uses the Supabase `consume_ai_quota` database function. If the quota service cannot be verified, AI requests are refused rather than sent without rate-limit protection.

---

## Getting started

### Requirements
- Node.js 18 or newer
- npm
- A Supabase project
- At least one AI provider API key for AI generation
- A Vercel account for deployment

### 1. Clone the repository

```bash
git clone https://github.com/nikkipandey-8599/exambrain.git
cd exambrain
npm install
```

### 2. Configure environment variables

Create a local `.env` file and configure the values below. Do not commit real secrets to GitHub.

**Frontend variables**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Server-side variables**

Configure at least one AI provider key:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

The AI provider keys are optional individually; the backend skips providers whose keys are not configured. The default provider order is OpenRouter, Gemini, then Groq.

For server-side Supabase access, the API accepts `SUPABASE_URL` and `SUPABASE_ANON_KEY`; if these are not set, it can use the corresponding `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values.

**Email and administrator reply variables**

```env
RESEND_API_KEY=your_resend_api_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Keep `RESEND_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` server-side only. Never prefix secret keys with `VITE_`, expose them in browser code, or commit them to the repository.

### 3. Configure Supabase

1. Create a Supabase project.
2. Run the repository's `SUPABASE_SETUP.sql` in the Supabase SQL Editor to create the sessions and results tables.
3. Enable the authentication providers you intend to use, including Google and GitHub if required.
4. Configure the Supabase authentication Site URL and redirect URLs for your local and deployed app.
5. Ensure the database also has the `reviews` and `generation_feedback` tables used by the app, plus the `consume_ai_quota` function required by the AI API guard.

**Database setup note:** The current repository includes `SUPABASE_SETUP.sql` for sessions and results. The additional reviews, generation-feedback, and AI-quota database setup scripts are not currently included in the repository. A fresh Supabase project needs those database objects configured separately before those features can work.

### 4. Run the frontend locally

```bash
npm run dev
```

The Vite development server runs the frontend. The `/api/*` routes are Vercel serverless functions, so use a Vercel-compatible local environment when testing the complete API workflow.

### 5. Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Add the required environment variables in the Vercel project settings.
3. Deploy the project.
4. Add your deployed site URL to Supabase Authentication → URL Configuration.
5. Redeploy after changing environment variables so the deployment receives the updated values.

For review reply emails, verify your sending domain in Resend and configure the required DNS records before testing delivery.

---

## Repository structure

```
exambrain/
├── api/
│   ├── _auth.js                 # Shared Supabase auth and AI quota guard
│   ├── generate.js              # AI generation and provider fallback
│   ├── ocr.js                   # Image-to-text API
│   └── review-reply.js          # Admin review replies and Resend emails
├── public/                      # PWA icons, metadata, static assets
├── src/
│   ├── components/              # Shared UI, reviews, feedback, navigation
│   ├── data/                    # Subject Library content
│   ├── hooks/                   # Authentication, streaks, and app hooks
│   ├── pages/                   # Landing, auth, quiz, reports, admin feedback
│   ├── services/                # Supabase, AI, file parsing, local database
│   ├── store/                   # Zustand app state
│   └── utils/                   # Analytics and shared helpers
├── SUPABASE_SETUP.sql           # Sessions and results schema
├── vercel.json                  # Vercel build, function, and security settings
├── vite.config.js               # Vite and PWA configuration
└── package.json
```

---

## Security notes

- AI provider API keys are used by server-side functions, not browser requests.
- AI endpoints require a valid Supabase access token.
- AI requests are checked against per-user and global quotas through Supabase.
- The quota guard fails closed if it cannot verify the quota result.
- The admin review-reply endpoint independently checks the signed-in administrator's email.
- The Supabase service-role key is used only by the server-side review-reply endpoint.
- User-generated review content is HTML-escaped before being inserted into notification emails.
- Vercel response headers include protections such as HSTS, content-type sniffing protection, and a restrictive referrer policy.

Never publish API keys, service-role keys, access tokens, or private environment files.

---

## Install ExamBrain on a phone

**Android**
1. Open [exambrain.me](https://exambrain.me) in Chrome.
2. Open the browser menu.
3. Choose **Install app** or **Add to Home screen**.

**iPhone or iPad**
1. Open [exambrain.me](https://exambrain.me) in Safari.
2. Tap the Share button.
3. Choose **Add to Home Screen**.

Availability of installation options depends on the browser and device.

---

## Known limitations

- AI generation and online AI grading need an internet connection and depend on configured provider availability, quotas, and model limits.
- Offline grading is a keyword-based fallback; it is not equivalent to AI grading.
- OCR fallback quality can vary with image clarity and text layout.
- The repository currently does not include all SQL migrations needed to create the reviews, generation-feedback, and AI-quota database objects on a brand-new Supabase project.

---

## Contributing

Issues, bug reports, and practical improvement suggestions are welcome. For substantial changes, open an issue first so the proposed direction can be discussed.

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Open a pull request with a clear description.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Built by

**Nikki Pandey** · [GitHub](https://github.com/nikkipandey-8599)

ExamBrain is an independently built student project created to make exam preparation more accessible and structured.

---

<div align="center">

**If ExamBrain helps you study, consider giving the repository a ⭐**

[![GitHub stars](https://img.shields.io/github/stars/nikkipandey-8599/exambrain?style=social)](https://github.com/nikkipandey-8599/exambrain)

</div>

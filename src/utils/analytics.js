// ── ExamBrain Analytics — GA4 Event Tracking ─────────
// Wraps gtag() with guards so events only fire once per action
// and never break the app if GA fails to load.

const fired = new Set() // prevents duplicate events per session

function gtag(...args) {
  if (typeof window === 'undefined') return
  if (typeof window.gtag === 'function') {
    window.gtag(...args)
  }
}

/**
 * Core event sender — deduplicates by eventKey
 * @param {string} eventName  - GA4 event name
 * @param {object} params     - GA4 event params
 * @param {string|null} dedupeKey - if provided, event fires only once per this key
 */
function track(eventName, params = {}, dedupeKey = null) {
  try {
    if (dedupeKey) {
      if (fired.has(dedupeKey)) return
      fired.add(dedupeKey)
    }
    gtag('event', eventName, {
      event_category: 'ExamBrain',
      ...params
    })
  } catch (e) {
    // Never break the app due to analytics
    console.debug('[Analytics] Failed:', eventName, e)
  }
}

// ── Reset deduplication (call when new session starts) ─
export function resetAnalyticsSession() {
  fired.clear()
}

// ─────────────────────────────────────────────────────
// 1. Notes submitted
// ─────────────────────────────────────────────────────
export function trackNotesSubmitted(charCount, source = 'paste') {
  track('notes_submitted', {
    char_count: charCount,
    source, // 'paste' | 'file' | 'library' | 'sample'
    event_label: `${source} — ${charCount} chars`
  })
}

// ─────────────────────────────────────────────────────
// 2. Generation events
// ─────────────────────────────────────────────────────
export function trackMCQGenerated(topic, count = 20) {
  track('generate_mcq', {
    topic,
    question_count: count,
    event_label: topic
  }, `generate_mcq_${topic}`)
}

export function trackFlashcardsGenerated(topic, count = 20) {
  track('generate_flashcards', {
    topic,
    card_count: count,
    event_label: topic
  }, `generate_flashcards_${topic}`)
}

export function trackShortAnswersGenerated(topic, count = 7) {
  track('generate_short_answers', {
    topic,
    question_count: count,
    event_label: topic
  }, `generate_sa_${topic}`)
}

// Single helper that fires all three generation events at once
export function trackGenerationComplete(topic) {
  trackMCQGenerated(topic)
  trackFlashcardsGenerated(topic)
  trackShortAnswersGenerated(topic)
  track('exam_prep_generated', {
    topic,
    event_label: topic
  })
}

// ─────────────────────────────────────────────────────
// 3. Quiz events
// ─────────────────────────────────────────────────────
export function trackQuizStarted(topic, mode = 'normal') {
  track('start_quiz', {
    topic,
    quiz_mode: mode, // 'normal' | 'timed' | 'retry_weak'
    event_label: `${topic} — ${mode}`
  })
}

export function trackQuizCompleted(topic, score, totalQuestions, timeTakenSeconds = null) {
  track('complete_quiz', {
    topic,
    score_percent: score,
    total_questions: totalQuestions,
    time_taken_seconds: timeTakenSeconds,
    event_label: `${topic} — ${score}%`
  })
}

// ─────────────────────────────────────────────────────
// 4. Report events
// ─────────────────────────────────────────────────────
export function trackReportDownloaded(topic, score) {
  track('download_report', {
    topic,
    score_percent: score,
    event_label: `${topic} — ${score}%`
  }, `download_report_${topic}`)
}

export function trackReportViewed(topic, score) {
  track('view_report', {
    topic,
    score_percent: score,
    event_label: topic
  })
}

// ─────────────────────────────────────────────────────
// 5. PWA events
// ─────────────────────────────────────────────────────
export function trackPWAInstalled() {
  track('pwa_install', {
    event_label: 'PWA installed'
  }, 'pwa_install')
}

export function trackPWAPromptShown() {
  track('pwa_prompt_shown', {
    event_label: 'Install prompt shown'
  }, 'pwa_prompt_shown')
}

export function trackPWAPromptDismissed() {
  track('pwa_prompt_dismissed', {
    event_label: 'Install prompt dismissed'
  })
}

// ─────────────────────────────────────────────────────
// 6. Subject Library
// ─────────────────────────────────────────────────────
export function trackSubjectLibraryOpened() {
  track('subject_library_opened', {
    event_label: 'Subject Library opened'
  })
}

export function trackSubjectLoaded(subject, topic) {
  track('subject_loaded', {
    subject,
    topic,
    event_label: `${subject} — ${topic}`
  })
}

// ─────────────────────────────────────────────────────
// 7. Auth events
// ─────────────────────────────────────────────────────
export function trackSignIn(provider) {
  track('sign_in', {
    provider, // 'google' | 'github'
    event_label: provider
  })
}

export function trackSignUp(provider) {
  track('sign_up', {
    provider,
    event_label: provider
  })
}

// ─────────────────────────────────────────────────────
// 8. File upload
// ─────────────────────────────────────────────────────
export function trackFileUploaded(fileType, sizeMB) {
  track('file_uploaded', {
    file_type: fileType,
    file_size_mb: Math.round(sizeMB * 10) / 10,
    event_label: `${fileType} — ${sizeMB.toFixed(1)}MB`
  })
}

// ─────────────────────────────────────────────────────
// 9. Page / tab views
// ─────────────────────────────────────────────────────
export function trackTabView(tabName) {
  track('tab_view', {
    tab_name: tabName,
    event_label: tabName
  })
}

// ─────────────────────────────────────────────────────
// 10. Review submitted
// ─────────────────────────────────────────────────────
export function trackReviewSubmitted(stars, category) {
  track('review_submitted', {
    stars,
    category,
    event_label: `${stars} stars — ${category}`
  })
}

// ─────────────────────────────────────────────────────
// PWA install detection — call once from App.jsx
// ─────────────────────────────────────────────────────
export function initPWATracking() {
  if (typeof window === 'undefined') return

  window.addEventListener('beforeinstallprompt', () => {
    trackPWAPromptShown()
  })

  window.addEventListener('appinstalled', () => {
    trackPWAInstalled()
  })
}

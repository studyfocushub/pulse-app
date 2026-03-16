// ============================================
// API ROUTES — all in one reference file
// Create each as app/api/[route]/route.ts
// ============================================

// --- app/api/validate-key/route.ts ---
export const validateKeyRoute = `
import { NextResponse } from 'next/server'
import { validateLicenseKey } from '@/lib/gumroad'

export async function POST(req: Request) {
  const { licenseKey } = await req.json()
  if (!licenseKey) return NextResponse.json({ success: false, error: 'No key provided' })
  const result = await validateLicenseKey(licenseKey)
  if (result.valid) return NextResponse.json({ success: true, planType: result.planType, email: result.email })
  return NextResponse.json({ success: false, error: result.reason })
}
`

// --- app/api/auth/register/route.ts ---
export const registerRoute = `
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, streaks } from '@/lib/schema'
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth'
import { validateLicenseKey } from '@/lib/gumroad'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const { email, password, name, licenseKey } = await req.json()
  if (!email || !password || !licenseKey) return NextResponse.json({ success: false, error: 'Missing fields' })

  // Re-validate key
  const keyResult = await validateLicenseKey(licenseKey)
  if (!keyResult.valid) return NextResponse.json({ success: false, error: 'Invalid license key' })

  // Check if user exists
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) return NextResponse.json({ success: false, error: 'Email already registered' })

  const passwordHash = await hashPassword(password)
  const [user] = await db.insert(users).values({ email, passwordHash, name, licenseKey, planType: keyResult.planType || 'monthly' }).returning()

  // Create streak record
  await db.insert(streaks).values({ userId: user.id, currentStreak: 0, longestStreak: 0 })

  const token = await createToken(user.id, user.email)
  await setSessionCookie(token)

  return NextResponse.json({ success: true })
}
`

// --- app/api/auth/login/route.ts ---
export const loginRoute = `
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { verifyPassword, createToken, setSessionCookie } from '@/lib/auth'
import { checkSubscriptionStatus } from '@/lib/gumroad'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user) return NextResponse.json({ success: false, error: 'Invalid email or password' })

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return NextResponse.json({ success: false, error: 'Invalid email or password' })

  // For monthly subscribers, check if still active
  if (user.planType === 'monthly') {
    const active = await checkSubscriptionStatus(user.licenseKey)
    if (!active) return NextResponse.json({ success: false, error: 'subscription_lapsed', redirect: '/locked' })
  }

  const token = await createToken(user.id, user.email)
  await setSessionCookie(token)
  return NextResponse.json({ success: true })
}
`

// --- app/api/auth/logout/route.ts ---
export const logoutRoute = `
import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/auth'

export async function POST() {
  await clearSession()
  return NextResponse.json({ success: true })
}
`

// --- app/api/onboarding/save-quiz/route.ts ---
export const saveQuizRoute = `
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { studentProfiles } from '@/lib/schema'
import { getSession } from '@/lib/auth'
import { eq } from 'drizzle-orm'

function computeProfile(answers: Record<string, string>) {
  let studentType = 'Slow Burner'
  if (answers.study_time?.includes('Night') || answers.study_time?.includes('Evening')) studentType = 'Night Processor'
  else if (answers.study_time?.includes('Early morning')) studentType = 'Early Bird'
  else if (answers.study_habit?.includes('Cram')) studentType = 'Crammer'
  else if (answers.focus_duration?.includes('Over an hour')) studentType = 'Deep Diver'
  else if (answers.focus_duration?.includes('Under 15') || answers.focus_duration?.includes('15-25')) studentType = 'Sprint Learner'

  const focusMap: Record<string, number> = { 'Under 15 minutes': 12, '15-25 minutes': 22, '25-40 minutes': 32, '40-60 minutes': 48, 'Over an hour': 70 }
  const focusCliff = focusMap[answers.focus_duration || ''] || 30

  const peakMap: Record<string, string> = { 'Early morning (6-9am)': '6am-9am', 'Late morning (9am-12pm)': '9am-12pm', 'Afternoon (12-5pm)': '12pm-5pm', 'Evening (5-9pm)': '5pm-9pm', 'Night (9pm+)': '9pm-12am' }
  const peakHours = peakMap[answers.study_time || ''] || 'Evening'

  const processingStyle = answers.learning_style?.includes('example') ? 'Example-First' : answers.learning_style?.includes('concept') ? 'Concept-First' : answers.learning_style?.includes('draw') ? 'Visual' : 'Verbal'
  const retentionStyle = answers.retention_style?.includes('sleep') || answers.retention_style?.includes('morning') ? 'Sleep-Consolidator' : 'Immediate-Recall'

  return { studentType, focusCliff, peakHours, processingStyle, retentionStyle }
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

  const { answers } = await req.json()
  const computed = computeProfile(answers)

  await db.insert(studentProfiles).values({
    userId: session.userId,
    quizAnswers: answers,
    ...computed,
    completedAt: new Date(),
  }).onConflictDoUpdate({ target: studentProfiles.userId, set: { quizAnswers: answers, ...computed, completedAt: new Date() } })

  return NextResponse.json({ success: true })
}
`

// --- app/api/sessions/log/route.ts ---
export const logSessionRoute = `
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sessionLogs, forgetPredictions, streaks, studentProfiles } from '@/lib/schema'
import { getSession } from '@/lib/auth'
import { generateForgetPrediction } from '@/lib/ai'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

  const body = await req.json()
  const [log] = await db.insert(sessionLogs).values({ userId: session.userId, ...body }).returning()

  // Update streak
  const [streak] = await db.select().from(streaks).where(eq(streaks.userId, session.userId)).limit(1)
  const now = new Date()
  const lastLogged = streak?.lastLoggedAt ? new Date(streak.lastLoggedAt) : null
  const isConsecutive = lastLogged && (now.getTime() - lastLogged.getTime()) < 48 * 60 * 60 * 1000
  const newStreak = isConsecutive ? (streak.currentStreak || 0) + 1 : 1

  await db.update(streaks).set({
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, streak?.longestStreak || 0),
    lastLoggedAt: now,
    updatedAt: now,
  }).where(eq(streaks.userId, session.userId))

  // Generate forget prediction using AI
  try {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.userId)).limit(1)
    if (profile) {
      const prediction = await generateForgetPrediction({
        topic: body.topic, subject: body.subject, technique: body.technique,
        confidenceScore: body.confidenceScore, durationMinutes: body.durationMinutes,
        studentType: profile.studentType || 'Slow Burner', focusCliff: profile.focusCliff || 30,
      })
      const forgetAt = new Date(Date.now() + prediction.hoursUntilForgetting * 60 * 60 * 1000)
      await db.insert(forgetPredictions).values({
        userId: session.userId, sessionLogId: log.id,
        topic: body.topic, subject: body.subject,
        studiedAt: new Date(), predictedForgetAt: forgetAt,
        retentionPercentage: 100,
      })
    }
  } catch (e) { console.error('Forget prediction failed:', e) }

  return NextResponse.json({ success: true, logId: log.id })
}
`

// --- app/api/dashboard/route.ts ---
export const dashboardRoute = `
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, studentProfiles, streaks, sessionLogs, forgetPredictions, brainInsights } from '@/lib/schema'
import { getSession } from '@/lib/auth'
import { eq, desc, lt, and } from 'drizzle-orm'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.userId)).limit(1)
  const [streak] = await db.select().from(streaks).where(eq(streaks.userId, session.userId)).limit(1)
  const recentLogs = await db.select().from(sessionLogs).where(eq(sessionLogs.userId, session.userId)).orderBy(desc(sessionLogs.studiedAt)).limit(5)
  const insights = await db.select().from(brainInsights).where(eq(brainInsights.userId, session.userId))

  // Forget alerts - topics about to be forgotten
  const forgetAlerts = await db.select().from(forgetPredictions).where(
    and(eq(forgetPredictions.userId, session.userId), eq(forgetPredictions.isReviewed, false))
  ).orderBy(forgetPredictions.retentionPercentage).limit(5)

  // Update retention percentages based on time elapsed
  const updatedAlerts = forgetAlerts.map(alert => {
    const hoursElapsed = (Date.now() - new Date(alert.studiedAt).getTime()) / (1000 * 60 * 60)
    const retention = Math.max(0, Math.round(100 * Math.exp(-0.05 * hoursElapsed)))
    return { ...alert, retentionPercentage: retention }
  })

  const uniqueDays = new Set(recentLogs.map(l => new Date(l.studiedAt).toDateString())).size
  const completionPercent = Math.min(100, Math.round((uniqueDays / 7) * 100))

  const today = new Date().toDateString()
  const todayLogged = recentLogs.some(l => new Date(l.studiedAt).toDateString() === today)

  const dayOfWeek = new Date().getDay()
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek

  return NextResponse.json({
    user: { name: user?.name, email: user?.email },
    profile: { studentType: profile?.studentType, peakHours: profile?.peakHours, focusCliff: profile?.focusCliff, completionPercent },
    streak: { current: streak?.currentStreak || 0, longest: streak?.longestStreak || 0 },
    todayLogged, forgetAlerts: updatedAlerts, recentLogs,
    insightsUnlocked: uniqueDays >= 7 || insights.length > 0,
    daysUntilWrapped: daysUntilSunday,
  })
}
`

// --- app/api/insights/route.ts ---
export const insightsRoute = `
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { brainInsights, studentProfiles, sessionLogs } from '@/lib/schema'
import { getSession } from '@/lib/auth'
import { generateBrainInsights } from '@/lib/ai'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.userId)).limit(1)
  const logs = await db.select().from(sessionLogs).where(eq(sessionLogs.userId, session.userId)).orderBy(desc(sessionLogs.studiedAt)).limit(50)
  const existing = await db.select().from(brainInsights).where(eq(brainInsights.userId, session.userId))

  const uniqueDays = new Set(logs.map(l => new Date(l.studiedAt).toDateString())).size
  const unlocked = uniqueDays >= 7

  // Generate insights if unlocked and not yet generated
  if (unlocked && existing.length === 0 && profile) {
    try {
      const generated = await generateBrainInsights({ quizAnswers: profile.quizAnswers as Record<string, string>, sessionLogs: logs.map(l => ({ topic: l.topic, subject: l.subject, technique: l.technique, durationMinutes: l.durationMinutes, confidenceScore: l.confidenceScore, energyBefore: l.energyBefore, energyAfter: l.energyAfter, timeOfDay: l.timeOfDay, dayOfWeek: l.dayOfWeek })) })
      // Save insights
      for (const ins of generated.insights) {
        await db.insert(brainInsights).values({ userId: session.userId, insightType: ins.type, title: ins.title, description: ins.description, actionableTip: ins.actionableTip })
      }
      // Update profile with computed values
      await db.update(studentProfiles).set({ studentType: generated.studentType, focusCliff: generated.focusCliff, peakHours: generated.peakHours, peakDays: generated.peakDays, processingStyle: generated.processingStyle }).where(eq(studentProfiles.userId, session.userId))
      const newInsights = await db.select().from(brainInsights).where(eq(brainInsights.userId, session.userId))
      return NextResponse.json({ insights: newInsights, profile: { ...profile, ...generated }, unlocked, daysLogged: uniqueDays })
    } catch (e) { console.error('Insight generation failed:', e) }
  }

  return NextResponse.json({ insights: existing, profile, unlocked, daysLogged: uniqueDays })
}
`

// --- app/api/coach/chat/route.ts ---
export const coachChatRoute = `
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coachChats, studentProfiles, sessionLogs, brainInsights } from '@/lib/schema'
import { getSession } from '@/lib/auth'
import { chatWithCoach } from '@/lib/ai'
import { eq, desc } from 'drizzle-orm'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { message } = await req.json()
  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.userId)).limit(1)
  const recentLogs = await db.select().from(sessionLogs).where(eq(sessionLogs.userId, session.userId)).orderBy(desc(sessionLogs.studiedAt)).limit(10)
  const insights = await db.select().from(brainInsights).where(eq(brainInsights.userId, session.userId))
  const history = await db.select().from(coachChats).where(eq(coachChats.userId, session.userId)).orderBy(desc(coachChats.createdAt)).limit(20)

  // Save user message
  await db.insert(coachChats).values({ userId: session.userId, role: 'user', content: message })

  const reply = await chatWithCoach(
    [...history.reverse().map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })), { role: 'user', content: message }],
    { studentType: profile?.studentType || 'Unknown', peakHours: profile?.peakHours || 'Unknown', focusCliff: profile?.focusCliff || 30, recentLogs: recentLogs.map(l => ({ topic: l.topic, subject: l.subject, confidenceScore: l.confidenceScore, studiedAt: l.studiedAt?.toString() || '' })), insights: insights.map(i => ({ title: i.title, description: i.description })) }
  )

  // Save assistant reply
  await db.insert(coachChats).values({ userId: session.userId, role: 'assistant', content: reply || '' })

  return NextResponse.json({ reply })
}
`

// --- app/api/forget/predictions/route.ts ---
export const forgetPredictionsRoute = `
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forgetPredictions } from '@/lib/schema'
import { getSession } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const predictions = await db.select().from(forgetPredictions).where(
    and(eq(forgetPredictions.userId, session.userId), eq(forgetPredictions.isReviewed, false))
  )

  const updated = predictions.map(p => {
    const hoursElapsed = (Date.now() - new Date(p.studiedAt).getTime()) / (1000 * 60 * 60)
    const retention = Math.max(0, Math.round(100 * Math.exp(-0.05 * hoursElapsed)))
    return { ...p, retentionPercentage: retention }
  }).sort((a, b) => a.retentionPercentage - b.retentionPercentage)

  return NextResponse.json({ predictions: updated })
}
`

// --- app/api/forget/reviewed/route.ts ---
export const markReviewedRoute = `
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forgetPredictions } from '@/lib/schema'
import { getSession } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const { id } = await req.json()
  await db.update(forgetPredictions).set({ isReviewed: true }).where(eq(forgetPredictions.id, id))
  return NextResponse.json({ success: true })
}
`

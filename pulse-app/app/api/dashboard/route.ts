import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, studentProfiles, streaks, sessionLogs, forgetPredictions, brainInsights } from '@/lib/schema'
import { getSession } from '@/lib/auth'
import { eq, desc, and } from 'drizzle-orm'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.userId)).limit(1)
  const [streak] = await db.select().from(streaks).where(eq(streaks.userId, session.userId)).limit(1)
  const recentLogs = await db.select().from(sessionLogs).where(eq(sessionLogs.userId, session.userId)).orderBy(desc(sessionLogs.studiedAt)).limit(5)
  const insights = await db.select().from(brainInsights).where(eq(brainInsights.userId, session.userId))
  const forgetAlerts = await db.select().from(forgetPredictions).where(and(eq(forgetPredictions.userId, session.userId), eq(forgetPredictions.isReviewed, false))).limit(5)
  const updatedAlerts = forgetAlerts.map(alert => { const h = (Date.now() - new Date(alert.studiedAt).getTime()) / (1000 * 60 * 60); return { ...alert, retentionPercentage: Math.max(0, Math.round(100 * Math.exp(-0.05 * h))) } }).sort((a, b) => a.retentionPercentage - b.retentionPercentage)
  const uniqueDays = new Set(recentLogs.map(l => new Date(l.studiedAt).toDateString())).size
  const today = new Date().toDateString()
  const todayLogged = recentLogs.some(l => new Date(l.studiedAt).toDateString() === today)
  const dayOfWeek = new Date().getDay()
  return NextResponse.json({ user: { name: user?.name, email: user?.email }, profile: { studentType: profile?.studentType, peakHours: profile?.peakHours, focusCliff: profile?.focusCliff, completionPercent: Math.min(100, Math.round((uniqueDays / 7) * 100)) }, streak: { current: streak?.currentStreak || 0, longest: streak?.longestStreak || 0 }, todayLogged, forgetAlerts: updatedAlerts, recentLogs, insightsUnlocked: uniqueDays >= 7 || insights.length > 0, daysUntilWrapped: dayOfWeek === 0 ? 0 : 7 - dayOfWeek })
}
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
  if (unlocked && existing.length === 0 && profile) {
    try {
      const generated = await generateBrainInsights({ quizAnswers: profile.quizAnswers as Record<string, string>, sessionLogs: logs.map(l => ({ topic: l.topic, subject: l.subject, technique: l.technique, durationMinutes: l.durationMinutes, confidenceScore: l.confidenceScore, energyBefore: l.energyBefore, energyAfter: l.energyAfter, timeOfDay: l.timeOfDay, dayOfWeek: l.dayOfWeek })) })
      for (const ins of generated.insights) { await db.insert(brainInsights).values({ userId: session.userId, insightType: ins.type, title: ins.title, description: ins.description, actionableTip: ins.actionableTip }) }
      await db.update(studentProfiles).set({ studentType: generated.studentType, focusCliff: generated.focusCliff, peakHours: generated.peakHours, peakDays: generated.peakDays, processingStyle: generated.processingStyle }).where(eq(studentProfiles.userId, session.userId))
      const newInsights = await db.select().from(brainInsights).where(eq(brainInsights.userId, session.userId))
      return NextResponse.json({ insights: newInsights, profile, unlocked, daysLogged: uniqueDays })
    } catch (e) { console.error(e) }
  }
  return NextResponse.json({ insights: existing, profile, unlocked, daysLogged: uniqueDays })
}
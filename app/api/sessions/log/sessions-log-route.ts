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

  // Generate forget prediction
  try {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.userId)).limit(1)
    if (profile) {
      const prediction = await generateForgetPrediction({
        topic: body.topic,
        subject: body.subject,
        technique: body.technique,
        confidenceScore: body.confidenceScore,
        durationMinutes: body.durationMinutes,
        studentType: profile.studentType || 'Slow Burner',
        focusCliff: profile.focusCliff || 30,
      })
      const forgetAt = new Date(Date.now() + prediction.hoursUntilForgetting * 60 * 60 * 1000)
      await db.insert(forgetPredictions).values({
        userId: session.userId,
        sessionLogId: log.id,
        topic: body.topic,
        subject: body.subject,
        studiedAt: now,
        predictedForgetAt: forgetAt,
        retentionPercentage: 100,
      })
    }
  } catch (e) {
    console.error('Forget prediction failed:', e)
  }

  return NextResponse.json({ success: true })
}

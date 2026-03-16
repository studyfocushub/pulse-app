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
  await db.insert(coachChats).values({ userId: session.userId, role: 'user', content: message })
  const reply = await chatWithCoach([...history.reverse().map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })), { role: 'user', content: message }], { studentType: profile?.studentType || 'Unknown', peakHours: profile?.peakHours || 'Unknown', focusCliff: profile?.focusCliff || 30, recentLogs: recentLogs.map(l => ({ topic: l.topic, subject: l.subject, confidenceScore: l.confidenceScore, studiedAt: l.studiedAt?.toString() || '' })), insights: insights.map(i => ({ title: i.title, description: i.description })) })
  await db.insert(coachChats).values({ userId: session.userId, role: 'assistant', content: reply || '' })
  return NextResponse.json({ reply })
}
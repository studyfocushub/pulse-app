import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coachChats, studentProfiles, users } from '@/lib/schema'
import { getSession } from '@/lib/auth'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.userId)).limit(1)
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  const messages = await db.select().from(coachChats).where(eq(coachChats.userId, session.userId)).orderBy(desc(coachChats.createdAt)).limit(40)
  return NextResponse.json({ messages: messages.reverse(), profile: { ...profile, name: user?.name } })
}
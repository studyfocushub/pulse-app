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
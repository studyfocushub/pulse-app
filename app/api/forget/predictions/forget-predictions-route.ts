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
    const studiedAt = p.studiedAt ? new Date(p.studiedAt).getTime() : Date.now()
    const h = (Date.now() - studiedAt) / (1000 * 60 * 60)
    return { ...p, retentionPercentage: Math.max(0, Math.round(100 * Math.exp(-0.05 * h))) }
  }).sort((a, b) => a.retentionPercentage - b.retentionPercentage)

  return NextResponse.json({ predictions: updated })
}

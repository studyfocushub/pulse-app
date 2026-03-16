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
  if (user.planType === 'monthly') {
    const active = await checkSubscriptionStatus(user.licenseKey)
    if (!active) return NextResponse.json({ success: false, error: 'subscription_lapsed', redirect: '/locked' })
  }
  const token = await createToken(user.id, user.email)
  await setSessionCookie(token)
  return NextResponse.json({ success: true })
}
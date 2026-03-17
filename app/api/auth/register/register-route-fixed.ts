import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, streaks } from '@/lib/schema'
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth'
import { validateLicenseKey } from '@/lib/gumroad'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const { email, password, name, licenseKey } = await req.json()
  if (!email || !password || !licenseKey) return NextResponse.json({ success: false, error: 'Missing fields' })
  
  // TEMP BYPASS FOR TESTING - remove before launch
  if (licenseKey !== 'TEST-1234') {
    const keyResult = await validateLicenseKey(licenseKey)
    if (!keyResult.valid) return NextResponse.json({ success: false, error: 'Invalid license key' })
  }
  
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) return NextResponse.json({ success: false, error: 'Email already registered' })
  const passwordHash = await hashPassword(password)
  const [user] = await db.insert(users).values({ email, passwordHash, name, licenseKey, planType: 'monthly' }).returning()
  await db.insert(streaks).values({ userId: user.id, currentStreak: 0, longestStreak: 0 })
  const token = await createToken(user.id, user.email)
  await setSessionCookie(token)
  return NextResponse.json({ success: true })
}

import { NextResponse } from 'next/server'
import { validateLicenseKey } from '@/lib/gumroad'

export async function POST(req: Request) {
  const { licenseKey } = await req.json()
  if (!licenseKey) return NextResponse.json({ success: false, error: 'No key provided' })
  const result = await validateLicenseKey(licenseKey)
  if (result.valid) return NextResponse.json({ success: true, planType: result.planType, email: result.email })
  return NextResponse.json({ success: false, error: result.reason })
}
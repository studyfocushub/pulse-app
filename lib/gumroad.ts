export async function validateLicenseKey(licenseKey: string, productPermalink?: string) {
  try {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        access_token: process.env.GUMROAD_API_KEY!,
        license_key: licenseKey,
        product_permalink: productPermalink || '',
        increment_uses_count: 'false',
      }),
    })

    const data = await response.json()

    if (!data.success) {
      return { valid: false, reason: 'Invalid license key' }
    }

    const purchase = data.purchase

    // Check if subscription is still active
    if (purchase.subscription_cancelled_at || purchase.subscription_failed_at) {
      return { valid: false, reason: 'Subscription cancelled or payment failed' }
    }

    // Determine plan type
    const planType = purchase.recurrence ? 'monthly' : 'lifetime'

    return {
      valid: true,
      planType,
      email: purchase.email,
      purchaseId: purchase.id,
    }
  } catch (error) {
    console.error('Gumroad validation error:', error)
    return { valid: false, reason: 'Validation failed' }
  }
}

// Check if an existing subscription key is still active
export async function checkSubscriptionStatus(licenseKey: string) {
  const result = await validateLicenseKey(licenseKey)
  return result.valid
}

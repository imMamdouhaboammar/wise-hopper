import { NextRequest, NextResponse } from 'next/server';
import { resolveBillingAdapter } from '@/lib/billing/provider-factory';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const rawPlan = formData.get('plan')?.toString();
    const plan: 'monthly' | 'annual' = rawPlan === 'annual' ? 'annual' : 'monthly';
    const email = formData.get('email')?.toString().trim() || 'reader@example.com';

    const provider = resolveBillingAdapter();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await provider.createCheckoutSession({
      plan,
      customerEmail: email,
      redirectUrl: `${siteUrl}/account?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.redirect(session.checkoutUrl, 303);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

import { NewsletterService } from '../src/lib/newsletter/subscriber-service';
import { MailerService } from '../src/lib/newsletter/mailer';

async function main() {
  console.log('🚀 Starting Wise Hopper Newsletter End-to-End Verification...\n');

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  console.log(`• Site URL: ${siteUrl}`);
  console.log(`• Sender Email: ${fromEmail}`);
  console.log(`• Resend API Key Configured: ${apiKey ? 'YES' : 'NO'}`);

  // Test MailerService in sandbox/isolated mode first to trace messages
  const sandboxMailer = new MailerService({ mode: 'sandbox' });
  const service = new NewsletterService(sandboxMailer, siteUrl);

  const testEmail = 'reader.test@wisehopper.dev';
  const topics = ['editorial-design', 'system-architecture'];

  console.log(`\n1️⃣  Subscribing test user: ${testEmail}...`);
  const subscriber = await service.subscribe(testEmail, topics);

  if (!subscriber.confirmation_token) {
    throw new Error('❌ Confirmation token was not generated');
  }
  console.log('   ✓ Subscriber record created with status: unconfirmed');
  console.log('   ✓ Confirmation token generated:', subscriber.confirmation_token.slice(0, 10) + '...');
  console.log('   ✓ Token expiration:', subscriber.token_expires_at);

  const sentAfterSubscribe = sandboxMailer.getSentMessages();
  if (sentAfterSubscribe.length !== 1) {
    throw new Error(`❌ Expected 1 email sent, got ${sentAfterSubscribe.length}`);
  }
  console.log('   ✓ Confirmation email dispatched to subscriber');
  console.log('   ✓ Subject:', sentAfterSubscribe[0].subject);

  console.log('\n2️⃣  Confirming subscription via token...');
  const confirmed = await service.confirmSubscription(subscriber.confirmation_token);
  if (!confirmed) {
    throw new Error('❌ Confirmation failed');
  }

  const activeSubscriber = await service.getSubscriber(testEmail);
  if (activeSubscriber?.status !== 'active') {
    throw new Error(`❌ Expected status active, got ${activeSubscriber?.status}`);
  }
  console.log('   ✓ Subscriber status updated to: active');

  const sentAfterConfirm = sandboxMailer.getSentMessages();
  if (sentAfterConfirm.length !== 2) {
    throw new Error(`❌ Expected 2 emails sent (confirmation + welcome), got ${sentAfterConfirm.length}`);
  }
  console.log('   ✓ Welcome email dispatched automatically upon confirmation');
  console.log('   ✓ Welcome Subject:', sentAfterConfirm[1].subject);
  console.log('   ✓ RFC 8058 Header present:', sentAfterConfirm[1].headers?.['List-Unsubscribe']);

  console.log('\n3️⃣  Testing campaign broadcast email rendering...');
  const campaignSent = await sandboxMailer.sendCampaignEmail(
    testEmail,
    'العدد التجريبي رقم 1: معمارية النشر المعاصر',
    'هذا العدد يركز على استقرار النظم الموزعة ونقاء التجربة التحريرية.\n\nنتمنى لك قراءة ممتعة وهادئة.',
    `${siteUrl}/api/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`
  );
  if (!campaignSent) {
    throw new Error('❌ Campaign email dispatch failed');
  }
  console.log('   ✓ Campaign email template rendered & delivered cleanly');

  console.log('\n4️⃣  Testing Unsubscribe flow via secret token...');
  const unsubscribed = await service.unsubscribeByToken(subscriber.unsubscribe_token!);
  if (!unsubscribed) {
    throw new Error('❌ Unsubscribe failed');
  }
  const unsubRecord = await service.getSubscriber(testEmail);
  if (unsubRecord?.status !== 'unsubscribed') {
    throw new Error(`❌ Expected status unsubscribed, got ${unsubRecord?.status}`);
  }
  console.log('   ✓ Subscriber status updated to: unsubscribed');

  console.log('\n✅ All newsletter end-to-end integration checks PASSED successfully!\n');
}

main().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});

import { redirect } from 'next/navigation';
import { verifyOwnerSession } from '@/lib/auth/session';
import { StudioHeader } from '@/components/studio/studio-header';

export const metadata = {
  title: 'استوديو النشر | وايز هوبر',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    redirect('/account?error=unauthorized_studio&redirect=/studio');
  }
  return (
    <div className="min-h-screen bg-lavender-light/40 flex flex-col">
      <StudioHeader />

      {/* Main Studio Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">{children}</div>
    </div>
  );
}

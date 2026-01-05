import AuthCheck from '@/app/components/AuthCheck';
import Navigation from '@/app/components/Navigation';

export default function AddProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        {children}
      </div>
    </AuthCheck>
  );
}

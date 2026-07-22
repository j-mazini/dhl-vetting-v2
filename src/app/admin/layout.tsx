import { AuthProvider } from '@/context/AuthContext';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminCandidateProvider } from '@/components/admin/AdminCandidateContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminAuthGuard>
        <AdminCandidateProvider>{children}</AdminCandidateProvider>
      </AdminAuthGuard>
    </AuthProvider>
  );
}

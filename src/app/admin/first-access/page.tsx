import { AuthProvider } from '@/context/AuthContext';
import { GenerateFirstAccessCode } from '@/components/admin/GenerateFirstAccessCode';

export const metadata = {
  title: 'Generate First Access Code | Admin',
  description: 'Generate temporary password codes for new drivers',
};

export default function GenerateFirstAccessPage() {
  return (
    <AuthProvider>
      <GenerateFirstAccessCode />
    </AuthProvider>
  );
}

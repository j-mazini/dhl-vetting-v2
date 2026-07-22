import { AuthProvider } from '@/context/AuthContext';

export default function VettingLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

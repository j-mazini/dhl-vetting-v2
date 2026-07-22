import { redirect } from 'next/navigation';

export default function VettingLoginAliasPage() {
  redirect('/vetting');
}
export const dynamic = 'force-dynamic';

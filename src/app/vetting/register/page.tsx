import { redirect } from 'next/navigation';

export default function LegacyVettingRegisterPage() {
  redirect('/apply');
}
export const dynamic = 'force-dynamic';

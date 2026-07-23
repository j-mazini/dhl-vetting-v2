import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCpueUMJVALaB75GsHrNJcta-EgGsq9tWM',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'vetting-63c6d.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vetting-63c6d',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'vetting-63c6d.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '443177968978',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:443177968978:web:b205f3d3b16f88c704c68b',
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

function generateRandomCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate reset code
    const code = generateRandomCode(32);

    // Save password reset token to Firestore
    await setDoc(doc(db, 'passwordResetTokens', code), {
      email: cleanEmail,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + 60 * 60 * 1000), // 1 hour
      used: false,
    });

    // In production, send email here
    // For now, return the link for development
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dhl-vetting-tracker.vercel.app'}/vetting/reset-password?code=${code}`;

    console.log(`Password reset link for ${cleanEmail}:`, { resetLink });

    return NextResponse.json({
      success: true,
      message: `Password reset link sent to ${cleanEmail}`,
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
    });
  } catch (error) {
    console.error('Error sending password reset:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send reset link',
      },
      { status: 500 },
    );
  }
}

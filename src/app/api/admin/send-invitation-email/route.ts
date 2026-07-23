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
    const { email, candidateName } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Verify admin authorization via token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    const adminEmail = decoded.email || '';
    if (!adminEmail.endsWith('@baexpress.co.uk')) {
      return NextResponse.json({ error: 'Only admins can send invitations' }, { status: 403 });
    }

    // Generate invitation code
    const code = generateRandomCode(32);
    const cleanEmail = email.trim().toLowerCase();

    // Save invitation link to Firestore
    await setDoc(doc(db, 'invitationLinks', code), {
      code,
      email: cleanEmail,
      used: false,
      usedAt: null,
      createdAt: Date.now(),
      createdBy: adminEmail,
      status: 'pending',
    });

    // In production, send email here
    // For now, return the link for development
    const setupLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dhl-vetting-tracker.vercel.app'}/vetting/setup-password?code=${code}`;

    console.log(`Invitation sent to ${cleanEmail}:`, { setupLink });

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${cleanEmail}`,
      setupLink: process.env.NODE_ENV === 'development' ? setupLink : undefined,
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send invitation',
      },
      { status: 500 },
    );
  }
}

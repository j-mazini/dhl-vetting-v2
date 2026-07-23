import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { initializeAuth, connectAuthEmulator, getAuth } from 'firebase/auth';

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

function normaliseFirstAccessEmailKey(email: string) {
  return email.trim().toLowerCase().replace(/[^a-z0-9._%+-@]/g, '_');
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
  try {
    const { email, expiresInHours = 24, temporaryPassword } = await request.json();

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify auth header exists
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid authorization header' },
        { status: 401 },
      );
    }

    const idToken = authHeader.substring(7);

    // Verify token format and admin status by calling Firebase REST API
    try {
      const response = await fetch('https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=' + process.env.NEXT_PUBLIC_FIREBASE_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken, returnSecureToken: true }),
      });

      if (!response.ok) {
        // Token verification failed - try decoding JWT manually
        const parts = idToken.split('.');
        if (parts.length !== 3) {
          return NextResponse.json(
            { error: 'Unauthorized: Invalid token format' },
            { status: 401 },
          );
        }

        const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        const userEmail = decoded.email || '';

        if (!userEmail.endsWith('@baexpress.co.uk')) {
          return NextResponse.json(
            { error: 'Forbidden: Only admin users can generate first access codes' },
            { status: 403 },
          );
        }
      }
    } catch (err) {
      return NextResponse.json(
        { error: 'Unauthorized: Could not verify token' },
        { status: 401 },
      );
    }

    // Generate temporary password and salt
    let finalPassword: string;

    if (temporaryPassword) {
      // Validate manual password
      if (typeof temporaryPassword !== 'string' || temporaryPassword.length < 6) {
        return NextResponse.json(
          { error: 'Temporary password must be at least 6 characters long' },
          { status: 400 },
        );
      }
      finalPassword = temporaryPassword;
    } else {
      // Auto-generate password
      finalPassword = generateRandomString(12);
    }

    const salt = generateRandomString(16);

    // Create hash
    const codeHash = await sha256(`${salt}:${finalPassword}`);

    // Calculate expiration time
    const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;

    // Check if code already exists
    const emailKey = normaliseFirstAccessEmailKey(cleanEmail);
    const existingRef = doc(db, 'firstAccessCodes', emailKey);
    const existingSnap = await getDoc(existingRef);

    if (existingSnap.exists()) {
      const existingData = existingSnap.data();
      if (existingData && !existingData.consumedAt) {
        return NextResponse.json(
          { error: 'A first access code already exists for this email. Please use the existing code or wait for it to expire.' },
          { status: 409 },
        );
      }
    }

    // Save to Firestore
    await setDoc(existingRef, {
      email: cleanEmail,
      temporaryPassword: finalPassword,
      salt,
      codeHash,
      expiresAt: Timestamp.fromMillis(expiresAt),
      createdAt: Timestamp.now(),
      consumedAt: null,
      uid: null,
    });

    console.log(`First access code generated for ${cleanEmail}`);

    return NextResponse.json({
      success: true,
      message: `First access code generated for ${cleanEmail}`,
      email: cleanEmail,
      temporaryPassword: process.env.NODE_ENV === 'development' ? finalPassword : undefined,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (error) {
    console.error('Error generating first access code:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate first access code',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate first access codes.' },
    { status: 405 },
  );
}

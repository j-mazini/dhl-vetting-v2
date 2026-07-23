import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
initializeAdmin();

const db = getFirestore();
const auth = getAuth();

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
    const { email, expiresInHours = 24 } = await request.json();

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

    // Verify the token and check if user is admin
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (err) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 },
      );
    }

    // Check if user is admin (email ends with @baexpress.co.uk)
    const userEmail = decodedToken.email || '';
    if (!userEmail.endsWith('@baexpress.co.uk')) {
      return NextResponse.json(
        { error: 'Forbidden: Only admin users can generate first access codes' },
        { status: 403 },
      );
    }

    // Generate temporary password and salt
    const temporaryPassword = generateRandomString(12);
    const salt = generateRandomString(16);

    // Create hash
    const codeHash = await sha256(`${salt}:${temporaryPassword}`);

    // Calculate expiration time
    const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;

    // Check if code already exists
    const emailKey = normaliseFirstAccessEmailKey(cleanEmail);
    const existingRef = db.collection('firstAccessCodes').doc(emailKey);
    const existingSnap = await existingRef.get();

    if (existingSnap.exists) {
      const existingData = existingSnap.data();
      if (existingData && !existingData.consumedAt) {
        return NextResponse.json(
          { error: 'A first access code already exists for this email. Please use the existing code or wait for it to expire.' },
          { status: 409 },
        );
      }
    }

    // Save to Firestore
    await db.collection('firstAccessCodes').doc(emailKey).set({
      email: cleanEmail,
      temporaryPassword,
      salt,
      codeHash,
      expiresAt,
      createdAt: Date.now(),
      createdBy: userEmail,
      consumedAt: null,
      uid: null,
    });

    // In production, you would send an email here
    // For now, we'll log it and return the code (for development only)
    console.log(`First access code generated for ${cleanEmail}:`, {
      email: cleanEmail,
      temporaryPassword,
      expiresAt: new Date(expiresAt).toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `First access code generated for ${cleanEmail}`,
      email: cleanEmail,
      // Note: In production, don't return the temporary password here
      // It should only be sent via email
      temporaryPassword: process.env.NODE_ENV === 'development' ? temporaryPassword : undefined,
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

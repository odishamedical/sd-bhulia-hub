import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { email, password, uid, role, name, adminToken } = await req.json();

    // Verify admin privileges
    if (!adminToken) {
      return NextResponse.json({ error: 'Missing admin token' }, { status: 401 });
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(adminToken);
      const adminUser = await adminDb.collection('users').doc(decodedToken.uid).get();
      
      if (!adminUser.exists || (adminUser.data()?.role !== 'admin' && adminUser.data()?.role !== 'super_admin')) {
        return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
      }
    } catch (authError) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 });
    }

    if (!email || !password || !uid || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Attempt to create the user in Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        uid: uid,
        email: email,
        password: password,
        displayName: name || '',
      });
    } catch (e: any) {
      if (e.code === 'auth/uid-already-exists') {
        // If the UID already exists (e.g. they registered via email earlier), we just update their password.
        userRecord = await adminAuth.updateUser(uid, {
          password: password,
          email: email
        });
      } else if (e.code === 'auth/email-already-exists') {
         return NextResponse.json({ error: 'Email already exists for another user.' }, { status: 400 });
      } else {
        throw e;
      }
    }

    // Set custom claims (optional but good practice)
    await adminAuth.setCustomUserClaims(uid, { role: role });

    // Ensure the users collection has the basic auth record linking to the ecosystem
    await adminDb.collection('users').doc(uid).set({
      email: email,
      role: role,
      name: name || '',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true, uid: userRecord.uid });

  } catch (error: any) {
    console.error('Error in create-vendor:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

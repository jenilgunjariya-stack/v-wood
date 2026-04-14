import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle the private key newline characters correctly
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const db = admin.firestore();

export async function GET() {
  try {
    const ordersSnapshot = await db.collection('orders')
      .orderBy('createdAt', 'desc')
      .get();

    const orders = ordersSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id // Ensure we use the Firestore document ID if needed
    }));

    return NextResponse.json(orders, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const batch = db.batch();
    const ordersCollection = db.collection('orders');

    let count = 0;
    if (Array.isArray(data)) {
      // Handle array of orders
      for (const order of data) {
        // Use order.id if it exists, otherwise Firestore generates one
        const docRef = order.id ? ordersCollection.doc(order.id) : ordersCollection.doc();
        batch.set(docRef, {
          ...order,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          // Ensure createdAt is a timestamp if it's new
          createdAt: order.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        count++;
      }
      await batch.commit();
    } else {
      // Handle single order
      const docRef = data.id ? ordersCollection.doc(data.id) : ordersCollection.doc();
      await docRef.set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      count = 1;
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save orders' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/user/balance - Get user's cash balance
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { db } = await connectToDatabase();
    const userId = session.user.id;
    
    // Get user from database
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { balance: 1 } }
    );
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return the user's balance
    return NextResponse.json({ balance: user.balance || 0 });
  } catch (error) {
    console.error('Error fetching user balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user balance' },
      { status: 500 }
    );
  }
}

// PUT /api/user/balance - Update user's cash balance
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin authorization required' },
        { status: 401 }
      );
    }
    
    const { userId, balance } = await request.json();
    
    if (!userId || balance === undefined || balance === null) {
      return NextResponse.json(
        { error: 'User ID and balance are required' },
        { status: 400 }
      );
    }
    
    // Validate balance is a positive number
    const numBalance = Number(balance);
    if (isNaN(numBalance) || numBalance < 0) {
      return NextResponse.json(
        { error: 'Balance must be a positive number' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Update user's balance
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { balance: numBalance } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Balance updated successfully' 
    });
  } catch (error) {
    console.error('Error updating user balance:', error);
    return NextResponse.json(
      { error: 'Failed to update user balance' },
      { status: 500 }
    );
  }
}
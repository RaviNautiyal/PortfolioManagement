import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/users - Retrieve all users (admin only)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges required.' },
        { status: 403 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Get all users without exposing sensitive information
    const users = await db.collection('users')
      .find({})
      .project({
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        balance: 1,
        createdAt: 1
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 
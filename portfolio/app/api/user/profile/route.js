import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET /api/user/profile - Get user profile
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    // Mock user data for demo purposes
    // In a real app, you would fetch this from a database
    const mockUser = {
      id: session.user?.id || 'user123',
      name: session.user?.name || 'Demo User',
      email: session.user?.email || 'user@example.com',
      image: session.user?.image || 'https://via.placeholder.com/150',
      cash: 100000.00, // $100,000 initial cash balance
      role: session.user?.role || 'user',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    };
    
    return NextResponse.json({
      success: true,
      user: mockUser
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile - Update user profile
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    const userData = await request.json();
    
    // Validate data - only allow updating certain fields
    // Don't allow changing crucial fields like 'id', 'role', 'cash', etc.
    const allowedFields = ['name', 'preferences'];
    const updateData = {};
    
    Object.keys(userData).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = userData[key];
      }
    });
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // In a real app, you would update the user's profile in the database
    // For this demo, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';

// Sample user data
const mockUser = {
  _id: 'user123',
  name: 'Demo User',
  email: 'demo@example.com',
  role: 'user',
  balance: 100000, // ₹1,00,000
  createdAt: new Date('2023-01-01').toISOString()
};

// GET /api/mock/user - Get current user
export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(mockUser);
}

// PUT /api/mock/user/balance - Update user balance
export async function PUT(request) {
  try {
    const { balance } = await request.json();
    
    if (balance === undefined || balance === null) {
      return NextResponse.json(
        { error: 'Balance is required' },
        { status: 400 }
      );
    }
    
    // Update mock user balance
    mockUser.balance = Number(balance);
    
    return NextResponse.json({
      success: true,
      message: 'Balance updated successfully',
      balance: mockUser.balance
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    return NextResponse.json(
      { error: 'Failed to update balance' },
      { status: 500 }
    );
  }
} 
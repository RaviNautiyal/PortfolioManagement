import { NextResponse } from 'next/server';

// GET /api/mock/user/profile - Get user profile data
export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Sample user data with $100,000 balance
  const userData = {
    _id: 'mock-user-123',
    name: 'Demo User',
    email: 'demo@example.com',
    balance: 100000,
    role: 'user',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  };

  return NextResponse.json(userData);
} 
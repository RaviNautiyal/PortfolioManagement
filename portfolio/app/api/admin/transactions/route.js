import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/transactions - Retrieve all transactions (admin only)
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
    
    // Get all transactions with user and stock details
    const transactions = await db.collection('transactions')
      .aggregate([
        { $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $lookup: {
            from: 'stocks',
            localField: 'stockId',
            foreignField: '_id',
            as: 'stock'
          }
        },
        { $unwind: '$stock' },
        { $project: {
          _id: 1,
          userId: 1,
          stockId: 1,
          type: 1,
          quantity: 1,
          price: 1,
          value: 1,
          date: 1,
          userName: '$user.name',
          userEmail: '$user.email',
          symbol: '$stock.symbol',
          stockName: '$stock.name'
        }},
        { $sort: { date: -1 } }
      ])
      .toArray();
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { nifty50Stocks } from '@/app/data/nifty50';

// GET /api/holdings - Get user holdings
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    // Mock holdings for demo purposes
    // In a real app, you would fetch this from a database based on the user
    const mockHoldings = [
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd.',
        quantity: 3,
        averagePrice: 2810.25,
        currentPrice: nifty50Stocks.find(s => s.symbol === 'RELIANCE')?.currentPrice || 2805.25,
        sector: 'Energy',
      },
      {
        symbol: 'TCS',
        name: 'Tata Consultancy Services Ltd.',
        quantity: 2,
        averagePrice: 3740.50,
        currentPrice: nifty50Stocks.find(s => s.symbol === 'TCS')?.currentPrice || 3745.90,
        sector: 'Information Technology',
      },
      {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Ltd.',
        quantity: 5,
        averagePrice: 1640.75,
        currentPrice: nifty50Stocks.find(s => s.symbol === 'HDFCBANK')?.currentPrice || 1645.30,
        sector: 'Financial Services',
      }
    ];
    
    // Calculate current values, gains, etc.
    const holdings = mockHoldings.map(holding => {
      const totalCost = holding.quantity * holding.averagePrice;
      const currentValue = holding.quantity * holding.currentPrice;
      const gain = currentValue - totalCost;
      const gainPercentage = (gain / totalCost) * 100;
      
      return {
        ...holding,
        totalCost,
        currentValue,
        gain,
        gainPercentage
      };
    });
    
    const totalPortfolioValue = holdings.reduce((total, holding) => total + holding.currentValue, 0);
    
    return NextResponse.json({
      success: true,
      holdings,
      summary: {
        totalHoldings: holdings.length,
        totalValue: totalPortfolioValue,
        valueBySecctor: holdings.reduce((acc, holding) => {
          if (!acc[holding.sector]) {
            acc[holding.sector] = 0;
          }
          acc[holding.sector] += holding.currentValue;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holdings' },
      { status: 500 }
    );
  }
}

// POST /api/holdings - Create or update a holding (typically used internally)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { stockId, quantity } = body;
    
    // Validation
    if (!stockId || !quantity) {
      return NextResponse.json(
        { error: 'Stock ID and quantity are required' },
        { status: 400 }
      );
    }
    
    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Get the stock
    const stock = await db.collection('stocks').findOne({ _id: new ObjectId(stockId) });
    
    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }
    
    // Check if holding exists
    const userId = session.user.id;
    const existingHolding = await db.collection('holdings').findOne({
      userId: new ObjectId(userId),
      stockId: new ObjectId(stockId)
    });
    
    let result;
    
    if (existingHolding) {
      // Update existing holding
      result = await db.collection('holdings').updateOne(
        { _id: existingHolding._id },
        { 
          $set: { 
            quantity: quantity,
            updatedAt: new Date()
          } 
        }
      );
    } else {
      // Create new holding
      result = await db.collection('holdings').insertOne({
        userId: new ObjectId(userId),
        stockId: new ObjectId(stockId),
        symbol: stock.symbol,
        quantity: quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return NextResponse.json({
      success: true,
      message: existingHolding ? 'Holding updated' : 'Holding created',
      holdingId: existingHolding ? existingHolding._id : result.insertedId
    });
  } catch (error) {
    console.error('Error creating/updating holding:', error);
    return NextResponse.json(
      { error: 'Failed to create/update holding' },
      { status: 500 }
    );
  }
} 
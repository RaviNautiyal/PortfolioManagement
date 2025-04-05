import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/portfolio/holdings - Get user's stock holdings
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
    
    // Get user's holdings with stock details
    const rawHoldings = await db.collection('holdings')
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        { $lookup: {
            from: 'stocks',
            localField: 'stockId',
            foreignField: '_id',
            as: 'stock'
          }
        },
        { $unwind: '$stock' }
      ])
      .toArray();
    
    // Get transactions to calculate average buy price
    const transactions = await db.collection('transactions')
      .find({ userId: new ObjectId(userId) })
      .toArray();
    
    // Process holdings to include calculated fields
    const holdings = rawHoldings.map(holding => {
      const { _id, quantity, stockId } = holding;
      const { _id: _, ...stock } = holding.stock;
      
      // Calculate average buy price
      let totalCost = 0;
      let totalShares = 0;
      
      transactions.forEach(transaction => {
        if (transaction.stockId.toString() === stockId.toString() && transaction.type === 'buy') {
          totalCost += transaction.price * transaction.quantity;
          totalShares += transaction.quantity;
        }
      });
      
      const avgPrice = totalShares > 0 ? totalCost / totalShares : stock.currentPrice;
      
      // Calculate current value and unrealized gain/loss
      const currentPrice = stock.currentPrice;
      const currentValue = quantity * currentPrice;
      const investmentValue = quantity * avgPrice;
      const unrealizedGain = currentValue - investmentValue;
      const unrealizedGainPercent = investmentValue > 0 
        ? (unrealizedGain / investmentValue) * 100 
        : 0;
      
      // Calculate today's change
      const previousClose = stock.previousClose || currentPrice;
      const changeAmount = (currentPrice - previousClose) * quantity;
      const changePercent = previousClose > 0 
        ? ((currentPrice - previousClose) / previousClose) * 100 
        : 0;
      
      return {
        _id,
        stockId,
        symbol: stock.symbol,
        name: stock.name,
        quantity,
        avgPrice,
        currentPrice,
        previousClose,
        currentValue,
        investmentValue,
        unrealizedGain,
        unrealizedGainPercent,
        changeAmount,
        changePercent,
        sector: stock.sector,
        lastUpdated: new Date()
      };
    });
    
    // Sort by current value (descending)
    holdings.sort((a, b) => b.currentValue - a.currentValue);
    
    return NextResponse.json(holdings);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holdings' },
      { status: 500 }
    );
  }
} 
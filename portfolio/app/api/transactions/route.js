import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getStockBySymbol } from '@/app/data/nifty50';

// GET /api/transactions - Get user transactions
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    // In a real app, you would fetch transactions from a database
    // For this demo, we'll return an empty array or mock data
    
    // Mock transaction history for demo purposes
    const mockTransactions = [
      {
        id: 'tr1',
        symbol: 'RELIANCE',
        type: 'buy',
        quantity: 5,
        price: 2810.25,
        total: 14051.25,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tr2',
        symbol: 'TCS',
        type: 'buy',
        quantity: 2,
        price: 3740.50,
        total: 7481.00,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tr3',
        symbol: 'RELIANCE',
        type: 'sell',
        quantity: 2,
        price: 2850.75,
        total: 5701.50,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    
    return NextResponse.json({
      success: true,
      transactions: mockTransactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    const transactionData = await request.json();
    
    // Validate required fields
    if (!transactionData.symbol || !transactionData.quantity || !transactionData.type) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, quantity, and type are required' },
        { status: 400 }
      );
    }
    
    // Validate transaction type
    if (!['buy', 'sell'].includes(transactionData.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid transaction type. Must be "buy" or "sell"' },
        { status: 400 }
      );
    }
    
    // Validate quantity
    const quantity = Number(transactionData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }
    
    // Get stock data to verify it exists and to get the current price if not provided
    const stockData = getStockBySymbol(transactionData.symbol);
    if (!stockData) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }
    
    // Use provided price or current stock price
    const price = transactionData.price || stockData.currentPrice;
    const total = price * quantity;
    
    // In a real app, you would:
    // 1. Check if user has enough funds (for buy) or enough shares (for sell)
    // 2. Update user's cash balance
    // 3. Update user's holdings
    // 4. Save the transaction to the database
    
    // For this demo, we'll just return success
    return NextResponse.json({
      success: true,
      transaction: {
        id: `tr${Date.now()}`,
        symbol: transactionData.symbol,
        type: transactionData.type,
        quantity,
        price,
        total,
        date: new Date().toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
} 
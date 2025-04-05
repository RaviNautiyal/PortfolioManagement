import { NextResponse } from 'next/server';

// Sample data
const mockTransactions = Array.from({ length: 10 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  
  const type = i % 2 === 0 ? 'buy' : 'sell';
  const price = 1000 + Math.random() * 2000;
  const quantity = Math.ceil(Math.random() * 20);
  
  // Generate stock data
  const stockIndex = i % 3;
  const stocks = [
    { id: 'stock-1', symbol: 'AAPL', name: 'Apple Inc.' },
    { id: 'stock-2', symbol: 'MSFT', name: 'Microsoft Corporation' },
    { id: 'stock-3', symbol: 'JPM', name: 'JPMorgan Chase & Co.' }
  ];
  
  return {
    _id: `trans-${i}`,
    userId: 'user123',
    stockId: stocks[stockIndex].id,
    symbol: stocks[stockIndex].symbol,
    stockName: stocks[stockIndex].name,
    type,
    quantity,
    price,
    total: price * quantity,
    date: date.toISOString(),
    createdAt: date.toISOString()
  };
});

// GET /api/mock/transactions - Get user's transactions
export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(mockTransactions);
}

// POST /api/mock/transactions - Create a new transaction
export async function POST(request) {
  try {
    const { stockId, type, quantity, price } = await request.json();
    
    // Validate required fields
    if (!stockId || !type || !quantity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create a new mock transaction
    const newTransaction = {
      _id: `trans-${Date.now()}`,
      userId: 'user123',
      stockId,
      symbol: 'AAPL',
      stockName: 'Apple Inc.',
      type,
      quantity: Number(quantity),
      price: Number(price),
      total: Number(price) * Number(quantity),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      message: 'Transaction completed successfully',
      transaction: newTransaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 
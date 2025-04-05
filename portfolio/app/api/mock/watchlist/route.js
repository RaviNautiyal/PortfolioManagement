import { NextResponse } from 'next/server';

// Sample data
const mockWatchlist = [
  {
    _id: 'mock-watch-1',
    stockId: 'mock-stock-1',
    userId: 'user123',
    createdAt: new Date().toISOString(),
    stock: {
      _id: 'mock-stock-1',
      symbol: 'AMZN',
      name: 'Amazon.com, Inc.',
      currentPrice: 3500,
      change: 25,
      changePercent: 0.7,
      sector: 'Technology'
    }
  },
  {
    _id: 'mock-watch-2',
    stockId: 'mock-stock-2',
    userId: 'user123',
    createdAt: new Date().toISOString(),
    stock: {
      _id: 'mock-stock-2',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      currentPrice: 2800,
      change: -15,
      changePercent: -0.4,
      sector: 'Technology'
    }
  },
  {
    _id: 'mock-watch-3',
    stockId: 'mock-stock-3',
    userId: 'user123',
    createdAt: new Date().toISOString(),
    stock: {
      _id: 'mock-stock-3',
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      currentPrice: 750,
      change: 10,
      changePercent: 0.6,
      sector: 'Automotive'
    }
  }
];

// GET /api/mock/watchlist - Get user's watchlist
export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(mockWatchlist);
}

// POST /api/mock/watchlist - Add stock to watchlist
export async function POST(request) {
  try {
    const { stockId } = await request.json();
    
    if (!stockId) {
      return NextResponse.json({ error: 'Stock ID is required' }, { status: 400 });
    }
    
    // Create a new mock watchlist item
    const newItem = {
      _id: `mock-watch-${Date.now()}`,
      stockId,
      userId: 'user123',
      createdAt: new Date().toISOString(),
      stock: {
        _id: stockId,
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        currentPrice: 500,
        change: 5,
        changePercent: 0.5,
        sector: 'Technology'
      }
    };
    
    return NextResponse.json({ 
      success: true, 
      message: 'Stock added to watchlist',
      item: newItem
    });
    
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to add stock to watchlist' },
      { status: 500 }
    );
  }
} 
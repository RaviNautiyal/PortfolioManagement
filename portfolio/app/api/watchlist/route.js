import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { nifty50Stocks } from '@/app/data/nifty50';

// GET /api/watchlist - Get user's watchlist
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    // Mock watchlist data for demo purposes
    // In a real app, you would fetch this from a database based on the user
    const mockWatchlist = [
      'RELIANCE',
      'TCS',
      'HDFCBANK',
      'INFY',
      'ICICIBANK'
    ];
    
    // Get detailed stock information for each symbol in the watchlist
    const watchlistStocks = mockWatchlist.map(symbol => {
      const stock = nifty50Stocks.find(s => s.symbol === symbol);
      return stock ? { ...stock } : null;
    }).filter(Boolean); // Remove any nulls (symbols not found)
    
    return NextResponse.json({
      success: true,
      watchlist: watchlistStocks
    });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

// POST /api/watchlist - Add stock to watchlist
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    const { symbol } = await request.json();
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }
    
    // Check if the stock exists
    const stock = nifty50Stocks.find(s => s.symbol === symbol);
    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }
    
    // In a real app, you would add the stock to the user's watchlist in the database
    // For this demo, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: `${symbol} added to watchlist`
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to add stock to watchlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/watchlist - Remove stock from watchlist
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }
    
    // In a real app, you would remove the stock from the user's watchlist in the database
    // For this demo, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: `${symbol} removed from watchlist`
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove stock from watchlist' },
      { status: 500 }
    );
  }
} 
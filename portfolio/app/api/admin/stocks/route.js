import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { nifty50Stocks } from '@/app/data/nifty50';

// GET /api/admin/stocks
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector');
    const search = searchParams.get('search');
    
    // Filter stocks based on query parameters
    let filteredStocks = [...nifty50Stocks];
    
    if (sector) {
      filteredStocks = filteredStocks.filter(stock => 
        stock.sector.toLowerCase() === sector.toLowerCase()
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStocks = filteredStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchLower) || 
        stock.name.toLowerCase().includes(searchLower)
      );
    }
    
    return NextResponse.json({
      success: true,
      stocks: filteredStocks
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocks data' },
      { status: 500 }
    );
  }
}

// POST /api/admin/stocks - Add a new stock
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    const stockData = await request.json();
    
    // Basic validation
    if (!stockData.symbol || !stockData.name || !stockData.sector || !stockData.currentPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if stock already exists (in a real app, this would interact with a database)
    const stockExists = nifty50Stocks.some(stock => stock.symbol === stockData.symbol);
    if (stockExists) {
      return NextResponse.json(
        { error: 'Stock with this symbol already exists' },
        { status: 409 }
      );
    }
    
    // In a real app, this would save to a database
    // For this demo, we'll just return success (since we're using static data)
    
    return NextResponse.json({
      success: true,
      message: 'Stock added successfully',
      stock: stockData
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding stock:', error);
    return NextResponse.json(
      { error: 'Failed to add stock' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/stocks/:symbol - Update a stock
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    const stockData = await request.json();
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }
    
    // Check if stock exists
    const stockIndex = nifty50Stocks.findIndex(stock => stock.symbol === symbol);
    if (stockIndex === -1) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }
    
    // In a real app, this would update the database
    // For this demo, we'll just return success (since we're using static data)
    
    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
      stock: { ...nifty50Stocks[stockIndex], ...stockData }
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/stocks/:symbol - Delete a stock
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
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
    
    // Check if stock exists
    const stockExists = nifty50Stocks.some(stock => stock.symbol === symbol);
    if (!stockExists) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }
    
    // In a real app, this would delete from the database
    // For this demo, we'll just return success (since we're using static data)
    
    return NextResponse.json({
      success: true,
      message: 'Stock deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stock:', error);
    return NextResponse.json(
      { error: 'Failed to delete stock' },
      { status: 500 }
    );
  }
} 
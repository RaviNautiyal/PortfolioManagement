import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { nifty50Stocks, sectors } from '@/app/data/nifty50';

// GET /api/stocks
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '0');
    const sortBy = searchParams.get('sortBy') || 'symbol';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
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
    
    // Sort stocks
    filteredStocks.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      // Handle string comparison
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    // Apply limit if specified
    if (limit > 0) {
      filteredStocks = filteredStocks.slice(0, limit);
    }
    
    return NextResponse.json({
      success: true,
      count: filteredStocks.length,
      stocks: filteredStocks,
      sectors: sectors
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocks data' },
      { status: 500 }
    );
  }
}

// POST /api/stocks - Create a new stock
export async function POST(request) {
  try {
    const body = await request.json();
    
    const { 
      symbol, 
      name, 
      currentPrice,
      open,
      previousClose,
      volume,
      dayLow,
      dayHigh,
      low52Week,
      high52Week,
      marketCap,
      beta,
      peRatio,
      eps,
      dividendYield,
      sector,
      industry,
      description,
      country
    } = body;
    
    // Validation
    if (!symbol || !name || !currentPrice) {
      return NextResponse.json(
        { error: 'Symbol, name, and currentPrice are required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if stock already exists
    const existingStock = await db.collection('stocks').findOne({ symbol });
    if (existingStock) {
      return NextResponse.json(
        { error: `Stock with symbol ${symbol} already exists` },
        { status: 400 }
      );
    }
    
    // Create new stock with sample price history
    const today = new Date();
    
    // Generate 30 days of sample price history
    const priceHistory = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Add some random variation to create a realistic price history
      const randomFactor = 0.98 + Math.random() * 0.04; // Between 0.98 and 1.02
      const price = currentPrice * Math.pow(randomFactor, i);
      
      priceHistory.push({
        date: date,
        price: parseFloat(price.toFixed(2))
      });
    }
    
    const newStock = {
      symbol,
      name,
      currentPrice,
      open: open || currentPrice * (0.98 + Math.random() * 0.04),
      previousClose: previousClose || currentPrice * (0.97 + Math.random() * 0.06),
      volume: volume || Math.floor(Math.random() * 10000000),
      avgVolume: Math.floor(Math.random() * 15000000),
      dayLow: dayLow || currentPrice * 0.98,
      dayHigh: dayHigh || currentPrice * 1.02,
      low52Week: low52Week || currentPrice * 0.8,
      high52Week: high52Week || currentPrice * 1.2,
      marketCap: marketCap || currentPrice * Math.floor(Math.random() * 1000000000),
      beta: beta || (0.5 + Math.random() * 1.5).toFixed(2),
      peRatio: peRatio || (10 + Math.random() * 25).toFixed(2),
      eps: eps || (currentPrice / (10 + Math.random() * 25)).toFixed(2),
      dividendYield: dividendYield || (Math.random() * 3).toFixed(2),
      sector: sector || 'Technology',
      industry: industry || 'Software',
      description: description || `${name} (${symbol}) is a publicly traded company.`,
      country: country || 'United States',
      priceHistory: priceHistory,
      // Add financial metrics
      revenue: Math.floor(Math.random() * 50000000000),
      revenueGrowth: (Math.random() * 30).toFixed(2),
      netIncome: Math.floor(Math.random() * 10000000000),
      netIncomeGrowth: (Math.random() * 25).toFixed(2),
      profitMargin: (Math.random() * 30).toFixed(2),
      profitMarginGrowth: (Math.random() * 10 - 2).toFixed(2),
      createdAt: new Date()
    };
    
    const result = await db.collection('stocks').insertOne(newStock);
    
    return NextResponse.json({
      success: true,
      message: 'Stock created successfully',
      stockId: result.insertedId,
      stock: newStock
    });
  } catch (error) {
    console.error('Error creating stock:', error);
    return NextResponse.json(
      { error: 'Failed to create stock' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getStockBySymbol, getStockHistoricalData } from '@/app/data/nifty50';

// GET /api/stock/[symbol]
export async function GET(request, { params }) {
  try {
    const { symbol } = params;
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }
    
    // Get stock data
    const stockData = getStockBySymbol(symbol.toUpperCase());
    
    if (!stockData) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }
    
    // Get historical data
    const historicalData = getStockHistoricalData(symbol.toUpperCase());
    
    // Prepare response with stock details and historical data
    const response = {
      success: true,
      stock: {
        ...stockData,
        historicalData
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error fetching stock data for ${params.symbol}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
} 
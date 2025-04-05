import { NextResponse } from 'next/server';

// Sample data
const mockHoldings = [
  {
    _id: 'mock-holding-1',
    userId: 'user123',
    stockId: 'stock-1',
    quantity: 50,
    avgPrice: 2750,
    currentPrice: 2800,
    previousClose: 2780,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentValue: 140000,
    investmentValue: 137500,
    unrealizedGain: 2500,
    unrealizedGainPercent: 1.81,
    changeAmount: 1000,
    changePercent: 0.72,
    sector: 'Technology',
    stock: {
      _id: 'stock-1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      currentPrice: 2800,
      previousClose: 2780,
      change: 20,
      changePercent: 0.72,
      sector: 'Technology',
    }
  },
  {
    _id: 'mock-holding-2',
    userId: 'user123',
    stockId: 'stock-2',
    quantity: 25,
    avgPrice: 3600,
    currentPrice: 3450,
    previousClose: 3500,
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    currentValue: 86250,
    investmentValue: 90000,
    unrealizedGain: -3750,
    unrealizedGainPercent: -4.17,
    changeAmount: -1250,
    changePercent: -1.43,
    sector: 'Technology',
    stock: {
      _id: 'stock-2',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      currentPrice: 3450,
      previousClose: 3500,
      change: -50,
      changePercent: -1.43,
      sector: 'Technology',
    }
  },
  {
    _id: 'mock-holding-3',
    userId: 'user123',
    stockId: 'stock-3',
    quantity: 100,
    avgPrice: 1600,
    currentPrice: 1650,
    previousClose: 1640,
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    currentValue: 165000,
    investmentValue: 160000,
    unrealizedGain: 5000,
    unrealizedGainPercent: 3.13,
    changeAmount: 1000,
    changePercent: 0.61,
    sector: 'Financial Services',
    stock: {
      _id: 'stock-3',
      symbol: 'JPM',
      name: 'JPMorgan Chase & Co.',
      currentPrice: 1650,
      previousClose: 1640,
      change: 10,
      changePercent: 0.61,
      sector: 'Financial Services',
    }
  }
];

// GET /api/mock/holdings - Get user's stock holdings
export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(mockHoldings);
} 
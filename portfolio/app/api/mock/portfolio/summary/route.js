import { NextResponse } from 'next/server';

// GET /api/mock/portfolio/summary - Get portfolio summary
export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Generate mock portfolio history data (last 30 days)
  const today = new Date();
  const portfolioHistory = [];
  let baseValue = 450000; // Base portfolio value
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate random daily change (up to ±1.5%)
    const dailyChange = (Math.random() * 3 - 1.5) / 100;
    baseValue = baseValue * (1 + dailyChange);
    
    portfolioHistory.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(baseValue)
    });
  }
  
  // Calculate summary values
  const totalValue = portfolioHistory[portfolioHistory.length - 1].value;
  const totalInvestment = 400000; // Initial investment
  const cashBalance = 100000; // Available cash
  
  // Calculate today's change
  const yesterdayValue = portfolioHistory[portfolioHistory.length - 2].value;
  const todayChange = totalValue - yesterdayValue;
  const todayChangePercent = (todayChange / yesterdayValue) * 100;
  
  // Calculate overall return
  const totalReturn = totalValue - totalInvestment;
  const totalReturnPercentage = (totalReturn / totalInvestment) * 100;
  
  return NextResponse.json({
    totalValue,
    totalInvestment,
    cashBalance,
    todayChange,
    todayChangePercent,
    totalReturn,
    totalReturnPercentage,
    holdingsCount: 5,
    portfolioHistory
  });
} 
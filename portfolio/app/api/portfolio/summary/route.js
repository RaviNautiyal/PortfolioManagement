import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/portfolio/summary - Get portfolio summary with history
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    // In a real app, you would:
    // 1. Get the user's holdings
    // 2. Get current stock prices
    // 3. Calculate portfolio value
    // 4. Get historical portfolio values (based on transaction history)
    
    // Mock data for demo purposes
    const mockPortfolioSummary = {
      currentValue: 40023.15, // Current portfolio value (stocks only)
      cashBalance: 100000.00, // User's cash balance
      totalValue: 140023.15, // Total portfolio value (stocks + cash)
      totalGain: 3023.15, // Total gain from all positions
      totalGainPercentage: 8.16, // Total gain percentage
      dayGain: 415.75, // Gain for today
      dayGainPercentage: 1.05, // Percentage gain for today
      
      // Mock portfolio value history (last 30 days)
      history: generatePortfolioHistory(30, 140023.15)
    };
    
    return NextResponse.json({
      success: true,
      ...mockPortfolioSummary
    });
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio summary' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock portfolio history
function generatePortfolioHistory(days, currentValue) {
  const history = [];
  const today = new Date();
  
  // Start with current value and work backwards with random fluctuations
  let value = currentValue;
  
  for (let i = 0; i < days; i++) {
    // Create date for this data point
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add this point to history
    history.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(value.toFixed(2))
    });
    
    // Calculate previous day's value with some randomness (more volatile in the past)
    const changePercent = (Math.random() - 0.5) * 1.5; // -0.75% to +0.75%
    value = value / (1 + changePercent / 100);
  }
  
  // Reverse to get chronological order
  return history.reverse();
}

// Helper function to calculate portfolio history (for charts)
async function calculatePortfolioHistory(db, userId) {
  // This would ideally use actual portfolio snapshots stored daily
  // For now, let's create a simple simulation
  
  const days = 30; // Get 30 days of history
  const today = new Date();
  const history = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random fluctuation simulation (replace with actual calculation in production)
    // In a real app, you'd store daily portfolio values or recalculate from historical stock prices
    const randomFactor = 0.95 + (Math.random() * 0.1); // 0.95 to 1.05 random factor
    
    history.push({
      date: date.toISOString().split('T')[0],
      value: 100000 * randomFactor * (1 + (i / 100)) // Simulated growth over time
    });
  }
  
  return history;
}

// Helper function to calculate asset allocation
function calculateAssetAllocation(holdings) {
  const sectors = {};
  let total = 0;
  
  holdings.forEach(holding => {
    const sector = holding.stock.sector || 'Uncategorized';
    const value = holding.quantity * holding.stock.currentPrice;
    
    sectors[sector] = (sectors[sector] || 0) + value;
    total += value;
  });
  
  // Convert to percentage allocation
  const allocation = Object.entries(sectors).map(([sector, value]) => ({
    sector,
    value,
    percentage: (value / total) * 100
  }));
  
  // Sort by percentage (highest first)
  return allocation.sort((a, b) => b.percentage - a.percentage);
} 
// This file contains information about Nifty 50 stocks and sample historical price data
// Used for portfolio management application demo purposes

// Nifty 50 stocks list with basic information
export const nifty50Stocks = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    sector: 'Energy',
    marketCap: 1750000000000,
    currentPrice: 2805.25,
    previousClose: 2798.10,
    dayChange: 0.26,
    yearHigh: 3048.40,
    yearLow: 2220.75,
    pe: 21.8,
    eps: 128.57
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    sector: 'Information Technology',
    marketCap: 1360000000000,
    currentPrice: 3745.90,
    previousClose: 3738.15,
    dayChange: 0.21,
    yearHigh: 3990.00,
    yearLow: 3102.30,
    pe: 29.6,
    eps: 126.55
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    sector: 'Financial Services',
    marketCap: 1220000000000,
    currentPrice: 1645.30,
    previousClose: 1638.45,
    dayChange: 0.42,
    yearHigh: 1724.30,
    yearLow: 1445.20,
    pe: 24.1,
    eps: 68.31
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    sector: 'Information Technology',
    marketCap: 780000000000,
    currentPrice: 1875.60,
    previousClose: 1860.30,
    dayChange: 0.82,
    yearHigh: 1953.90,
    yearLow: 1360.55,
    pe: 27.4,
    eps: 68.42
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    sector: 'Financial Services',
    marketCap: 730000000000,
    currentPrice: 1050.25,
    previousClose: 1045.85,
    dayChange: 0.42,
    yearHigh: 1122.65,
    yearLow: 842.30,
    pe: 22.8,
    eps: 46.06
  },
  {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Ltd.',
    sector: 'Consumer Goods',
    marketCap: 640000000000,
    currentPrice: 2720.15,
    previousClose: 2728.60,
    dayChange: -0.31,
    yearHigh: 2870.00,
    yearLow: 2420.15,
    pe: 62.5,
    eps: 43.52
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    sector: 'Financial Services',
    marketCap: 580000000000,
    currentPrice: 650.30,
    previousClose: 647.15,
    dayChange: 0.49,
    yearHigh: 710.45,
    yearLow: 520.80,
    pe: 12.1,
    eps: 53.74
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Ltd.',
    sector: 'Financial Services',
    marketCap: 560000000000,
    currentPrice: 7430.55,
    previousClose: 7405.20,
    dayChange: 0.34,
    yearHigh: 8190.00,
    yearLow: 5875.65,
    pe: 39.8,
    eps: 186.65
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    sector: 'Telecommunications',
    marketCap: 540000000000,
    currentPrice: 955.70,
    previousClose: 948.25,
    dayChange: 0.79,
    yearHigh: 975.00,
    yearLow: 745.50,
    pe: 76.3,
    eps: 12.53
  },
  {
    symbol: 'KOTAKBANK',
    name: 'Kotak Mahindra Bank Ltd.',
    sector: 'Financial Services',
    marketCap: 430000000000,
    currentPrice: 2175.40,
    previousClose: 2168.65,
    dayChange: 0.31,
    yearHigh: 2252.50,
    yearLow: 1795.25,
    pe: 30.5,
    eps: 71.33
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd.',
    sector: 'Consumer Goods',
    marketCap: 420000000000,
    currentPrice: 338.20,
    previousClose: 339.45,
    dayChange: -0.37,
    yearHigh: 499.60,
    yearLow: 326.90,
    pe: 25.6,
    eps: 13.21
  },
  {
    symbol: 'HCLTECH',
    name: 'HCL Technologies Ltd.',
    sector: 'Information Technology',
    marketCap: 360000000000,
    currentPrice: 1325.85,
    previousClose: 1318.50,
    dayChange: 0.56,
    yearHigh: 1380.00,
    yearLow: 1070.30,
    pe: 21.3,
    eps: 62.24
  },
  {
    symbol: 'ASIANPAINT',
    name: 'Asian Paints Ltd.',
    sector: 'Consumer Goods',
    marketCap: 340000000000,
    currentPrice: 3540.15,
    previousClose: 3554.90,
    dayChange: -0.42,
    yearHigh: 3708.00,
    yearLow: 2880.35,
    pe: 75.2,
    eps: 47.08
  },
  {
    symbol: 'AXISBANK',
    name: 'Axis Bank Ltd.',
    sector: 'Financial Services',
    marketCap: 310000000000,
    currentPrice: 1015.45,
    previousClose: 1011.30,
    dayChange: 0.41,
    yearHigh: 1065.60,
    yearLow: 840.50,
    pe: 18.7,
    eps: 54.30
  },
  {
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Ltd.',
    sector: 'Automobile',
    marketCap: 300000000000,
    currentPrice: 10240.75,
    previousClose: 10168.30,
    dayChange: 0.71,
    yearHigh: 11600.00,
    yearLow: 8652.25,
    pe: 33.6,
    eps: 304.78
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    sector: 'Automobile',
    marketCap: 290000000000,
    currentPrice: 880.20,
    previousClose: 872.45,
    dayChange: 0.89,
    yearHigh: 949.80,
    yearLow: 545.30,
    pe: 9.8,
    eps: 89.82
  },
  {
    symbol: 'WIPRO',
    name: 'Wipro Ltd.',
    sector: 'Information Technology',
    marketCap: 280000000000,
    currentPrice: 515.60,
    previousClose: 510.25,
    dayChange: 1.05,
    yearHigh: 535.00,
    yearLow: 385.40,
    pe: 21.2,
    eps: 24.32
  },
  {
    symbol: 'ULTRACEMCO',
    name: 'UltraTech Cement Ltd.',
    sector: 'Construction Materials',
    marketCap: 270000000000,
    currentPrice: 9350.20,
    previousClose: 9312.65,
    dayChange: 0.40,
    yearHigh: 9750.00,
    yearLow: 7910.30,
    pe: 44.5,
    eps: 210.12
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries Ltd.',
    sector: 'Healthcare',
    marketCap: 260000000000,
    currentPrice: 1080.55,
    previousClose: 1076.30,
    dayChange: 0.40,
    yearHigh: 1170.60,
    yearLow: 920.45,
    pe: 30.6,
    eps: 35.31
  },
  {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Ltd.',
    sector: 'Metals',
    marketCap: 250000000000,
    currentPrice: 204.75,
    previousClose: 203.10,
    dayChange: 0.81,
    yearHigh: 230.00,
    yearLow: 112.45,
    pe: 6.8,
    eps: 30.11
  },
  // More stocks data can be added here
];

// Helper function to generate historical price data for the past 250 trading days
function generateHistoricalData(basePrice, volatility = 0.02) {
  const today = new Date();
  const data = [];
  
  let currentPrice = basePrice;
  
  for (let i = 250; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }
    
    // Random price movement (normal distribution approximation)
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    
    // Calculate OHLC
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = Math.floor(Math.random() * 10000000) + 1000000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });
    
    currentPrice = close;
  }
  
  return data;
}

// Generate and export historical data for each stock
export const stocksHistoricalData = nifty50Stocks.reduce((acc, stock) => {
  acc[stock.symbol] = generateHistoricalData(stock.currentPrice, 0.015);
  return acc;
}, {});

// Industry sectors in Nifty 50
export const sectors = [
  'Financial Services',
  'Information Technology',
  'Energy',
  'Consumer Goods',
  'Automobile',
  'Healthcare', 
  'Metals',
  'Telecommunications',
  'Construction Materials',
  'Oil & Gas',
  'Cement',
  'Pharmaceuticals',
  'Power',
  'FMCG'
];

// Function to get stocks by sector
export function getStocksBySector(sectorName) {
  return nifty50Stocks.filter(stock => stock.sector === sectorName);
}

// Function to get stock by symbol
export function getStockBySymbol(symbol) {
  return nifty50Stocks.find(stock => stock.symbol === symbol);
}

// Function to get historical data for a stock
export function getStockHistoricalData(symbol) {
  return stocksHistoricalData[symbol] || [];
}

// Export default object with all data and functions
export default {
  nifty50Stocks,
  stocksHistoricalData,
  sectors,
  getStocksBySector,
  getStockBySymbol,
  getStockHistoricalData
}; 
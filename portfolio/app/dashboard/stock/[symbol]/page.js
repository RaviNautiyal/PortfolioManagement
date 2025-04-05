'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  PlusIcon,
  ClockIcon,
  TrendingUpIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  ShoppingCartIcon
} from '@heroicons/react/outline';

export default function StockDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stock, setStock] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [timeRange, setTimeRange] = useState('1M'); // 1W, 1M, 3M, 1Y, ALL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [buyingPower, setBuyingPower] = useState(0);

  // Fetch stock data
  useEffect(() => {
    async function fetchStockData() {
      try {
        setLoading(true);
        setError(null);
        
        if (!params.symbol) {
          router.push('/dashboard');
          return;
        }
        
        const response = await fetch(`/api/stock/${params.symbol}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        
        const data = await response.json();
        
        if (!data.success || !data.stock) {
          throw new Error(data.error || 'Stock not found');
        }
        
        setStock(data.stock);
        setHistoricalData(data.stock.historicalData || []);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data. Please try again later.');
        
        // Fallback to static data
        import('@/app/data/nifty50').then((module) => {
          const stockData = module.getStockBySymbol(params.symbol);
          const histData = module.getStockHistoricalData(params.symbol);
          
          if (stockData) {
            setStock(stockData);
            setHistoricalData(histData || []);
          } else {
            setError('Stock not found');
          }
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchStockData();
  }, [params.symbol, router]);

  // Fetch user data for buying power
  useEffect(() => {
    async function fetchUserData() {
      if (status !== 'authenticated') return;
      
      try {
        const response = await fetch('/api/user/profile');
        
        if (response.ok) {
          const data = await response.json();
          setBuyingPower(data.user?.cash || 0);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Fallback to demo balance
        setBuyingPower(100000);
      }
    }
    
    fetchUserData();
  }, [status]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy');
  };

  const getFilteredData = () => {
    if (!historicalData || historicalData.length === 0) {
      return [];
    }
    
    const now = new Date();
    let startDate;
    
    switch(timeRange) {
      case '1W':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1M':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3M':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '1Y':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default: // ALL
        return historicalData;
    }
    
    return historicalData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  };

  const handleBuyStock = async (e) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (!stock || quantity <= 0) {
      return;
    }
    
    try {
      const totalCost = stock.currentPrice * quantity;
      
      if (totalCost > buyingPower) {
        alert('Insufficient funds to complete this purchase.');
        return;
      }
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          price: stock.currentPrice,
          quantity,
          type: 'buy',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process transaction');
      }
      
      alert(`Successfully purchased ${quantity} shares of ${stock.symbol}`);
      setBuyModalOpen(false);
      setQuantity(1);
    } catch (err) {
      console.error('Error buying stock:', err);
      alert('Failed to complete transaction. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-400 border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="p-6 bg-red-100 border border-red-300 rounded-md">
          <h2 className="mb-2 text-xl font-bold text-red-700">Error</h2>
          <p className="text-red-700">{error || 'Stock not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const firstPrice = filteredData[0]?.close || 0;
  const lastPrice = filteredData[filteredData.length - 1]?.close || stock.currentPrice;
  const priceChange = lastPrice - firstPrice;
  const percentChange = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPositiveChange = priceChange >= 0;

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Left column - Stock info */}
        <div className="w-full md:w-1/3">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{stock.symbol}</h1>
                <p className="text-gray-600">{stock.name}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold">₹{stock.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className={`flex items-center ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositiveChange ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
                  <span>{priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setBuyModalOpen(true)}
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-center">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  <span>Buy Stock</span>
                </div>
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  <span>Previous Close</span>
                </div>
                <div className="font-medium">₹{stock.previousClose.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center text-gray-600">
                  <TrendingUpIcon className="w-5 h-5 mr-2" />
                  <span>Day Change</span>
                </div>
                <div className={`font-medium ${stock.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.dayChange >= 0 ? '+' : ''}{stock.dayChange}%
                </div>
              </div>
              
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center text-gray-600">
                  <CurrencyRupeeIcon className="w-5 h-5 mr-2" />
                  <span>Market Cap</span>
                </div>
                <div className="font-medium">₹{(stock.marketCap / 10000000).toFixed(2)} Cr</div>
              </div>
              
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center text-gray-600">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  <span>Sector</span>
                </div>
                <div className="font-medium">{stock.sector}</div>
              </div>
              
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <div className="text-gray-600">52W High</div>
                <div className="font-medium">₹{stock.yearHigh.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <div className="text-gray-600">52W Low</div>
                <div className="font-medium">₹{stock.yearLow.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <div className="text-gray-600">P/E Ratio</div>
                <div className="font-medium">{stock.pe}</div>
              </div>
              
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <div className="text-gray-600">EPS</div>
                <div className="font-medium">₹{stock.eps.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Charts */}
        <div className="w-full md:w-2/3">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Price Chart</h2>
              <div className="flex space-x-2">
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${timeRange === '1W' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => handleTimeRangeChange('1W')}
                >
                  1W
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${timeRange === '1M' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => handleTimeRangeChange('1M')}
                >
                  1M
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${timeRange === '3M' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => handleTimeRangeChange('3M')}
                >
                  3M
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${timeRange === '1Y' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => handleTimeRangeChange('1Y')}
                >
                  1Y
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${timeRange === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => handleTimeRangeChange('ALL')}
                >
                  ALL
                </button>
              </div>
            </div>

            {filteredData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return format(date, 'MMM d');
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `₹${value}`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toFixed(2)}`, 'Price']}
                      labelFormatter={(value) => formatDate(value)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="close" 
                      name="Price"
                      stroke={isPositiveChange ? "#10B981" : "#EF4444"} 
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-72">
                <p className="text-gray-500">No historical data available</p>
              </div>
            )}

            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold">About {stock.name}</h3>
              <p className="text-gray-700">
                {stock.name} ({stock.symbol}) is a leading company in the {stock.sector} sector. 
                The company has shown {isPositiveChange ? 'positive' : 'negative'} performance in the recent {timeRange} with a change of {percentChange.toFixed(2)}%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {buyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-bold">Buy {stock.symbol} Stock</h2>
            <form onSubmit={handleBuyStock}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Current Price:</label>
                <div className="py-2 px-3 bg-gray-100 rounded-md">
                  ₹{stock.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                />
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Cost:</span>
                  <span className="font-medium">₹{(stock.currentPrice * quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Available Cash:</span>
                  <span className="font-medium">₹{buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setBuyModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={stock.currentPrice * quantity > buyingPower}
                >
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  Confirm Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  FiInfo, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign, 
  FiBarChart2, 
  FiPercent,
  FiUser,
  FiUsers,
  FiCalendar,
  FiGlobe,
  FiActivity
} from 'react-icons/fi';
import StockChart from '@/app/components/StockChart';
import classNames from 'classnames';

export default function StockDetailPage() {
  const { stockId } = useParams();
  const { data: session } = useSession();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('charts');
  
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch(`/api/stocks/${stockId}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch stock data');
        }
        
        const data = await res.json();
        
        // For Adani Ports, add special handling for chart data
        if (data.symbol === 'ADANIPORTS') {
          data.csvDataPath = '/ChartsData/ADANIPORTS_2020_2023.csv';
        }
        
        setStock(data);
      } catch (error) {
        console.error('Error fetching stock details:', error);
        setErrorMessage('Failed to load stock data');
      } finally {
        setLoading(false);
      }
    };
    
    if (stockId) {
      fetchStock();
    }
  }, [stockId]);
  
  const handleBuy = async (e) => {
    e.preventDefault();
    
    if (quantity <= 0) {
      setErrorMessage('Quantity must be at least 1');
      setSuccessMessage('');
      return;
    }
    
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stockId: stock._id,
          type: 'buy',
          quantity: parseInt(quantity)
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccessMessage(data.message || 'Purchase successful!');
        setErrorMessage('');
        setQuantity(1);
      } else {
        setErrorMessage(data.message || 'Failed to complete purchase');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error purchasing stock:', error);
      setErrorMessage('An error occurred while processing your purchase');
      setSuccessMessage('');
    }
  };
  
  const renderFinancialMetric = (label, value, format = 'number', icon = null) => {
    // Handle undefined or null values
    if (value === undefined || value === null) {
      return <span className="text-base font-semibold text-gray-700">N/A</span>;
    }
    
    let formattedValue;
    
    switch (format) {
      case 'currency':
        formattedValue = `$${value.toLocaleString()}`;
        break;
      case 'percentage':
        formattedValue = `${value.toFixed(2)}%`;
        break;
      case 'decimal':
        formattedValue = value.toFixed(2);
        break;
      case 'large':
        formattedValue = value >= 1e9 
          ? `$${(value / 1e9).toFixed(2)}B`
          : value >= 1e6 
            ? `$${(value / 1e6).toFixed(2)}M`
            : `$${value.toLocaleString()}`;
        break;
      case 'ratio':
        formattedValue = value.toFixed(2);
        break;
      default:
        formattedValue = value.toLocaleString();
    }
    
    return (
      <div className="py-4 sm:py-5 border-b border-gray-100">
        <div className="flex items-center">
          {icon && <div className="mr-3 text-gray-600 text-lg">{icon}</div>}
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-gray-800 truncate">{label}</p>
          </div>
          <div className="ml-3 flex-shrink-0">
            <p className="text-base font-semibold text-gray-700">{formattedValue}</p>
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!stock) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiInfo className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {errorMessage || 'Stock not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header with basic stock info */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {stock.symbol} - {stock.name}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {stock.sector} · {stock.industry}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">${stock.currentPrice.toFixed(2)}</p>
            {/* Price indicator */}
            <div className="mt-1 flex items-center justify-end">
              {stock.priceHistory && stock.priceHistory.length > 1 && (() => {
                const todayPrice = stock.currentPrice;
                const yesterdayPrice = stock.priceHistory[1].price;
                const priceChange = todayPrice - yesterdayPrice;
                const percentChange = (priceChange / yesterdayPrice) * 100;
                
                return (
                  <div className={`flex items-center text-base ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {priceChange >= 0 ? (
                      <FiTrendingUp className="mr-1" />
                    ) : (
                      <FiTrendingDown className="mr-1" />
                    )}
                    <span className="font-medium">
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Alerts for messages */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content area */}
        <div className="md:w-3/4">
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('charts')}
                className={classNames(
                  activeTab === 'charts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg'
                )}
              >
                Charts
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={classNames(
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg'
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('financials')}
                className={classNames(
                  activeTab === 'financials'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg'
                )}
              >
                Financials
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={classNames(
                  activeTab === 'company'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg'
                )}
              >
                Company Info
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'charts' && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <StockChart stock={stock} />
              </div>
            )}
          
            {activeTab === 'overview' && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Company Overview</h3>
                    <p className="text-base text-gray-700 leading-relaxed">{stock.description}</p>
                    
                    <div className="mt-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Stock Statistics</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between text-base text-gray-700 mb-3">
                          <span className="font-medium">52 Week Range:</span>
                          <span>{stock.low52Week && stock.high52Week ? `$${stock.low52Week.toFixed(2)} - $${stock.high52Week.toFixed(2)}` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-base text-gray-700 mb-3">
                          <span className="font-medium">Market Cap:</span>
                          <span>
                            {stock.marketCap
                              ? (stock.marketCap >= 1e9
                                ? `$${(stock.marketCap / 1e9).toFixed(2)}B`
                                : stock.marketCap >= 1e6
                                  ? `$${(stock.marketCap / 1e6).toFixed(2)}M`
                                  : `$${stock.marketCap.toLocaleString()}`)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-base text-gray-700 mb-3">
                          <span className="font-medium">P/E Ratio:</span>
                          <span>{stock.peRatio ? stock.peRatio.toFixed(2) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-base text-gray-700 mb-3">
                          <span className="font-medium">EPS:</span>
                          <span>{stock.eps ? `$${stock.eps.toFixed(2)}` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-base text-gray-700">
                          <span className="font-medium">Dividend Yield:</span>
                          <span>{stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Trading Actions</h3>
                      <form onSubmit={handleBuy}>
                        <div className="mb-4">
                          <label htmlFor="quantity" className="block text-base font-medium text-gray-700 mb-2">
                            Quantity
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                              type="number"
                              id="quantity"
                              min="1"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value !== '' ? parseInt(e.target.value) : '')}
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-12 py-3 sm:text-base border-gray-300 rounded-md"
                              placeholder="Enter quantity"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-base">shares</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-base font-medium text-gray-700 mb-2">
                            <span>Price:</span>
                            <span>${stock.currentPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-base font-medium text-gray-700 mb-2">
                            <span>Total:</span>
                            <span>${(stock.currentPrice * quantity).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <button
                          type="submit"
                          className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Buy Now
                        </button>
                      </form>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Price History</h3>
                      {/* Simplified price history display */}
                      <div>
                        {stock.priceHistory && stock.priceHistory.length > 0 ? (
                          <div className="space-y-3">
                            {stock.priceHistory.slice(0, 5).map((price, index) => (
                              <div key={index} className="flex justify-between text-base">
                                <span className="text-gray-600">
                                  {new Date(price.date).toLocaleDateString()}
                                </span>
                                <span className="font-medium text-gray-800">
                                  ${price.price.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No price history available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'financials' && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Information</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-base font-semibold text-gray-700 uppercase tracking-wider">
                          Metric
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-base font-semibold text-gray-700 uppercase tracking-wider">
                          Value
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-base font-semibold text-gray-700 uppercase tracking-wider">
                          YoY Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-800">Revenue</td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                          {stock.revenue ? `$${stock.revenue.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {stock.revenueGrowth !== undefined && stock.revenueGrowth !== null ? (
                            <span className={`px-2 inline-flex text-base leading-5 font-medium rounded-full ${stock.revenueGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {stock.revenueGrowth >= 0 ? '+' : ''}{stock.revenueGrowth.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-800">Net Income</td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                          {stock.netIncome ? `$${stock.netIncome.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {stock.netIncomeGrowth !== undefined && stock.netIncomeGrowth !== null ? (
                            <span className={`px-2 inline-flex text-base leading-5 font-medium rounded-full ${stock.netIncomeGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {stock.netIncomeGrowth >= 0 ? '+' : ''}{stock.netIncomeGrowth.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-800">Profit Margin</td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                          {stock.profitMargin !== undefined ? `${stock.profitMargin.toFixed(2)}%` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {stock.profitMarginGrowth !== undefined && stock.profitMarginGrowth !== null ? (
                            <span className={`px-2 inline-flex text-base leading-5 font-medium rounded-full ${stock.profitMarginGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {stock.profitMarginGrowth >= 0 ? '+' : ''}{stock.profitMarginGrowth.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'company' && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Company Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">About {stock.name}</h4>
                      <p className="text-base text-gray-700 leading-relaxed">{stock.description || 'No description available.'}</p>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Industry</h4>
                      <p className="text-base text-gray-700">{stock.industry || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Sector</h4>
                      <p className="text-base text-gray-700">{stock.sector || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Company Headquarters</h4>
                      <p className="text-base text-gray-700">{stock.country || 'Not available'}</p>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">CEO</h4>
                      <p className="text-base text-gray-700">{stock.ceo || 'Not available'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Founded</h4>
                      <p className="text-base text-gray-700">{stock.yearFounded || 'Not available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Stock Summary</h3>
            <dl className="mt-2 text-base">
              <div className="py-3 flex justify-between">
                <dt className="text-gray-600">Open</dt>
                <dd className="text-gray-900 font-medium">
                  {stock.open ? `$${stock.open.toFixed(2)}` : 'N/A'}
                </dd>
              </div>
              <div className="py-3 flex justify-between border-t border-gray-100">
                <dt className="text-gray-600">Previous Close</dt>
                <dd className="text-gray-900 font-medium">
                  {stock.previousClose ? `$${stock.previousClose.toFixed(2)}` : 'N/A'}
                </dd>
              </div>
              <div className="py-3 flex justify-between border-t border-gray-100">
                <dt className="text-gray-600">Volume</dt>
                <dd className="text-gray-900 font-medium">
                  {stock.volume ? stock.volume.toLocaleString() : 'N/A'}
                </dd>
              </div>
              <div className="py-3 flex justify-between border-t border-gray-100">
                <dt className="text-gray-600">Avg. Volume</dt>
                <dd className="text-gray-900 font-medium">
                  {stock.avgVolume ? stock.avgVolume.toLocaleString() : 'N/A'}
                </dd>
              </div>
              <div className="py-3 flex justify-between border-t border-gray-100">
                <dt className="text-gray-600">Day's Range</dt>
                <dd className="text-gray-900 font-medium">
                  {stock.dayLow && stock.dayHigh 
                    ? `$${stock.dayLow.toFixed(2)} - $${stock.dayHigh.toFixed(2)}`
                    : 'N/A'}
                </dd>
              </div>
              <div className="py-3 flex justify-between border-t border-gray-100">
                <dt className="text-gray-600">52 Week Range</dt>
                <dd className="text-gray-900 font-medium">
                  {stock.low52Week && stock.high52Week 
                    ? `$${stock.low52Week.toFixed(2)} - $${stock.high52Week.toFixed(2)}`
                    : 'N/A'}
                </dd>
              </div>
              <div className="py-3 flex justify-between border-t border-gray-100">
                <dt className="text-gray-600">Beta</dt>
                <dd className="text-gray-900 font-medium">
                  {stock.beta ? stock.beta.toFixed(2) : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = `/dashboard/portfolio?addStock=${stock._id}`}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add to Watchlist
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setTimeout(() => {
                    document.getElementById('quantity')?.focus();
                  }, 100);
                }}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Buy Stock
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
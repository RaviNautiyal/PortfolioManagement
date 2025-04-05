import { useState, useEffect } from 'react';
import { FaTimes, FaChartLine, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import TradeForm from './TradeForm';

export default function StockModal({ stockId, isOpen, onClose }) {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'trade'
  
  useEffect(() => {
    if (isOpen && stockId) {
      fetchStockDetails();
    }
  }, [isOpen, stockId]);
  
  const fetchStockDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/stocks/${stockId}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch stock details');
      }
      
      const data = await res.json();
      setStock(data);
    } catch (err) {
      console.error('Error fetching stock:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Format large numbers
  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };
  
  // Format percentage
  const formatPercent = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="stock-modal" role="dialog" aria-modal="true">
      <div 
        className="flex items-center justify-center min-h-screen p-4 text-center"
        onClick={onClose}
      >
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        
        {/* Modal content */}
        <div 
          className="inline-block w-full max-w-2xl bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              {loading ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Loading...
                </span>
              ) : (
                <>
                  {stock?.symbol} - {stock?.name}
                </>
              )}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Loading state */}
          {loading && (
            <div className="p-6 text-center">
              <FaSpinner className="animate-spin mx-auto text-3xl text-blue-500 mb-4" />
              <p className="text-gray-500">Loading stock data...</p>
            </div>
          )}
          
          {/* Error state */}
          {!loading && error && (
            <div className="p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchStockDetails}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Content */}
          {!loading && !error && stock && (
            <>
              {/* Tabs */}
              <div className="border-b">
                <nav className="flex">
                  <button
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'details'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('details')}
                  >
                    <span className="flex items-center">
                      <FaChartLine className="mr-2" />
                      Details
                    </span>
                  </button>
                  <button
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'trade'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('trade')}
                  >
                    <span className="flex items-center">
                      <FaMoneyBillWave className="mr-2" />
                      Trade
                    </span>
                  </button>
                </nav>
              </div>
              
              {/* Tab content */}
              {activeTab === 'details' && (
                <div className="p-6">
                  {/* Price Section */}
                  <div className="mb-6">
                    <div className="text-3xl font-bold flex items-center">
                      {formatCurrency(stock.currentPrice)}
                      <span 
                        className={`ml-2 text-sm px-2 py-1 rounded-full ${
                          stock.change >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {formatPercent(stock.changePercent)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">Last updated: {new Date(stock.lastUpdated).toLocaleString()}</p>
                  </div>
                  
                  {/* Stock Info Grid */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Market Cap</h4>
                      <p className="font-semibold">{formatCurrency(stock.marketCap)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Volume</h4>
                      <p className="font-semibold">{formatNumber(stock.volume)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">52 Week High</h4>
                      <p className="font-semibold">{formatCurrency(stock.high52Week)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">52 Week Low</h4>
                      <p className="font-semibold">{formatCurrency(stock.low52Week)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">P/E Ratio</h4>
                      <p className="font-semibold">{stock.pe ? stock.pe.toFixed(2) : 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Dividend Yield</h4>
                      <p className="font-semibold">{stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* About Section */}
                  <div>
                    <h4 className="font-medium mb-2">About {stock.name}</h4>
                    <p className="text-sm text-gray-600">
                      {stock.description || `${stock.name} (${stock.symbol}) is listed on the ${stock.exchange || 'stock exchange'} and is part of the ${stock.sector || 'N/A'} sector.`}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end mt-6 space-x-2">
                    <button
                      onClick={() => setActiveTab('trade')}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('trade');
                        // If we had a tradeType state, we would set it to 'sell' here
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'trade' && (
                <TradeForm
                  stock={stock}
                  action="buy" // Default to buy, could be state-controlled
                  onClose={() => setActiveTab('details')}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 